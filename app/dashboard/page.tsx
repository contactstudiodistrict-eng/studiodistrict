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

  const [profileResult, bookingsResult] = await Promise.all([
    supabase.from('users').select('full_name, wallet_balance').eq('id', user.id).single(),
    supabase
      .from('bookings')
      .select(`
        id, booking_ref, status, booking_date, start_time, end_time,
        studio_id, shoot_type, total_amount, duration_hours,
        studios(studio_name, area, thumbnail_url),
        reviews(id, rating)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const profile  = profileResult.data
  const bookings = bookingsResult.data || []

  // IST = UTC+5:30; server time is UTC so offset manually
  const nowIST     = new Date(Date.now() + 330 * 60 * 1000)
  const todayIST   = nowIST.toISOString().slice(0, 10)
  const nowTimeIST = `${String(nowIST.getUTCHours()).padStart(2, '0')}:${String(nowIST.getUTCMinutes()).padStart(2, '0')}`

  function isStartPassed(booking_date: string, start_time: string): boolean {
    if (booking_date < todayIST) return true
    if (booking_date > todayIST) return false
    return start_time.slice(0, 5) <= nowTimeIST
  }

  function hasReview(b: any): boolean {
    const rev = b.reviews
    if (!rev) return false
    if (Array.isArray(rev)) return rev.some((r: any) => r.rating)
    return !!rev.rating
  }

  const cancelled = bookings.filter(b => b.status === 'declined' || b.status === 'cancelled')
  const active    = bookings.filter(b => b.status !== 'declined' && b.status !== 'cancelled')
  const upcoming  = active.filter(b => !isStartPassed(b.booking_date, b.start_time))
  const completed = active.filter(b => isStartPassed(b.booking_date, b.start_time))

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  }
  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-5 sm:py-8">

        {/* Header */}
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

        {/* ── Upcoming ── */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Upcoming {upcoming.length > 0 && <span className="text-gray-400 font-normal">({upcoming.length})</span>}
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
                const badge  = STATUS_BADGE[b.status]
                const studio = (b as any).studios
                return (
                  <Link key={b.id} href={`/bookings/${b.id}`}
                    className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-sm transition-all active:bg-slate-50">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-50 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 mt-0.5">📸</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink-900 truncate text-sm sm:text-base">{studio?.studio_name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {formatDate(b.booking_date)} · {formatTime(b.start_time)} · {b.duration_hours}h
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

        {/* ── Completed ── */}
        {completed.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Completed <span className="text-gray-400 font-normal">({completed.length})</span>
            </h2>
            <div className="space-y-3">
              {completed.map(b => {
                const badge    = STATUS_BADGE[b.status] ?? STATUS_BADGE.completed
                const studio   = (b as any).studios
                const studioId = (b as any).studio_id
                const reviewed = hasReview(b)
                return (
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all overflow-hidden">
                    {/* Summary row */}
                    <Link href={`/bookings/${b.id}`}
                      className="flex items-start gap-3 p-4"
                      style={{ textDecoration: 'none' }}>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">📸</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink-900 truncate text-sm">{studio?.studio_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {formatDate(b.booking_date)} · {formatTime(b.start_time)} · {b.duration_hours}h
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
                    {/* Action buttons */}
                    {(studioId || !reviewed) && (
                      <div className="flex gap-2 px-4 pb-4 pt-0">
                        {!reviewed && (
                          <Link
                            href={`/review/${b.id}`}
                            className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                            style={{ textDecoration: 'none' }}
                          >
                            ⭐ Write review
                          </Link>
                        )}
                        {studioId && (
                          <Link
                            href={`/studios/${studioId}/book?rebook=${b.id}`}
                            className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                            style={{ background: '#84cc16', color: '#111827', textDecoration: 'none' }}
                          >
                            Book again →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Cancelled ── */}
        {cancelled.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Cancelled <span className="text-gray-400 font-normal">({cancelled.length})</span>
            </h2>
            <div className="space-y-2">
              {cancelled.map(b => {
                const badge    = STATUS_BADGE[b.status]
                const studio   = (b as any).studios
                const studioId = (b as any).studio_id
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 opacity-70 hover:opacity-100 transition-opacity">
                    <Link href={`/bookings/${b.id}`} className="flex items-center gap-3 flex-1 min-w-0" style={{ textDecoration: 'none' }}>
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">📸</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-600 truncate text-sm">{studio?.studio_name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{formatDate(b.booking_date)} · {b.shoot_type}</div>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.classes}`}>{badge.label}</span>
                    </Link>
                    {studioId && (
                      <Link
                        href={`/studios/${studioId}/book`}
                        className="flex-shrink-0 ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700 transition-colors"
                        style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                      >
                        Try again
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state when no bookings at all */}
        {bookings.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h2>
            <p className="text-gray-400 text-sm mb-6">Find a studio and make your first booking</p>
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
              Browse studios
            </Link>
          </div>
        )}

      </main>
    </>
  )
}
