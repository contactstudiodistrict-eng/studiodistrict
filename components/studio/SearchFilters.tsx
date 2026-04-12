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

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`

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
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const selectCls = [
    'w-full sm:w-auto flex-1 sm:flex-none',
    'px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white',
    'focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none',
    'pr-8 min-w-0 text-ink-900',
  ].join(' ')

  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile: stacked full-width; Desktop: inline row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:flex-wrap">
        <select
          value={type}
          onChange={e => { setType(e.target.value); apply(e.target.value, area) }}
          className={selectCls}
          style={{ backgroundImage: chevron, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select
          value={area}
          onChange={e => { setArea(e.target.value); apply(type, e.target.value) }}
          className={selectCls}
          style={{ backgroundImage: chevron, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          <option value="">All Areas</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {(type || area) && (
          <button
            onClick={() => { setType(''); setArea(''); apply('', '') }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
          >
            ✕ Clear filters
          </button>
        )}

        {isPending && (
          <div className="flex items-center justify-center text-xs text-slate-400">
            <span className="inline-block w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mr-1.5" />
            Updating…
          </div>
        )}
      </div>
    </div>
  )
}
