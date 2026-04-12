// app/api/twilio/webhook/route.ts
// Handles: "YES" or "NO" replies from studio owner
// The last message they received has the 8-char code, so they just reply YES/NO
// We find the most recent PENDING booking for their phone number
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPaymentLink, sendBookingDeclined } from '@/lib/whatsapp'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const body     = (formData.get('Body') as string || '').trim()
    const from     = (formData.get('From') as string || '') // whatsapp:+919994390035

    console.log('[Twilio webhook] From:', from, '| Body:', JSON.stringify(body))

    if (!body || !from) return twiml('ok')

    const parts   = body.trim().split(/\s+/)
    const command = parts[0].toUpperCase()
    const codeArg = parts[1]?.toLowerCase() // optional 8-char code

    // Only handle YES / NO (+ legacy CONFIRM / DECLINE)
    const isConfirm = ['YES', 'Y', 'CONFIRM'].includes(command)
    const isDecline = ['NO', 'N', 'DECLINE'].includes(command)

    if (!isConfirm && !isDecline) {
      return twiml(
        'Hi! Reply *YES* to confirm a booking or *NO* to decline.\n\nThis is the Studio District studio booking platform.'
      )
    }

    // Extract sender's phone number (strip whatsapp:+91 prefix)
    const senderRaw    = from.replace('whatsapp:+', '').replace('whatsapp:', '')
    const senderLast10 = senderRaw.slice(-10) // last 10 digits

    const adminClient = createAdminClient()

    // Find the booking:
    // 1. If they provided a code → match by last 8 chars of booking ID
    // 2. Otherwise → find most recent PENDING booking where studio owner_phone matches
    let booking: any = null

    if (codeArg && codeArg.length >= 6) {
      // Match by short code (last 8 chars of UUID)
      const { data, error } = await adminClient
        .from('bookings')
        .select('*, studios(studio_name, owner_phone, address, google_maps_link, account_number)')
        .ilike('id', `%${codeArg}`)
        .in('status', ['pending'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (!error) booking = data
    }

    if (!booking) {
      // Find by studio owner's phone number
      const { data: studios } = await adminClient
        .from('studios')
        .select('id')
        .or(`owner_phone.eq.${senderLast10},owner_phone.eq.91${senderLast10},owner_phone.ilike.%${senderLast10}`)

      if (studios && studios.length > 0) {
        const studioIds = studios.map((s: any) => s.id)
        const { data, error } = await adminClient
          .from('bookings')
          .select('*, studios(studio_name, owner_phone, address, google_maps_link, account_number)')
          .in('studio_id', studioIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (!error && data) booking = data
      }
    }

    if (!booking) {
      return twiml(
        `No pending booking found for your studio.\n\nIf you have a specific booking ID, reply:\nYES <code>\nor\nNO <code>`
      )
    }

    if (!['pending'].includes(booking.status)) {
      return twiml(`Booking ${booking.booking_ref} is already ${booking.status}. No action needed.`)
    }

    const appUrl      = process.env.NEXT_PUBLIC_APP_URL!
    const studio      = booking.studios
    const bookingDate = format(new Date(booking.booking_date), 'EEE, d MMM yyyy')
    const timeRange   = `${fmtTime(booking.start_time)} – ${fmtTime(booking.end_time)}`

    // ── CONFIRM ────────────────────────────────────────────────────────
    if (isConfirm) {
      await adminClient
        .from('bookings')
        .update({
          status:             'awaiting_payment',
          confirmed_at:       new Date().toISOString(),
          studio_wa_response: 'confirmed_via_whatsapp',
        })
        .eq('id', booking.id)

      const paymentUrl = `${appUrl}/bookings/${booking.id}/pay`

      // Send payment link to customer
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
        await adminClient
          .from('bookings')
          .update({ wa_payment_sent_at: new Date().toISOString() })
          .eq('id', booking.id)
        console.log('[webhook] ✅ Payment link sent to customer:', booking.customer_phone)
      } catch (err: any) {
        console.error('[webhook] ❌ Payment link failed:', err.message)
      }

      try {
        await adminClient.from('audit_logs').insert({
          action: 'booking_confirmed_via_whatsapp', entity_type: 'booking',
          entity_id: booking.id, new_value: { status: 'awaiting_payment' },
        })
      } catch (_) {}

      return twiml(
        `✅ Confirmed!\n\n${booking.customer_name} has been sent a payment link.\nBooking: ${booking.booking_ref}\n\nYou'll receive a message once they pay. 💰`
      )
    }

    // ── DECLINE ────────────────────────────────────────────────────────
    if (isDecline) {
      await adminClient
        .from('bookings')
        .update({
          status:             'declined',
          studio_wa_response: 'declined_via_whatsapp',
        })
        .eq('id', booking.id)

      try {
        await sendBookingDeclined({
          customerPhone: booking.customer_phone,
          studioName:    studio.studio_name,
          bookingDate,
          bookingRef:    booking.booking_ref,
          appUrl,
        })
      } catch (err: any) {
        console.error('[webhook] ❌ Decline notify failed:', err.message)
      }

      try {
        await adminClient.from('audit_logs').insert({
          action: 'booking_declined_via_whatsapp', entity_type: 'booking',
          entity_id: booking.id, new_value: { status: 'declined' },
        })
      } catch (_) {}

      return twiml(
        `❌ Declined.\n\n${booking.customer_name} has been notified.\nBooking: ${booking.booking_ref}`
      )
    }

    return twiml('ok')

  } catch (err: any) {
    console.error('[Twilio webhook] Unhandled:', err)
    return twiml('An error occurred. Please try again.')
  }
}

export async function GET() {
  return new NextResponse('Studio District WhatsApp webhook active ✅', { status: 200 })
}

function twiml(message: string) {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${esc(message)}</Message></Response>`,
    { status: 200, headers: { 'Content-Type': 'text/xml' } }
  )
}

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function fmtTime(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
