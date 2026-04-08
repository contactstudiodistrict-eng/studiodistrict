// app/admin/bookings/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatINR } from '@/lib/pricing'

const STATUS_CHIP: Record<string, string> = {
  pending:          'bg-amber-100 text-amber-700',
  confirmed:        'bg-blue-100 text-blue-700',
  awaiting_payment: 'bg-orange-100 text-orange-700',
  paid:             'bg-green-100 text-green-700',
  completed:        'bg-purple-100 text-purple-700',
  declined:         'bg-red-100 text-red-600',
  cancelled:        'bg-gray-100 text-gray-500',
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
  if (!admin) redirect('/')

  const statusFilter = searchParams.status || 'all'

  let query = supabase
    .from('bookings')
    .select('id, booking_ref, status, customer_name, customer_phone, booking_date, shoot_type, total_amount, studio_payout_amount, platform_fee, created_at, studios(studio_name, area)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (statusFilter !== 'all') query = query.eq('status', statusFilter)
  if (searchParams.q)         query = query.ilike('customer_name', `%${searchParams.q}%`)

  const { data: rawBookings } = await query
  const bookings = rawBookings as any[] | null

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-3">
          <Link href="/admin" className="text-gray-400 text-sm hover:text-gray-600">← Admin</Link>
          <h1 className="text-lg font-semibold text-gray-900">Booking Management</h1>
          <span className="text-sm text-gray-400">({bookings?.length || 0} results)</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all','pending','awaiting_payment','paid','completed','declined','cancelled'].map(s => (
            <Link key={s} href={`/admin/bookings?status=${s}`}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors
                ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {s.replace('_', ' ')}
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Booking Ref', 'Customer', 'Studio', 'Date', 'Shoot', 'Total', 'Commission', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(!bookings || bookings.length === 0) ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No bookings found</td></tr>
                ) : bookings.map(b => {
                  const s = (b as any).studios
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{b.booking_ref}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{b.customer_name}</div>
                        <div className="text-xs text-gray-400">{b.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{s?.studio_name}</div>
                        <div className="text-xs text-gray-400">{s?.area}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.booking_date)}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[100px] truncate">{b.shoot_type}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatINR(b.total_amount)}</td>
                      <td className="px-4 py-3 text-green-700 font-medium">{formatINR(b.platform_fee)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CHIP[b.status] || 'bg-gray-100 text-gray-500'}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/bookings/${b.id}`} target="_blank"
                          className="px-2 py-1 rounded text-xs text-gray-500 border border-gray-200 hover:bg-gray-50">
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary row */}
        {bookings && bookings.length > 0 && (
          <div className="mt-4 flex gap-6 text-sm text-gray-500 px-1">
            <span>Total revenue: <strong className="text-gray-800">{formatINR(bookings.reduce((s, b) => s + b.total_amount, 0))}</strong></span>
            <span>Platform commission: <strong className="text-green-700">{formatINR(bookings.reduce((s, b) => s + b.platform_fee, 0))}</strong></span>
          </div>
        )}
      </main>
    </div>
  )
}
