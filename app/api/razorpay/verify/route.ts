// app/api/razorpay/verify/route.ts
// Called by PaymentForm after Razorpay checkout completes
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendBookingConfirmedCustomer, sendPaymentReceivedOwner } from '@/lib/whatsapp'
import { getReferralAmount } from '@/lib/referral-config'
import { format, addDays } from 'date-fns'
import crypto from 'crypto'

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = await req.json()

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Verify signature
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    console.error('[Verify] Signature mismatch for booking', booking_id)
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotency: skip if already paid
  const { data: existing } = await (admin as any)
    .from('bookings')
    .select('status')
    .eq('id', booking_id)
    .single()

  if (existing?.status === 'paid') {
    return NextResponse.json({ success: true })
  }

  // Update payment record
  await (admin as any)
    .from('payments')
    .update({
      razorpay_payment_id,
      status:  'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('booking_id', booking_id)

  // Mark booking paid (plain update — no join in update response)
  const { error: updateError } = await (admin as any)
    .from('bookings')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', booking_id)

  if (updateError) {
    console.error('[Verify] Booking update error:', updateError)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }

  // Fetch full booking + studio separately
  const { data: booking, error: fetchError } = await (admin as any)
    .from('bookings')
    .select('*, studios(*)')
    .eq('id', booking_id)
    .single()

  if (!booking || fetchError) {
    console.error('[Verify] Booking fetch error:', fetchError)
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const studio = booking.studios

  // Create payout record
  const payoutDate = addDays(new Date(), 1)
  const { data: payment } = await (admin as any)
    .from('payments')
    .select('id')
    .eq('booking_id', booking_id)
    .single()

  await (admin as any).from('payouts').insert({
    booking_id:  booking_id,
    studio_id:   booking.studio_id,
    payment_id:  payment?.id ?? null,
    amount:      booking.studio_payout_amount,
    status:      'pending',
    scheduled_for: payoutDate.toISOString(),
  })

  // WhatsApp notifications (non-blocking)
  const bookingDate = format(new Date(booking.booking_date), 'EEE, d MMM yyyy')
  const timeRange   = `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`

  sendBookingConfirmedCustomer({
    customerPhone: booking.customer_phone,
    studioName:    studio.studio_name,
    address:       studio.address,
    bookingDate,
    timeRange,
    shootType:     booking.shoot_type,
    bookingRef:    booking.booking_ref,
    mapsLink:      studio.google_maps_link,
    ownerPhone:    studio.owner_phone,
  }).catch(console.error)

  sendPaymentReceivedOwner({
    ownerPhone:   studio.owner_phone,
    customerName: booking.customer_name,
    bookingDate,
    timeRange,
    bookingRef:   booking.booking_ref,
    payoutAmount: booking.studio_payout_amount,
    payoutDate:   format(payoutDate, 'd MMM yyyy'),
    accountLast4: studio.account_number?.slice(-4),
  }).catch(console.error)

  // Referral rewards (non-blocking)
  handleReferralReward(admin, booking).catch(console.error)

  // Audit
  await (admin as any).from('audit_logs').insert({
    action:      'payment_received',
    entity_type: 'booking',
    entity_id:   booking_id,
    new_value:   { status: 'paid', razorpay_payment_id, razorpay_order_id },
  })

  console.log(`[Verify] ✅ Payment verified for ${booking.booking_ref}`)
  return NextResponse.json({ success: true })
}

async function handleReferralReward(admin: any, booking: any) {
  const { data: booker } = await admin
    .from('users')
    .select('referred_by')
    .eq('id', booking.user_id)
    .single()

  if (!booker?.referred_by) return

  const { count: prevBookings } = await admin
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', booking.user_id)
    .in('status', ['paid', 'completed'])
    .neq('id', booking.id)

  if ((prevBookings ?? 0) > 0) return

  const { data: referrerCode } = await admin
    .from('referral_codes')
    .select('user_id')
    .eq('code', booker.referred_by)
    .single()

  if (!referrerCode) return

  const referrerId   = referrerCode.user_id
  const rewardAmount = await getReferralAmount()

  await admin.from('wallet_credits').insert({ user_id: booking.user_id, amount: rewardAmount, type: 'referral_bonus', description: 'Welcome bonus — first booking via referral' })
  await admin.from('wallet_credits').insert({ user_id: referrerId, amount: rewardAmount, type: 'referral_reward', description: 'Referral reward — friend completed first booking' })
  await admin.from('referrals').update({ status: 'rewarded', rewarded_at: new Date().toISOString() }).eq('referred_user_id', booking.user_id)

  const { data: codeStats } = await admin.from('referral_codes').select('total_referrals, total_earned').eq('user_id', referrerId).single()
  if (codeStats) {
    await admin.from('referral_codes').update({ total_referrals: (codeStats.total_referrals || 0) + 1, total_earned: (codeStats.total_earned || 0) + rewardAmount }).eq('user_id', referrerId)
  }
}
