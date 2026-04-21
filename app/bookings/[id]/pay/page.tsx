// app/bookings/[id]/pay/page.tsx
import { notFound, redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createRazorpayOrder } from '@/lib/razorpay'
import { PaymentForm } from './PaymentForm'
import { format } from 'date-fns'

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const supabase    = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/bookings/${params.id}/pay`)

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, studios(studio_name, area)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!booking)                                                                    notFound()
  if ((booking as any).status === 'paid')                                         redirect(`/bookings/${params.id}`)
  if (!['confirmed', 'awaiting_payment'].includes((booking as any).status))      redirect(`/bookings/${params.id}`)

  const studio = (booking as any).studios

  // Razorpay not configured — show fallback
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return <ManualPaymentFallback booking={booking} studio={studio} />
  }

  // Re-use existing pending order if one exists, otherwise create new
  let orderId: string
  let orderAmount: number

  const { data: existingPayment } = await (adminClient as any)
    .from('payments')
    .select('razorpay_order_id, amount, status')
    .eq('booking_id', params.id)
    .eq('status', 'pending')
    .not('razorpay_order_id', 'is', null)
    .maybeSingle()

  const b = booking as any

  if (existingPayment?.razorpay_order_id) {
    orderId     = existingPayment.razorpay_order_id
    orderAmount = existingPayment.amount * 100 // stored in ₹, checkout needs paise
  } else {
    try {
      const order = await createRazorpayOrder({
        bookingId:         params.id,
        bookingRef:        b.booking_ref,
        totalAmountRupees: b.total_amount,
      })
      orderId     = order.id
      orderAmount = order.amount

      // Persist order record
      await (adminClient as any).from('payments').upsert({
        booking_id:           params.id,
        razorpay_order_id:    order.id,
        amount:               b.total_amount,
        platform_commission:  b.platform_fee,
        gst_on_commission:    b.gst_amount,
        studio_payout_amount: b.studio_payout_amount,
        status:               'pending',
      }, { onConflict: 'booking_id' })

      // Move booking to awaiting_payment
      await (adminClient as any)
        .from('bookings')
        .update({ status: 'awaiting_payment' })
        .eq('id', params.id)
        .eq('status', 'confirmed')

    } catch (err: any) {
      console.error('[Pay page] Order creation failed:', err.message)
      return <ManualPaymentFallback booking={booking} studio={studio} />
    }
  }

  const bookingDate = format(new Date(b.booking_date), 'EEE, d MMM yyyy')
  const timeRange   = `${formatTime(b.start_time)} – ${formatTime(b.end_time)}`

  return (
    <PaymentForm
      bookingId={params.id}
      bookingRef={b.booking_ref}
      studioName={studio.studio_name}
      studioArea={studio.area}
      bookingDate={bookingDate}
      timeRange={timeRange}
      shootType={b.shoot_type}
      subtotal={b.subtotal}
      platformFee={b.platform_fee}
      gstAmount={b.gst_amount}
      securityDeposit={b.security_deposit}
      totalAmount={b.total_amount}
      customerName={b.customer_name}
      customerPhone={b.customer_phone}
      customerEmail={b.customer_email}
      orderId={orderId}
      orderAmount={orderAmount}
      razorpayKeyId={process.env.RAZORPAY_KEY_ID!}
    />
  )
}

function ManualPaymentFallback({ booking, studio }: { booking: any; studio: any }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ background: '#0f172a', padding: '20px 24px' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            <span style={{ color: '#fff' }}>Studio</span><span style={{ color: '#a3e635' }}>District</span>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{studio.studio_name}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{studio.area} · {booking.booking_date}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{booking.booking_ref}</div>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ Payment system unavailable</div>
            <div>Please contact the studio directly to complete your payment. Your slot is reserved.</div>
          </div>
          <a href={`/bookings/${booking.id}`} style={{ display: 'block', marginTop: 16, padding: 14, borderRadius: 12, background: '#84cc16', color: '#111827', fontWeight: 700, fontSize: 14, textAlign: 'center', textDecoration: 'none' }}>
            View Booking Status →
          </a>
        </div>
      </div>
    </div>
  )
}
