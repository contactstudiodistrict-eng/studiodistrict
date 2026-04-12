// app/api/razorpay/webhook/route.ts
// Handles Razorpay payment events
// Configure in Razorpay Dashboard → Settings → Webhooks → https://studiodistrict.vercel.app/api/razorpay/webhook
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyRazorpayWebhook } from '@/lib/razorpay'
import { sendBookingConfirmedCustomer, sendPaymentReceivedOwner } from '@/lib/whatsapp'
import { format, addDays } from 'date-fns'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''

  // 1. Verify signature
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

  // 2. Handle payment_link.paid event
  if (payload.event === 'payment_link.paid') {
    try {
      const linkEntity = payload.payload?.payment_link?.entity
      const paymentEntity = payload.payload?.payment?.entity

      const bookingId = linkEntity?.notes?.booking_id
      const rzpPaymentId = paymentEntity?.id
      const rzpLinkId = linkEntity?.id
      const amountPaise = paymentEntity?.amount
      const paymentMethod = paymentEntity?.method

      if (!bookingId) {
        console.error('[Razorpay] No booking_id in webhook notes')
        return NextResponse.json({ error: 'No booking_id' }, { status: 400 })
      }

      // 3. Update payment record
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

      // 4. Update booking status to paid
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

      // 5. Create payout record (T+1 business day)
      const payoutDate = addDays(new Date(), 1)
      await adminClient.from('payouts').insert({
        booking_id: bookingId,
        studio_id: booking.studio_id,
        payment_id: payment?.id,
        amount: booking.studio_payout_amount,
        status: 'pending',
        scheduled_for: payoutDate.toISOString(),
      })

      // 6. Notify customer — booking confirmed
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

      // 7. Notify studio owner — payment received
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

      // 8. Audit log
      await adminClient.from('audit_logs').insert({
        action: 'payment_received',
        entity_type: 'booking',
        entity_id: bookingId,
        new_value: {
          status: 'paid',
          razorpay_payment_id: rzpPaymentId,
          amount: amountPaise,
        },
      })

      console.log(`[Razorpay] ✅ Payment processed for booking ${booking.booking_ref}`)
      return NextResponse.json({ received: true })

    } catch (err: any) {
      console.error('[Razorpay] Webhook processing error:', err)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  // Handle payment.failed
  if (payload.event === 'payment.failed') {
    const bookingId = payload.payload?.payment?.entity?.notes?.booking_id
    if (bookingId) {
      await adminClient.from('payments').update({ status: 'failed', webhook_payload: payload }).eq('booking_id', bookingId)
      console.log(`[Razorpay] Payment failed for booking ${bookingId}`)
    }
    return NextResponse.json({ received: true })
  }

  // Acknowledge all other events
  return NextResponse.json({ received: true })
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
