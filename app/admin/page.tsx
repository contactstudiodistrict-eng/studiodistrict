import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminApproveButtons from './AdminApproveButtons'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')

  // Verify admin
  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
  if (!admin) redirect('/')

  // Fetch overview stats
  const [
    { count: totalStudios },
    { count: pendingStudios },
    { count: totalBookings },
    { count: pendingBookings },
    { count: activeBanners },
    { data: rawRecentBookings },
    { data: rawPendingStudios },
    { data: rawBanners },
  ] = await Promise.all([
    supabase.from('studios').select('*', { count: 'exact', head: true }),
    supabase.from('studios').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('banners').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('bookings').select(`
      id, booking_ref, status, booking_date, total_amount, shoot_type, customer_name,
      studios(studio_name, area)
    `).order('created_at', { ascending: false }).limit(5),
    supabase.from('studios').select('id, studio_name, owner_name, area, studio_type, created_at')
      .eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('banners').select('id, type, title, is_active, starts_at, ends_at')
      .order('display_order', { ascending: true }).limit(5),
  ])
  const recentBookings = rawRecentBookings as any[] | null
  const pendingStudiosList = rawPendingStudios as any[] | null
  const bannersList = rawBanners as any[] | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.03em' }}>
            <span style={{ color: '#0f172a' }}>Studio</span><span style={{ color: '#84cc16' }}>District</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-700 text-xs font-bold">Admin</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="text-brand-600 font-semibold">Overview</Link>
          <Link href="/admin/studios" className="text-gray-500 hover:text-gray-700">Studios</Link>
          <Link href="/admin/bookings" className="text-gray-500 hover:text-gray-700">Bookings</Link>
          <Link href="/admin/banners" className="text-gray-500 hover:text-gray-700">Banners</Link>
          <Link href="/admin/payments" className="text-gray-500 hover:text-gray-700">Payments</Link>
          <Link href="/" className="text-gray-400 hover:text-gray-600">← Site</Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Platform Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Chennai · Studio District</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Studios', value: totalStudios || 0, sub: 'across Chennai', color: 'text-gray-900' },
            { label: 'Pending Approval', value: pendingStudios || 0, sub: 'need review', color: pendingStudios ? 'text-amber-600' : 'text-gray-900', alert: !!pendingStudios },
            { label: 'Total Bookings', value: totalBookings || 0, sub: 'all time', color: 'text-gray-900' },
            { label: 'Pending Requests', value: pendingBookings || 0, sub: 'awaiting studio', color: pendingBookings ? 'text-blue-600' : 'text-gray-900' },
            { label: 'Active Banners', value: activeBanners || 0, sub: 'on homepage', color: 'text-gray-900' },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-xl border p-5 ${stat.alert ? 'border-amber-200' : 'border-gray-100'}`}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{stat.label}</div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending studio approvals */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Studios Awaiting Approval</h2>
              {pendingStudios ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">{pendingStudios} pending</span>
              ) : null}
            </div>
            <div className="divide-y divide-gray-50">
              {(!pendingStudiosList || pendingStudiosList.length === 0) ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">No pending approvals 🎉</div>
              ) : (
                pendingStudiosList.map(studio => (
                  <div key={studio.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{studio.studio_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{studio.owner_name} · {studio.area} · {studio.studio_type}</div>
                    </div>
                    <AdminApproveButtons studioId={studio.id} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Banners overview */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Banners</h2>
              <Link href="/admin/banners" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">Manage →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(!bannersList || bannersList.length === 0) ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">No banners yet</div>
              ) : (
                bannersList.map((b: any) => (
                  <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span>{b.type === 'announcement' ? '📢' : b.type === 'offer' ? '🎁' : '✨'}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{b.title}</div>
                        <div className="text-xs text-gray-400">{b.type}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.is_active ? 'Active' : 'Draft'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent bookings */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(!recentBookings || recentBookings.length === 0) ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">No bookings yet</div>
              ) : (
                recentBookings.map(b => {
                  const s = (b as any).studios
                  const STATUS_COLOR: Record<string, string> = {
                    pending: 'bg-amber-100 text-amber-700',
                    awaiting_payment: 'bg-blue-100 text-blue-700',
                    paid: 'bg-green-100 text-green-700',
                    completed: 'bg-purple-100 text-purple-700',
                    declined: 'bg-red-100 text-red-600',
                  }
                  return (
                    <div key={b.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{b.customer_name}</div>
                        <div className="text-xs text-gray-400">{s?.studio_name} · {b.booking_date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">₹{b.total_amount?.toLocaleString('en-IN')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[b.status] || 'bg-gray-100 text-gray-500'}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
