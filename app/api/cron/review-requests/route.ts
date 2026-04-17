// app/api/cron/review-requests/route.ts — triggered hourly by Vercel Cron
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateReviewToken } from '@/lib/reviews'
import { sendReviewRequest } from '@/lib/whatsapp'
import { format } from 'date-fns'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const admin = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studiodistrict.vercel.app'

  // Find bookings where session ended 2+ hours ago, no review requested yet
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  // Fetch paid/completed bookings with no review_requested_at
  const { data: bookings } = await admin
    .from('bookings')
    .select('id, booking_date, end_time, customer_name, customer_phone, studio_id, studios(studio_name)')
    .in('status', ['paid', 'completed'])
    .is('review_requested_at', null)
    .lte('booking_date', new Date().toISOString().split('T')[0])
    .limit(20)

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0

  for (const booking of bookings) {
    try {
      // Check if session end time has passed by 2+ hours
      const sessionEnd = new Date(`${booking.booking_date}T${booking.end_time}`)
      if (sessionEnd.getTime() > Date.now() - 2 * 60 * 60 * 1000) continue

      const studio = (booking as any).studios
      const token = generateReviewToken(booking.id)
      const reviewUrl = `${appUrl}/review/${booking.id}?token=${token}`

      // Check if review already exists (avoid duplicates)
      const { data: existingReview } = await admin
        .from('reviews')
        .select('id')
        .eq('booking_id', booking.id)
        .maybeSingle()

      if (!existingReview) {
        // Insert partial review row to store the token
        const { data: bookingFull } = await admin
          .from('bookings')
          .select('user_id')
          .eq('id', booking.id)
          .single()

        await admin.from('reviews').insert({
          booking_id: booking.id,
          studio_id: booking.studio_id,
          user_id: bookingFull?.user_id,
          review_token: token,
        })
      }

      // Send WhatsApp review request
      const bookingDate = format(new Date(booking.booking_date), 'dd MMM yyyy')
      await sendReviewRequest({
        customerPhone: booking.customer_phone,
        customerName: booking.customer_name,
        studioName: studio?.studio_name || 'the studio',
        bookingDate,
        reviewUrl,
      })

      // Mark as requested
      await admin
        .from('bookings')
        .update({ review_requested_at: new Date().toISOString() })
        .eq('id', booking.id)

      processed++
    } catch (err) {
      console.error(`[cron/review-requests] Failed for booking ${booking.id}:`, err)
    }
  }

  return NextResponse.json({ processed })
}
