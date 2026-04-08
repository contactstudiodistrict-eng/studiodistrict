// app/bookings/[id]/pay/page.tsx — Server Component
// This page is shown when Razorpay is not yet configured
// Once Razorpay is set up, this will redirect to the actual Razorpay payment link
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatINR } from '@/lib/pricing'

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

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

          {/* Razorpay coming soon notice */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 mb-5">
            <div className="font-semibold mb-1">🔧 Razorpay integration coming soon</div>
            <div>Payment processing will be available once Razorpay credentials are configured. Your booking is confirmed and will be held.</div>
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
