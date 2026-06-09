// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { calculatePricing, calculatePackagePricing, WALLET_CAP, REFERRAL_DISCOUNT } from '@/lib/pricing'
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
      package_id, package_name, package_price, referral_code, apply_wallet_credit,
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

    // 6. If package booking: verify package and use package pricing
    type BasePricing = { subtotal: number; platformFee: number; gstAmount: number; securityDeposit: number; totalAmount: number; studioPayout: number }
    let pricing: BasePricing = calculatePricing(studio.price_per_hour, Number(duration_hours))
    let verifiedPackageName: string | null = null
    let verifiedPackageId: string | null = null

    if (package_id) {
      const { data: pkg } = await adminClient
        .from('studio_packages')
        .select('id, package_name, price, duration_hours, is_active')
        .eq('id', package_id)
        .eq('studio_id', studio_id)
        .eq('is_active', true)
        .single()

      if (!pkg) {
        return NextResponse.json({ error: 'Package not found or no longer available' }, { status: 400 })
      }
      if (Number(package_price) !== (pkg as any).price) {
        return NextResponse.json({ error: 'Package price mismatch — please refresh and try again' }, { status: 400 })
      }
      pricing = calculatePackagePricing((pkg as any).price)
      verifiedPackageName = (pkg as any).package_name
      verifiedPackageId   = (pkg as any).id
    }

    // 7. Compute discounts server-side
    // Referral: check eligibility without applying yet
    let referralDiscountAmount = 0
    if (referral_code) {
      referralDiscountAmount = await computeReferralDiscount(adminClient, user.id, referral_code.toString().toUpperCase().trim())
    }

    // Wallet: fetch live balance and cap at WALLET_CAP
    let walletCreditApplied = 0
    if (apply_wallet_credit) {
      const { data: userRow } = await adminClient.from('users').select('wallet_balance').eq('id', user.id).single()
      const balance = (userRow as any)?.wallet_balance ?? 0
      walletCreditApplied = Math.min(balance, WALLET_CAP)
    }

    const adjustedTotal = Math.max(0, pricing.totalAmount - referralDiscountAmount - walletCreditApplied)

    // 8. Insert booking
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
        total_amount:         adjustedTotal,
        security_deposit:     pricing.securityDeposit,
        studio_payout_amount: pricing.studioPayout,
        referral_discount:    referralDiscountAmount,
        wallet_credit_applied: walletCreditApplied,
        package_id:           verifiedPackageId,
        package_name:         verifiedPackageName,
        package_price:        verifiedPackageId ? pricing.subtotal : null,
        status:               'pending',
      })
      .select('id, booking_ref')
      .single()

    if (insertErr || !booking) {
      console.error('[bookings] Insert error:', insertErr)
      return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 })
    }

    console.log('[bookings] Created:', booking.booking_ref, booking.id)

    // 9. Send WhatsApp to studio owner (fire and forget — use void, not .catch)
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
      packageName:   verifiedPackageName ?? undefined,
      packagePrice:  verifiedPackageId ? pricing.subtotal : undefined,
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

    // 10. Audit log — use await with try/catch, NOT .catch() on the builder
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

    // 11. Apply referral code if provided (non-fatal — booking still succeeds)
    if (referral_code && booking) {
      applyReferralCode(adminClient, user.id, referral_code.toString().toUpperCase().trim()).catch(err =>
        console.error('[bookings] Referral apply failed (non-fatal):', err.message)
      )
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
  return t.slice(0, 5)
}

async function computeReferralDiscount(admin: any, userId: string, code: string): Promise<number> {
  const { data: codeRow } = await admin.from('referral_codes').select('id, user_id').eq('code', code).single()
  if (!codeRow || codeRow.user_id === userId) return 0
  const { data: currentUser } = await admin.from('users').select('referred_by').eq('id', userId).single()
  if (currentUser?.referred_by) return 0
  const { count } = await admin.from('bookings').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).in('status', ['paid', 'completed'])
  if ((count ?? 0) > 0) return 0
  return REFERRAL_DISCOUNT
}

async function applyReferralCode(admin: any, userId: string, code: string) {
  const { data: codeRow } = await admin.from('referral_codes').select('id, user_id').eq('code', code).single()
  if (!codeRow || codeRow.user_id === userId) return

  const { data: currentUser } = await admin.from('users').select('referred_by').eq('id', userId).single()
  if (currentUser?.referred_by) return

  const { count } = await admin.from('bookings').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).in('status', ['paid', 'completed'])
  if ((count ?? 0) > 0) return

  await admin.from('users').update({ referred_by: code }).eq('id', userId)
  await admin.from('referrals').insert({
    referrer_user_id: codeRow.user_id,
    referred_user_id: userId,
    referral_code: code,
    status: 'pending',
  })
}
