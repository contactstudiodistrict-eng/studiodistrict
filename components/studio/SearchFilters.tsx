'use client'
// components/studio/SearchFilters.tsx
import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'

const AREAS = ['Velachery', 'OMR', 'Anna Nagar', 'T.Nagar', 'Adyar', 'Sholinganallur', 'Porur', 'Vadapalani', 'Mylapore', 'Tambaram']
const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'photography', label: '📸 Photography' },
  { value: 'videography', label: '🎬 Videography' },
  { value: 'audio', label: '🎙 Podcast/Audio' },
  { value: 'music', label: '🎵 Music' },
  { value: 'mixed', label: '🎭 Multi-use' },
]

export function SearchFilters({ initialParams }: { initialParams: Record<string, string | undefined> }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState(initialParams.type || '')
  const [area, setArea] = useState(initialParams.area || '')

  function apply(newType: string, newArea: string) {
    const params = new URLSearchParams()
    if (newType) params.set('type', newType)
    if (newArea) params.set('area', newArea)
    if (initialParams.q) params.set('q', initialParams.q)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {/* Studio type filter */}
      <select
        value={type}
        onChange={e => { setType(e.target.value); apply(e.target.value, area) }}
        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none pr-8"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      {/* Area filter */}
      <select
        value={area}
        onChange={e => { setArea(e.target.value); apply(type, e.target.value) }}
        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none pr-8"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        <option value="">All Areas</option>
        {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      {/* Active filter chips */}
      {(type || area) && (
        <button
          onClick={() => { setType(''); setArea(''); apply('', '') }}
          className="px-3 py-2 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors flex items-center gap-1"
        >
          ✕ Clear filters
        </button>
      )}

      {isPending && <div className="flex items-center text-xs text-gray-400">Updating…</div>}
    </div>
  )
}
