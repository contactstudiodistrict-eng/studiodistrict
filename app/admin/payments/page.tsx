// app/admin/payments/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatINR } from '@/lib/pricing'

export default async function AdminPaymentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
  if (!admin) redirect('/')

  const [{ data: payments }, { data: payouts }] = await Promise.all([
    supabase.from('payments').select('*, bookings(booking_ref, customer_name, studios(studio_name))').order('created_at', { ascending: false }).limit(50),
    supabase.from('payouts').select('*, studios(studio_name, owner_name)').order('created_at', { ascending: false }).limit(50),
  ])

  const totalCollected = (payments || []).filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalCommission = (payments || []).filter(p => p.status === 'paid').reduce((s, p) => s + p.platform_commission, 0)
  const pendingPayouts = (payouts || []).filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  const STATUS_PAY: Record<string, string> = { paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-600', refunded: 'bg-gray-100 text-gray-500' }
  const STATUS_POUT: Record<string, string> = { paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', failed: 'bg-red-100 text-red-600' }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-400 text-sm hover:text-gray-600">← Admin</Link>
          <h1 className="text-lg font-semibold text-gray-900">Payments & Payouts</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Total Collected</div>
            <div className="text-2xl font-bold text-gray-900">{formatINR(totalCollected)}</div>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Platform Commission</div>
            <div className="text-2xl font-bold text-green-700">{formatINR(totalCommission)}</div>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pending Payouts</div>
            <div className="text-2xl font-bold text-amber-600">{formatINR(pendingPayouts)}</div>
          </div>
        </div>

        {/* Payments table */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Payment Ledger</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Booking Ref', 'Customer', 'Studio', 'Amount', 'Commission', 'GST', 'Method', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(!payments || payments.length === 0) ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No payments yet</td></tr>
                ) : payments.map(p => {
                  const b = (p as any).bookings
                  const s = b?.studios
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{b?.booking_ref?.slice(-10)}</td>
                      <td className="px-4 py-3 text-gray-700">{b?.customer_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{s?.studio_name || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatINR(p.amount)}</td>
                      <td className="px-4 py-3 text-green-700">{formatINR(p.platform_commission)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatINR(p.gst_on_commission)}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{p.payment_method || '—'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_PAY[p.status] || 'bg-gray-100 text-gray-500'}`}>{p.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payouts table */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Studio Payouts</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Studio', 'Owner', 'Amount', 'Scheduled', 'Method', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(!payouts || payouts.length === 0) ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No payouts yet</td></tr>
                ) : payouts.map(p => {
                  const s = (p as any).studios
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{s?.studio_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{s?.owner_name || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatINR(p.amount)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {p.scheduled_for ? new Date(p.scheduled_for).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{p.payout_method}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_POUT[p.status] || 'bg-gray-100 text-gray-500'}`}>{p.status}</span></td>
                      <td className="px-4 py-3">
                        {p.status === 'pending' && (
                          <button className="px-2 py-1 rounded text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">
                            Process
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
