// app/api/razorpay/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyRazorpayWebhook } from '@/lib/razorpay'
import { sendBookingConfirmedCustomer, sendPaymentReceivedOwner, sendReferralRewardNotification } from '@/lib/whatsapp'
import { getReferralAmount } from '@/lib/referral-config'
import { format, addDays } from 'date-fns'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''

  if (!verifyRazorpayWebhook(rawBody, signature)) {
    console.error('[Razorpay] Invalid webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log('[Razorpay] Webhook received:', payload.event)

  const adminClient = createAdminClient()

  // Handle both order-based (payment.captured) and legacy link-based (payment_link.paid)
  const isOrderPayment = payload.event === 'payment.captured'
  const isLinkPayment  = payload.event === 'payment_link.paid'

  if (isOrderPayment || isLinkPayment) {
    try {
      const paymentEntity = payload.payload?.payment?.entity
      const linkEntity    = payload.payload?.payment_link?.entity

      // For orders, booking_id is in payment notes; for links, it's in link notes
      const bookingId     = paymentEntity?.notes?.booking_id ?? linkEntity?.notes?.booking_id
      const rzpPaymentId  = paymentEntity?.id
      const rzpLinkId     = linkEntity?.id
      const amountPaise   = paymentEntity?.amount
      const paymentMethod = paymentEntity?.method

      if (!bookingId) {
        console.error('[Razorpay] No booking_id in webhook notes')
        return NextResponse.json({ error: 'No booking_id' }, { status: 400 })
      }

      // Update payment record
      const { data: payment } = await adminClient
        .from('payments')
        .update({
          razorpay_payment_id: rzpPaymentId,
          payment_method: paymentMethod,
          status: 'paid',
          paid_at: new Date().toISOString(),
          webhook_payload: payload,
        })
        .eq('booking_id', bookingId)
        .select()
        .single()

      // Idempotency: if verify route already marked paid, skip re-processing
      const { data: existingBooking } = await adminClient
        .from('bookings').select('status').eq('id', bookingId).single()
      if ((existingBooking as any)?.status === 'paid') {
        console.log(`[Razorpay] Webhook: booking ${bookingId} already paid, skipping`)
        return NextResponse.json({ received: true })
      }

      // Update booking status to paid
      const { data: booking } = await adminClient
        .from('bookings')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select('*, studios(*)')
        .single()

      if (!booking) {
        console.error('[Razorpay] Booking not found:', bookingId)
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      const studio = (booking as any).studios

      // Create payout record (T+1 business day)
      const payoutDate = addDays(new Date(), 1)
      await adminClient.from('payouts').insert({
        booking_id: bookingId,
        studio_id: booking.studio_id,
        payment_id: payment?.id,
        amount: booking.studio_payout_amount,
        status: 'pending',
        scheduled_for: payoutDate.toISOString(),
      })

      // Notify customer
      const bookingDate = format(new Date(booking.booking_date), 'EEE, d MMM yyyy')
      await sendBookingConfirmedCustomer({
        customerPhone: booking.customer_phone,
        studioName: studio.studio_name,
        address: studio.address,
        bookingDate,
        timeRange: `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`,
        shootType: booking.shoot_type,
        bookingRef: booking.booking_ref,
        mapsLink: studio.google_maps_link,
        ownerPhone: studio.owner_phone,
      }).catch(console.error)

      // Notify studio owner
      await sendPaymentReceivedOwner({
        ownerPhone: studio.owner_phone,
        customerName: booking.customer_name,
        bookingDate,
        timeRange: `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`,
        bookingRef: booking.booking_ref,
        payoutAmount: booking.studio_payout_amount,
        payoutDate: format(payoutDate, 'd MMM yyyy'),
        accountLast4: studio.account_number?.slice(-4),
      }).catch(console.error)

      // ── Referral reward logic ──────────────────────────────────────────────
      try {
        const { data: booker } = await adminClient
          .from('users')
          .select('referred_by')
          .eq('id', booking.user_id)
          .single()

        if (booker?.referred_by) {
          // Count previous paid/completed bookings (excluding this one)
          const { count: prevBookings } = await adminClient
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', booking.user_id)
            .in('status', ['paid', 'completed'])
            .neq('id', bookingId)

          // Only reward on first booking
          if ((prevBookings ?? 0) === 0) {
            const { data: referrerCode } = await adminClient
              .from('referral_codes')
              .select('user_id')
              .eq('code', booker.referred_by)
              .single()

            if (referrerCode) {
              const referrerId = referrerCode.user_id
              const rewardAmount = await getReferralAmount()

              // Credit to referred user
              await adminClient.from('wallet_credits').insert({
                user_id: booking.user_id,
                amount: rewardAmount,
                type: 'referral_bonus',
                description: 'Welcome bonus — first booking via referral',
              })

              // Credit to referrer
              await adminClient.from('wallet_credits').insert({
                user_id: referrerId,
                amount: rewardAmount,
                type: 'referral_reward',
                description: 'Referral reward — friend completed first booking',
              })

              // Update referral record
              await adminClient
                .from('referrals')
                .update({ status: 'rewarded', rewarded_at: new Date().toISOString() })
                .eq('referred_user_id', booking.user_id)

              // Update referral_codes stats
              const { data: codeStats } = await adminClient
                .from('referral_codes')
                .select('total_referrals, total_earned')
                .eq('user_id', referrerId)
                .single()

              if (codeStats) {
                await adminClient
                  .from('referral_codes')
                  .update({
                    total_referrals: (codeStats.total_referrals || 0) + 1,
                    total_earned: (codeStats.total_earned || 0) + rewardAmount,
                  })
                  .eq('user_id', referrerId)
              }

              // Notify referrer via WhatsApp
              const { data: referrerProfile } = await adminClient
                .from('users')
                .select('full_name')
                .eq('id', referrerId)
                .single()

              const referredFirstName = booking.customer_name.split(' ')[0]
              // Get referrer's phone from their bookings (most recent)
              const { data: referrerBooking } = await adminClient
                .from('bookings')
                .select('customer_phone')
                .eq('user_id', referrerId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

              if (referrerBooking?.customer_phone) {
                await sendReferralRewardNotification({
                  referrerPhone: referrerBooking.customer_phone,
                  referredName: referredFirstName,
                  amount: rewardAmount,
                }).catch(console.error)
              }

              console.log(`[Razorpay] ✅ Referral rewards issued for booking ${booking.booking_ref}`)
            }
          }
        }
      } catch (refErr) {
        console.error('[Razorpay] Referral processing error (non-fatal):', refErr)
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        action: 'payment_received',
        entity_type: 'booking',
        entity_id: bookingId,
        new_value: { status: 'paid', razorpay_payment_id: rzpPaymentId, amount: amountPaise },
      })

      console.log(`[Razorpay] ✅ Payment processed for booking ${booking.booking_ref}`)
      return NextResponse.json({ received: true })

    } catch (err: any) {
      console.error('[Razorpay] Webhook processing error:', err)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  if (payload.event === 'payment.failed') {
    const bookingId = payload.payload?.payment?.entity?.notes?.booking_id
    if (bookingId) {
      await adminClient.from('payments').update({ status: 'failed', webhook_payload: payload }).eq('booking_id', bookingId)
      console.log(`[Razorpay] Payment failed for booking ${bookingId}`)
    }
    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true })
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
