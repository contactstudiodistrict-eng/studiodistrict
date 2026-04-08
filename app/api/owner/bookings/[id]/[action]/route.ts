// app/api/owner/bookings/[id]/[action]/route.ts
// Web-based alternative to WhatsApp CONFIRM/DECLINE
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendPaymentLink, sendBookingDeclined } from '@/lib/whatsapp'
import { format } from 'date-fns'

interface Props { params: { id: string; action: 'confirm' | 'decline' } }

export async function GET(req: NextRequest, { params }: Props) {
  const supabase = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const { id: bookingId, action } = params

  // Fetch booking + verify studio ownership
  const { data: booking, error } = await adminClient
    .from('bookings')
    .select('*, studios(id, studio_name, owner_id, owner_phone, address, google_maps_link)')
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    return NextResponse.redirect(new URL('/studio/dashboard?error=not_found', req.url))
  }

  const studio = (booking as any).studios

  // Verify this user owns the studio
  if (studio.owner_id !== user.id) {
    return NextResponse.redirect(new URL('/studio/dashboard?error=forbidden', req.url))
  }

  // Only act on pending bookings
  if (booking.status !== 'pending') {
    return NextResponse.redirect(new URL(`/studio/dashboard?error=already_${booking.status}`, req.url))
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const bookingDate = format(new Date(booking.booking_date), 'EEE, d MMM yyyy')
  const timeRange = `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`

  if (action === 'confirm') {
    await adminClient.from('bookings').update({
      status: 'awaiting_payment',
      confirmed_at: new Date().toISOString(),
      studio_wa_response: 'confirmed_via_web',
    }).eq('id', bookingId)

    // Send payment link to customer
    const paymentUrl = `${appUrl}/bookings/${bookingId}/pay`
    await sendPaymentLink({
      customerPhone: booking.customer_phone,
      studioName: studio.studio_name,
      bookingDate,
      timeRange,
      bookingRef: booking.booking_ref,
      totalAmount: booking.total_amount,
      securityDeposit: booking.security_deposit,
      paymentUrl,
    }).catch(console.error)

    // Update WA payment sent timestamp
    await adminClient.from('bookings').update({ wa_payment_sent_at: new Date().toISOString() }).eq('id', bookingId)

    await adminClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'booking_confirmed_via_web',
      entity_type: 'booking',
      entity_id: bookingId,
      new_value: { status: 'awaiting_payment' },
    })

    return NextResponse.redirect(new URL(`/studio/dashboard?confirmed=${booking.booking_ref}`, req.url))
  }

  if (action === 'decline') {
    await adminClient.from('bookings').update({
      status: 'declined',
      studio_wa_response: 'declined_via_web',
    }).eq('id', bookingId)

    await sendBookingDeclined({
      customerPhone: booking.customer_phone,
      studioName: studio.studio_name,
      bookingDate,
      bookingRef: booking.booking_ref,
      appUrl,
    }).catch(console.error)

    await adminClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'booking_declined_via_web',
      entity_type: 'booking',
      entity_id: bookingId,
      new_value: { status: 'declined' },
    })

    return NextResponse.redirect(new URL(`/studio/dashboard?declined=${booking.booking_ref}`, req.url))
  }

  return NextResponse.redirect(new URL('/studio/dashboard', req.url))
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
