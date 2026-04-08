// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { calculatePricing } from '@/lib/pricing'
import { sendBookingRequest } from '@/lib/whatsapp'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase    = createClient()
    const adminClient = createAdminClient()

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'You must be logged in to make a booking' }, { status: 401 })
    }

    // 2. Parse body
    const body = await req.json()
    console.log('[POST /api/bookings] received:', JSON.stringify(body))

    const {
      studio_id, customer_name, customer_phone, customer_email,
      booking_date, start_time, end_time, duration_hours, shoot_type, notes,
    } = body

    // 3. Validate required fields
    const missing: string[] = []
    if (!studio_id)      missing.push('studio_id')
    if (!customer_name)  missing.push('customer_name')
    if (!customer_phone) missing.push('customer_phone')
    if (!booking_date)   missing.push('booking_date')
    if (!start_time)     missing.push('start_time')
    if (!end_time)       missing.push('end_time')
    if (!duration_hours) missing.push('duration_hours')
    if (!shoot_type)     missing.push('shoot_type')

    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 })
    }

    // 4. Fetch studio
    const { data: studio, error: studioErr } = await adminClient
      .from('studios')
      .select('id, studio_name, area, owner_name, owner_phone, price_per_hour, status')
      .eq('id', studio_id)
      .eq('status', 'live')
      .single()

    if (studioErr || !studio) {
      return NextResponse.json({ error: 'Studio not found or not available' }, { status: 404 })
    }

    // 5. Check time overlap
    const { data: overlap } = await adminClient
      .from('bookings')
      .select('id')
      .eq('studio_id', studio_id)
      .eq('booking_date', booking_date)
      .not('status', 'in', '("declined","cancelled")')
      .limit(1)

    if (overlap && overlap.length > 0) {
      return NextResponse.json({ error: 'This slot is already taken. Please pick a different time.' }, { status: 409 })
    }

    // 6. Calculate pricing server-side
    const pricing = calculatePricing(studio.price_per_hour, Number(duration_hours))

    // 7. Insert booking
    const { data: booking, error: insertErr } = await adminClient
      .from('bookings')
      .insert({
        studio_id,
        user_id:              user.id,
        customer_name:        customer_name.trim(),
        customer_phone:       customer_phone.trim(),
        customer_email:       customer_email || null,
        booking_date,
        start_time,
        end_time,
        duration_hours:       Number(duration_hours),
        shoot_type,
        notes:                notes || null,
        studio_rate:          studio.price_per_hour,
        subtotal:             pricing.subtotal,
        platform_fee:         pricing.platformFee,
        gst_amount:           pricing.gstAmount,
        total_amount:         pricing.totalAmount,
        security_deposit:     pricing.securityDeposit,
        studio_payout_amount: pricing.studioPayout,
        status:               'pending',
      })
      .select('id, booking_ref')
      .single()

    if (insertErr || !booking) {
      console.error('[bookings] Insert error:', insertErr)
      return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 })
    }

    console.log('[bookings] Created:', booking.booking_ref, booking.id)

    // 8. Send WhatsApp to studio owner (fire and forget — use void, not .catch)
    const dateStr   = format(new Date(booking_date), 'EEE, d MMM yyyy')
    const timeRange = `${formatTime(start_time)} – ${formatTime(end_time)}`

    void sendBookingRequest({
      ownerPhone:    studio.owner_phone,
      studioName:    studio.studio_name,
      customerName:  customer_name,
      bookingDate:   dateStr,
      timeRange,
      durationHours: Number(duration_hours),
      shootType:     shoot_type,
      notes:         notes || 'None',
      payoutAmount:  pricing.studioPayout,
      bookingRef:    booking.booking_ref,
      bookingId:     booking.id,
    }).then(async (msg) => {
      console.log('[bookings] WhatsApp sent, SID:', msg.sid)
      // Store SID — use await with error handling, not .catch()
      const { error: updateErr } = await adminClient
        .from('bookings')
        .update({ wa_message_sid: msg.sid })
        .eq('id', booking.id)
      if (updateErr) console.error('[bookings] SID update failed:', updateErr.message)
    }).catch(err => {
      console.error('[bookings] WhatsApp failed (non-fatal):', err.message)
    })

    // 9. Audit log — use await with try/catch, NOT .catch() on the builder
    try {
      await adminClient.from('audit_logs').insert({
        user_id:     user.id,
        action:      'booking_created',
        entity_type: 'booking',
        entity_id:   booking.id,
        new_value:   { booking_ref: booking.booking_ref, status: 'pending' },
        ip_address:  req.headers.get('x-forwarded-for') || 'localhost',
      })
    } catch (auditErr) {
      console.error('[bookings] Audit log failed (non-fatal):', auditErr)
    }

    return NextResponse.json({
      success:     true,
      booking_id:  booking.id,
      booking_ref: booking.booking_ref,
    }, { status: 201 })

  } catch (err: any) {
    console.error('[POST /api/bookings] Unhandled:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page   = Number(searchParams.get('page') ?? 1)
  const limit  = Number(searchParams.get('limit') ?? 10)

  let q = supabase
    .from('bookings')
    .select('*, studios(studio_name, area, thumbnail_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) q = q.eq('status', status)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookings: data })
}

function formatTime(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
