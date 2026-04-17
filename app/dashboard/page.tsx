// app/dashboard/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { ReferralCard } from '@/components/referral/ReferralCard'
import Link from 'next/link'
import { formatINR } from '@/lib/pricing'

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  pending:          { label: 'Awaiting confirmation', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed:        { label: 'Confirmed',              classes: 'bg-green-50 text-green-700 border-green-200' },
  awaiting_payment: { label: 'Pay now',                classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  paid:             { label: 'Paid & confirmed',        classes: 'bg-green-50 text-green-700 border-green-200' },
  completed:        { label: 'Completed',               classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  declined:         { label: 'Declined',                classes: 'bg-red-50 text-red-700 border-red-200' },
  cancelled:        { label: 'Cancelled',               classes: 'bg-gray-50 text-gray-500 border-gray-200' },
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const [profileResult, bookingsResult, pendingReviewsResult] = await Promise.all([
    supabase.from('users').select('full_name, wallet_balance').eq('id', user.id).single(),
    supabase
      .from('bookings')
      .select(`
        id, booking_ref, status, booking_date, start_time, end_time,
        shoot_type, total_amount, duration_hours,
        studios(studio_name, area, thumbnail_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    // Bookings that are paid/completed but have no submitted review
    supabase
      .from('bookings')
      .select(`
        id, booking_ref, booking_date,
        studios(studio_name),
        reviews(id, rating)
      `)
      .eq('user_id', user.id)
      .in('status', ['paid', 'completed'])
      .order('booking_date', { ascending: false })
      .limit(5),
  ])

  const profile = profileResult.data
  const bookings = bookingsResult.data || []

  // Filter to only bookings with no rating submitted
  const pendingReviews = (pendingReviewsResult.data || []).filter((b: any) => {
    const rev = b.reviews
    if (!rev) return true
    if (Array.isArray(rev)) return rev.length === 0 || rev.every((r: any) => !r.rating)
    return !rev.rating
  }).slice(0, 3)

  const upcoming = bookings.filter(b => ['pending','confirmed','awaiting_payment','paid'].includes(b.status))
  const past = bookings.filter(b => ['completed','declined','cancelled'].includes(b.status))

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  }
  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-5 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
            Hey {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-slate-400 text-sm">Your studio bookings</p>
            {(profile?.wallet_balance ?? 0) > 0 && (
              <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                💰 Wallet: ₹{(profile?.wallet_balance ?? 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Referral card */}
        <ReferralCard />

        {/* Pending reviews */}
        {pendingReviews.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Leave a review</h2>
            <div className="space-y-2">
              {pendingReviews.map((b: any) => {
                const studio = b.studios
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-ink-900 truncate">{studio?.studio_name}</div>
                      <div className="text-xs text-slate-400">{formatDate(b.booking_date)}</div>
                    </div>
                    <Link
                      href={`/review/${b.id}`}
                      className="flex-shrink-0 px-3 py-1.5 bg-amber-400 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-500 transition-colors"
                      style={{ textDecoration: 'none' }}
                    >
                      ⭐ Rate
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Upcoming ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-gray-500 text-sm mb-4">No upcoming bookings</p>
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
                Browse studios
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => {
                const badge = STATUS_BADGE[b.status]
                const studio = (b as any).studios
                return (
                  <Link key={b.id} href={`/bookings/${b.id}`}
                    className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-sm transition-all active:bg-slate-50">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-50 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 mt-0.5">📸</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink-900 truncate text-sm sm:text-base">{studio?.studio_name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {formatDate(b.booking_date)} · {formatTime(b.start_time)}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badge.classes}`}>{badge.label}</span>
                        <span className="text-xs text-slate-400">{b.shoot_type}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-sm font-bold text-ink-900">{formatINR(b.total_amount)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-4">Past ({past.length})</h2>
            <div className="space-y-3">
              {past.map(b => {
                const badge = STATUS_BADGE[b.status]
                const studio = (b as any).studios
                return (
                  <Link key={b.id} href={`/bookings/${b.id}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all opacity-75 hover:opacity-100">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">📸</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-700 truncate">{studio?.studio_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(b.booking_date)} · {b.shoot_type}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badge.classes}`}>{badge.label}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
