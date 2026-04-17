// app/api/review/[bookingId]/route.ts — no-auth review via token
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyReviewToken } from '@/lib/reviews'
import { format } from 'date-fns'

interface Props { params: { bookingId: string } }

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

// GET — validate token + return booking info for the review form
export async function GET(req: NextRequest, { params }: Props) {
  const token = new URL(req.url).searchParams.get('token') || ''

  if (!verifyReviewToken(params.bookingId, token)) {
    return NextResponse.json({ error: 'Invalid or expired review link' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: booking } = await admin
    .from('bookings')
    .select('id, booking_date, start_time, end_time, shoot_type, studios(studio_name, area)')
    .eq('id', params.bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Check if already reviewed
  const { data: review } = await admin
    .from('reviews')
    .select('rating')
    .eq('booking_id', params.bookingId)
    .maybeSingle()

  if (review?.rating) {
    return NextResponse.json({ alreadyReviewed: true })
  }

  const studio = (booking as any).studios
  const bookingDate = format(new Date(booking.booking_date), 'dd MMM yyyy')
  const timeRange = `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`

  return NextResponse.json({
    studioName: studio?.studio_name,
    area: studio?.area,
    bookingDate,
    timeRange,
    shootType: booking.shoot_type,
  })
}

// POST — submit review
export async function POST(req: NextRequest, { params }: Props) {
  const body = await req.json()
  const { rating, comment, token } = body

  if (!verifyReviewToken(params.bookingId, token)) {
    return NextResponse.json({ error: 'Invalid or expired review link' }, { status: 401 })
  }

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check not already submitted
  const { data: existing } = await admin
    .from('reviews')
    .select('id, rating')
    .eq('booking_id', params.bookingId)
    .maybeSingle()

  if (existing?.rating) {
    return NextResponse.json({ error: 'Review already submitted' }, { status: 409 })
  }

  if (existing?.id) {
    // Update existing partial row (created by cron)
    const { error } = await admin
      .from('reviews')
      .update({
        rating,
        comment: comment?.trim() || null,
        is_verified: true,
      })
      .eq('id', existing.id)
      .is('rating', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    // Insert new review (fallback if cron hasn't run yet)
    const { data: booking } = await admin
      .from('bookings')
      .select('studio_id, user_id')
      .eq('id', params.bookingId)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const { error } = await admin.from('reviews').insert({
      booking_id: params.bookingId,
      studio_id: booking.studio_id,
      user_id: booking.user_id,
      rating,
      comment: comment?.trim() || null,
      is_verified: true,
      review_token: token,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
