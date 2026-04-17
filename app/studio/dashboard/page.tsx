// app/studio/dashboard/page.tsx — Server Component
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { ShareButtons } from '@/components/studio/ShareButtons'
import { formatINR } from '@/lib/pricing'
import Link from 'next/link'

const STATUS_CHIP: Record<string, { label: string; color: string }> = {
  pending:          { label: 'Pending',         color: 'bg-amber-100 text-amber-700' },
  confirmed:        { label: 'Confirmed',        color: 'bg-blue-100 text-blue-700' },
  awaiting_payment: { label: 'Awaiting Payment', color: 'bg-brand-100 text-brand-700' },
  paid:             { label: 'Paid ✓',           color: 'bg-green-100 text-green-700' },
  completed:        { label: 'Completed',        color: 'bg-purple-100 text-purple-700' },
  declined:         { label: 'Declined',         color: 'bg-red-100 text-red-600' },
  cancelled:        { label: 'Cancelled',        color: 'bg-gray-100 text-gray-500' },
}

export default async function OwnerDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/studio/dashboard')

  // Get owner's studios
  const { data: studios } = await supabase
    .from('studios')
    .select('id, studio_name, area, status, price_per_hour, rating, review_count, is_featured')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (!studios || studios.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">No studio listed yet</h1>
          <p className="text-gray-500 mb-8">List your studio on Studio District and start receiving bookings from Chennai creators.</p>
          <Link href="/studio/onboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors">
            List My Studio →
          </Link>
        </main>
      </>
    )
  }

  const studioIds = studios.map(s => s.id)

  // Get all bookings for this owner's studios
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('id, booking_ref, status, booking_date, start_time, end_time, shoot_type, customer_name, customer_phone, total_amount, studio_payout_amount, studio_id, created_at')
    .in('studio_id', studioIds)
    .order('created_at', { ascending: false })
    .limit(50)

  const bookings = allBookings || []

  // Calculate earnings stats
  const paidBookings    = bookings.filter(b => ['paid', 'completed'].includes(b.status))
  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const totalEarned     = paidBookings.reduce((sum, b) => sum + (b.studio_payout_amount || 0), 0)

  // This month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const thisMonthPaid = paidBookings.filter(b => b.booking_date >= monthStart)
  const thisMonthEarned = thisMonthPaid.reduce((sum, b) => sum + (b.studio_payout_amount || 0), 0)

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  }
  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  const pendingStudios = studios.filter(s => s.status === 'pending')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studiodistrict.in'

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Pending approval banner */}
        {pendingStudios.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⏳</span>
            <div>
              <div className="font-semibold text-amber-900 text-sm">
                {pendingStudios.length === 1 ? `${pendingStudios[0].studio_name} is` : 'Your studios are'} under review
              </div>
              <div className="text-amber-700 text-sm mt-0.5">
                Our team will approve your listing within 1–2 business days. You&apos;ll get an email and WhatsApp notification once it&apos;s live.
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif text-gray-900">Studio Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">{studios[0].studio_name}</p>
          </div>
          <Link href="/studio/onboard"
            className="px-4 py-2 rounded-lg border border-brand-400 text-brand-600 text-sm font-medium hover:bg-brand-50 transition-colors">
            + Add Studio
          </Link>
        </div>

        {/* Earnings overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'This month',    value: formatINR(thisMonthEarned), sub: `${thisMonthPaid.length} bookings`, highlight: true },
            { label: 'Total earned',  value: formatINR(totalEarned),     sub: 'all time' },
            { label: 'Pending',       value: String(pendingBookings.length), sub: 'awaiting reply', alert: pendingBookings.length > 0 },
            { label: 'Rating',        value: studios[0].rating ? `⭐ ${Number(studios[0].rating).toFixed(1)}` : '—', sub: `${studios[0].review_count} reviews` },
          ].map((stat, i) => (
            <div key={i} className={`rounded-xl border p-4 ${stat.highlight ? 'bg-brand-50 border-brand-200' : stat.alert ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.highlight ? 'text-brand-600' : stat.alert ? 'text-amber-600' : 'text-gray-900'}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Studios listing cards */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">My Studios</h2>
          <div className="space-y-3">
            {studios.map(studio => {
              const studioBookings = bookings.filter(b => b.studio_id === studio.id)
              const studioEarned = studioBookings.filter(b => ['paid','completed'].includes(b.status)).reduce((s, b) => s + b.studio_payout_amount, 0)
              const STATUS_COLOR: Record<string, string> = {
                live: 'bg-green-100 text-green-700 border-green-200',
                pending: 'bg-amber-100 text-amber-700 border-amber-200',
                draft: 'bg-gray-100 text-gray-500 border-gray-200',
                suspended: 'bg-red-100 text-red-600 border-red-200',
              }
              return (
                <div key={studio.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">📸</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{studio.studio_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLOR[studio.status] || 'bg-gray-100 text-gray-500'}`}>
                        {studio.status === 'live' ? '● Live' : studio.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{studio.area} · {formatINR(studio.price_per_hour)}/hr · {studioBookings.length} bookings · {formatINR(studioEarned)} earned</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/studios/${studio.id}`} target="_blank"
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                      View listing
                    </Link>
                    <Link href={`/studio/onboard?edit=${studio.id}`}
                      className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
                      Edit
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Pending requests — most important section */}
        {pendingBookings.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-gray-700">Action Required</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">{pendingBookings.length} new</span>
            </div>
            <div className="space-y-3">
              {pendingBookings.map(b => (
                <div key={b.id} className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{b.customer_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-mono">{b.booking_ref}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-600">{formatINR(b.studio_payout_amount)}</div>
                      <div className="text-xs text-gray-400">your payout</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-600 mb-4">
                    <div><span className="text-gray-400 block">Date</span>{formatDate(b.booking_date)}</div>
                    <div><span className="text-gray-400 block">Time</span>{formatTime(b.start_time)} – {formatTime(b.end_time)}</div>
                    <div><span className="text-gray-400 block">Shoot</span>{b.shoot_type}</div>
                  </div>

                  {/* WhatsApp instruction */}
                  <div className="bg-white rounded-lg border border-amber-100 p-3 mb-3 text-xs text-gray-600">
                    <div className="font-semibold text-gray-700 mb-1">📱 Reply on WhatsApp to respond:</div>
                    <div className="flex gap-3">
                      <code className="bg-green-50 text-green-700 px-2 py-1 rounded font-mono">CONFIRM {b.id.slice(0, 8)}…</code>
                      <span className="text-gray-400">or</span>
                      <code className="bg-red-50 text-red-600 px-2 py-1 rounded font-mono">DECLINE {b.id.slice(0, 8)}…</code>
                    </div>
                  </div>

                  {/* Quick action buttons (call API directly) */}
                  <div className="flex gap-2">
                    <OwnerActionButton bookingId={b.id} action="confirm" label="✓ Confirm" classes="flex-1 py-2.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors text-center" />
                    <OwnerActionButton bookingId={b.id} action="decline" label="Decline" classes="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors text-center" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All bookings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-700">All Bookings ({bookings.length})</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-gray-50 rounded-xl border border-gray-100 py-12 text-center px-6">
              <div className="text-4xl mb-3">📅</div>
              {studios.some(s => s.status === 'live') ? (
                <>
                  <p className="text-gray-700 font-semibold mb-1">Your studio is live — share it to get bookings!</p>
                  <p className="text-gray-400 text-sm mb-6">Send your listing link to photographers, filmmakers, and brands.</p>
                  <ShareButtons studioId={studios.find(s => s.status === 'live')!.id} studioName={studios.find(s => s.status === 'live')!.studio_name} appUrl={appUrl} />
                </>
              ) : (
                <p className="text-gray-500 text-sm">No bookings yet. Once your studio is approved and live, bookings will appear here.</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-50">
                    <tr>
                      {['Ref', 'Customer', 'Date', 'Shoot', 'Payout', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map(b => {
                      const chip = STATUS_CHIP[b.status] || { label: b.status, color: 'bg-gray-100 text-gray-500' }
                      return (
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">{b.booking_ref?.slice(-8)}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{b.customer_name}</div>
                            <div className="text-xs text-gray-400">{b.customer_phone}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {formatDate(b.booking_date)}<br />
                            <span className="text-xs text-gray-400">{formatTime(b.start_time)}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{b.shoot_type}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{formatINR(b.studio_payout_amount)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${chip.color}`}>{chip.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

// Inline client action component for confirm/decline
function OwnerActionButton({ bookingId, action, label, classes }: { bookingId: string; action: string; label: string; classes: string }) {
  return (
    <a href={`/api/owner/bookings/${bookingId}/${action}`} className={classes}>{label}</a>
  )
}
