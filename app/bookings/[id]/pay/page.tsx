// app/bookings/[id]/pay/page.tsx — Server Component
// Creates a Razorpay payment link and redirects the customer to it
import { notFound, redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createRazorpayPaymentLink } from '@/lib/razorpay'
import { formatINR } from '@/lib/pricing'

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/bookings/${params.id}/pay`)

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, studios(studio_name, area)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!booking) notFound()
  if (booking.status === 'paid') redirect(`/bookings/${params.id}`)
  if (!['confirmed', 'awaiting_payment'].includes(booking.status)) {
    redirect(`/bookings/${params.id}`)
  }

  const studio = (booking as any).studios

  // If Razorpay is configured, create link and redirect
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      // Check if a payment record with an existing link exists (avoid duplicate links)
      const { data: existingPayment } = await adminClient
        .from('payments')
        .select('razorpay_link_url, status')
        .eq('booking_id', params.id)
        .eq('status', 'pending')
        .not('razorpay_link_url', 'is', null)
        .single()

      let paymentUrl = existingPayment?.razorpay_link_url

      if (!paymentUrl) {
        // Create a new Razorpay payment link
        const link = await createRazorpayPaymentLink({
          bookingId: params.id,
          bookingRef: booking.booking_ref,
          customerName: booking.customer_name,
          customerPhone: booking.customer_phone,
          customerEmail: booking.customer_email ?? undefined,
          totalAmountRupees: booking.total_amount,
          description: `${studio.studio_name} · ${booking.booking_date} · ${booking.booking_ref}`,
        })

        paymentUrl = link.short_url

        // Upsert payment record
        await adminClient.from('payments').upsert({
          booking_id: params.id,
          razorpay_link_id: link.id,
          razorpay_link_url: link.short_url,
          amount: booking.total_amount,
          platform_commission: booking.platform_fee,
          gst_on_commission: booking.gst_amount,
          status: 'pending',
        }, { onConflict: 'booking_id' })
      }

      redirect(paymentUrl)
    } catch (err: any) {
      console.error('[Pay page] Razorpay error:', err.message)
      // Fall through to show manual page on error
    }
  }

  // Fallback — Razorpay not configured or failed
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-orange-500 px-6 py-5 text-white">
          <div className="font-serif text-xl mb-1">framr.</div>
          <div className="text-orange-100 text-sm">Secure payment</div>
        </div>

        <div className="p-6">
          <div className="mb-5">
            <div className="text-sm font-semibold text-gray-500 mb-1">Booking</div>
            <div className="font-semibold text-gray-900">{studio.studio_name}</div>
            <div className="text-sm text-gray-500">{studio.area} · {booking.booking_date} · {booking.shoot_type}</div>
            <div className="font-mono text-xs text-gray-400 mt-1">{booking.booking_ref}</div>
          </div>

          <div className="border-t border-gray-50 pt-4 mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Studio charges</span>
              <span>{formatINR(booking.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Platform fee</span>
              <span>{formatINR(booking.platform_fee)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">GST</span>
              <span>{formatINR(booking.gst_amount)}</span>
            </div>
            {booking.security_deposit > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Security deposit</span>
                <span>{formatINR(booking.security_deposit)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3 mt-2">
              <span>Total</span>
              <span className="text-orange-600">{formatINR(booking.total_amount)}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 mb-5">
            <div className="font-semibold mb-1">⚠️ Payment system unavailable</div>
            <div>Please contact the studio directly to complete your payment. Your slot is reserved.</div>
          </div>

          <a href={`/bookings/${params.id}`}
            className="block w-full py-3 text-center rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors">
            View Booking Status →
          </a>
        </div>
      </div>
    </div>
  )
}
