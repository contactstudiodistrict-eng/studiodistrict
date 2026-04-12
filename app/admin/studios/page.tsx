'use client'
// app/admin/studios/page.tsx
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { toast } from 'sonner'

const STATUS_CHIP: Record<string, string> = {
  live:      'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  draft:     'bg-gray-100 text-gray-500',
  suspended: 'bg-red-100 text-red-600',
}

type Studio = {
  id: string; studio_name: string; owner_name: string; owner_phone: string
  area: string; studio_type: string; price_per_hour: number
  status: string; rating: number; review_count: number; is_featured: boolean; created_at: string
}

export default function AdminStudiosPage() {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}><AdminStudiosInner /></Suspense>
}

function AdminStudiosInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') || 'all'

  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const fetchStudios = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('studios')
      .select('id, studio_name, owner_name, owner_phone, area, studio_type, price_per_hour, status, rating, review_count, is_featured, created_at')
      .order('created_at', { ascending: false })
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    const { data } = await query
    setStudios(data || [])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { fetchStudios() }, [fetchStudios])

  async function doAction(studioId: string, action: string) {
    setActing(studioId + action)
    try {
      const res = await fetch(`/api/admin/studios/${studioId}/${action}`, { redirect: 'manual' })
      // API returns a redirect — any 2xx or 3xx means success
      if (res.ok || res.status === 0 || res.type === 'opaqueredirect') {
        toast.success(action === 'approve' ? 'Studio approved and now live!' : `Studio ${action}ed.`)
        await fetchStudios()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Action failed')
      }
    } catch {
      toast.error('Action failed. Try again.')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-1">
          <Link href="/admin" className="text-gray-400 text-sm hover:text-gray-600">← Admin</Link>
          <h1 className="text-lg font-semibold text-gray-900">Studio Management</h1>
        </div>
        <div className="flex gap-2 mt-3">
          {['all','live','pending','draft','suspended'].map(s => (
            <Link key={s} href={`/admin/studios?status=${s}`}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors
                ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {s}
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left">
                {['Studio', 'Owner', 'Area', 'Type', 'Price/hr', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Loading…</td></tr>
              ) : studios.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No studios found</td></tr>
              ) : studios.map(studio => (
                <tr key={studio.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{studio.studio_name}</td>
                  <td className="px-4 py-3 text-gray-500">{studio.owner_name}<br /><span className="text-xs text-gray-400">{studio.owner_phone}</span></td>
                  <td className="px-4 py-3 text-gray-500">{studio.area}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{studio.studio_type}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">₹{studio.price_per_hour?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-500">{studio.review_count ? `⭐ ${Number(studio.rating).toFixed(1)}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CHIP[studio.status] || 'bg-gray-100 text-gray-500'}`}>
                      {studio.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {studio.status === 'pending' && (<>
                        <ActionButton label="Approve" cls="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          loading={acting === studio.id + 'approve'} onClick={() => doAction(studio.id, 'approve')} />
                        <ActionButton label="Reject" cls="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          loading={acting === studio.id + 'reject'} onClick={() => doAction(studio.id, 'reject')} />
                      </>)}
                      {studio.status === 'live' && (
                        <ActionButton label="Suspend" cls="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          loading={acting === studio.id + 'suspend'} onClick={() => doAction(studio.id, 'suspend')} />
                      )}
                      {studio.status === 'suspended' && (
                        <ActionButton label="Reactivate" cls="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          loading={acting === studio.id + 'reactivate'} onClick={() => doAction(studio.id, 'reactivate')} />
                      )}
                      <Link href={`/studios/${studio.id}`} target="_blank"
                        className="px-2 py-1 rounded text-xs text-gray-500 border border-gray-200 hover:bg-gray-50">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function ActionButton({ label, cls, loading, onClick }: { label: string; cls: string; loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading}
      className={`px-2 py-1 rounded text-xs border transition-colors disabled:opacity-50 ${cls}`}>
      {loading ? '…' : label}
    </button>
  )
}
