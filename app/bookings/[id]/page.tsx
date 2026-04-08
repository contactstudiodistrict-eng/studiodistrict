// app/bookings/[id]/page.tsx — Server Component shell
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { BookingStatusCard } from '@/components/booking/BookingStatusCard'

interface Props { params: { id: string } }

export default async function BookingStatusPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id, booking_ref, status, customer_name, customer_phone,
      booking_date, start_time, end_time, duration_hours,
      shoot_type, notes, total_amount, platform_fee, gst_amount,
      security_deposit, studio_payout_amount, subtotal,
      confirmed_at, paid_at, wa_payment_sent_at, created_at,
      studios(studio_name, area, address, owner_phone, google_maps_link, thumbnail_url)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !booking) notFound()

  return (
    <>
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <BookingStatusCard booking={booking as any} />
      </main>
    </>
  )
}
