// app/dashboard/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/shared/SiteHeader'
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

  const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).single()

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, booking_ref, status, booking_date, start_time, end_time,
      shoot_type, total_amount, duration_hours,
      studios(studio_name, area, thumbnail_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const upcoming = bookings?.filter(b => ['pending','confirmed','awaiting_payment','paid'].includes(b.status)) || []
  const past = bookings?.filter(b => ['completed','declined','cancelled'].includes(b.status)) || []

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
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-gray-900">
            Hey {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Your studio bookings</p>
        </div>

        {/* Upcoming */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Upcoming ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-gray-500 text-sm mb-4">No upcoming bookings</p>
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
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
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">📸</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{studio?.studio_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatDate(b.booking_date)} · {formatTime(b.start_time)} · {b.shoot_type}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-sm font-bold text-gray-900">{formatINR(b.total_amount)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badge.classes}`}>{badge.label}</span>
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
