// GET /api/owner/bookings/[id]/decline-via-link
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendBookingDeclined } from '@/lib/whatsapp'
import { format } from 'date-fns'

interface Props { params: { id: string } }

export async function GET(req: NextRequest, { params }: Props) {
  const adminClient = createAdminClient()
  const bookingId   = params.id
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL!

  const { data: booking, error } = await adminClient
    .from('bookings')
    .select('*, studios(studio_name)')
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    return new NextResponse(htmlPage('❌ Not Found', 'This booking link is invalid.', '#ef4444'), {
      status: 404, headers: { 'Content-Type': 'text/html' }
    })
  }

  if (booking.status !== 'pending') {
    return new NextResponse(
      htmlPage('Already Actioned', `Booking ${booking.booking_ref} is already ${booking.status}.`, '#f59e0b'),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const studio = (booking as any).studios

  await adminClient.from('bookings').update({ status: 'declined', studio_wa_response: 'declined_via_link' }).eq('id', bookingId)

  try {
    await sendBookingDeclined({
      customerPhone: booking.customer_phone,
      studioName:    studio.studio_name,
      bookingDate:   format(new Date(booking.booking_date), 'EEE, d MMM yyyy'),
      bookingRef:    booking.booking_ref,
      appUrl,
    })
  } catch (err: any) {
    console.error('[decline-link] WA notify failed:', err.message)
  }

  try {
    await adminClient.from('audit_logs').insert({
      action: 'booking_declined_via_link', entity_type: 'booking',
      entity_id: bookingId, new_value: { status: 'declined' },
    })
  } catch (_) {}

  return new NextResponse(
    htmlPage(
      '❌ Booking Declined',
      `Booking <strong>${booking.booking_ref}</strong> has been declined.<br><br>
       The customer has been notified via WhatsApp.`,
      '#dc2626'
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
<title>${title} — Studio District</title>
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
  <div class="brand">Studio District</div>
  <div class="icon">${title.startsWith("✅") ? "✅" : title.startsWith("❌") ? "❌" : "⚠️"}</div>
  <h1>${title.replace(/^[✅❌⚠️]\s*/, "")}</h1>
  <p>${body}</p>
  <div class="close">You can close this tab.</div>
</div>
</body>
</html>`
}
