// GET /api/owner/bookings/[id]/confirm-via-link
// Studio owner taps the ✅ link in WhatsApp → this fires, no login needed
// Uses a simple token approach: the booking ID itself is the token
// (Security: only someone who received the WhatsApp can have the link)
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPaymentLink, sendPaymentReceivedOwner } from '@/lib/whatsapp'
import { format, addDays } from 'date-fns'

interface Props { params: { id: string } }

export async function GET(req: NextRequest, { params }: Props) {
  const adminClient = createAdminClient()
  const bookingId   = params.id
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL!

  // 1. Fetch booking
  const { data: booking, error } = await adminClient
    .from('bookings')
    .select('*, studios(studio_name, owner_phone, owner_name, address, google_maps_link, account_number)')
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    return new NextResponse(htmlPage('❌ Booking Not Found', 'This booking link is invalid or has expired.', '#ef4444'), {
      status: 404, headers: { 'Content-Type': 'text/html' }
    })
  }

  const studio = (booking as any).studios

  // 2. Already actioned?
  if (booking.status !== 'pending') {
    const msgs: Record<string, string> = {
      awaiting_payment: 'already confirmed — payment link sent to customer.',
      paid:             'already paid and locked.',
      declined:         'already declined.',
      cancelled:        'cancelled by the customer.',
      completed:        'already completed.',
    }
    return new NextResponse(
      htmlPage('✅ Already Actioned', `Booking ${booking.booking_ref} is ${msgs[booking.status] || booking.status}`, '#f59e0b'),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  }

  // 3. Update to awaiting_payment
  const { error: updateErr } = await adminClient
    .from('bookings')
    .update({ status: 'awaiting_payment', confirmed_at: new Date().toISOString(), studio_wa_response: 'confirmed_via_link' })
    .eq('id', bookingId)

  if (updateErr) {
    return new NextResponse(htmlPage('❌ Error', 'Failed to confirm booking. Please try again.', '#ef4444'), {
      status: 500, headers: { 'Content-Type': 'text/html' }
    })
  }

  // 4. Send payment link to customer
  const paymentUrl = `${appUrl}/bookings/${bookingId}/pay`
  const bookingDate = format(new Date(booking.booking_date), 'EEE, d MMM yyyy')
  const timeRange   = `${fmtTime(booking.start_time)} – ${fmtTime(booking.end_time)}`

  try {
    await sendPaymentLink({
      customerPhone:   booking.customer_phone,
      studioName:      studio.studio_name,
      bookingDate,
      timeRange,
      bookingRef:      booking.booking_ref,
      totalAmount:     booking.total_amount,
      securityDeposit: booking.security_deposit,
      paymentUrl,
    })
    // Update WA payment sent timestamp
    await adminClient.from('bookings').update({ wa_payment_sent_at: new Date().toISOString() }).eq('id', bookingId)
    console.log('[confirm-link] Payment link sent to customer:', booking.customer_phone)
  } catch (err: any) {
    console.error('[confirm-link] Failed to send payment link:', err.message)
  }

  // 5. Audit log
  try {
    await adminClient.from('audit_logs').insert({
      action: 'booking_confirmed_via_link', entity_type: 'booking',
      entity_id: bookingId, new_value: { status: 'awaiting_payment' },
    })
  } catch (_) {}

  // 6. Show success page to studio owner
  return new NextResponse(
    htmlPage(
      '✅ Booking Confirmed!',
      `Booking <strong>${booking.booking_ref}</strong> has been confirmed.<br><br>
       Customer: <strong>${booking.customer_name}</strong><br>
       Date: <strong>${bookingDate}</strong><br>
       Time: <strong>${timeRange}</strong><br><br>
       A payment link has been sent to the customer via WhatsApp.<br>
       You'll receive another message once they pay. 💰`,
      '#16a34a'
    ),
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  )
}

function htmlPage(title: string, body: string, color: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Framr</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
  .card { background: #fff; border-radius: 16px; padding: 32px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
  .icon { font-size: 52px; margin-bottom: 16px; }
  h1 { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 12px; }
  p { font-size: 15px; color: #6b7280; line-height: 1.7; }
  .brand { font-size: 24px; font-weight: 700; color: ${color}; margin-bottom: 24px; font-style: italic; }
  .close { margin-top: 24px; font-size: 13px; color: #9ca3af; }
</style>
</head>
<body>
<div class="card">
  <div class="brand">framr.</div>
  <div class="icon">${title.startsWith("✅") ? "✅" : title.startsWith("❌") ? "❌" : "⚠️"}</div>
  <h1>${title.replace(/^[✅❌⚠️]\s*/, "")}</h1>
  <p>${body}</p>
  <div class="close">You can close this tab.</div>
</div>
</body>
</html>`
}

function fmtTime(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
