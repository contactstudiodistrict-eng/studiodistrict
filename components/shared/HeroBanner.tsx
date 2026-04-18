'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const TYPES = [
  { value: 'photography', label: 'Photography' },
  { value: 'videography', label: 'Videography' },
  { value: 'audio',       label: 'Podcast / Audio' },
  { value: 'music',       label: 'Music' },
  { value: 'mixed',       label: 'Multi-use' },
]
const AREAS = ['Velachery','OMR','Anna Nagar','T.Nagar','Adyar','Sholinganallur','Porur','Vadapalani','Mylapore','Tambaram']

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E")`

interface Props {
  thumbnails?: string[]
}

export function HeroBanner({ thumbnails = [] }: Props) {
  const router = useRouter()
  const [type, setType] = useState('')
  const [area, setArea] = useState('')
  const [date, setDate] = useState('')

  const today = new Date().toISOString().split('T')[0]

  // Fill to exactly 4 photos, cycling if fewer
  const photos: string[] = thumbnails.length > 0
    ? Array.from({ length: 4 }, (_, i) => thumbnails[i % thumbnails.length])
    : []

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (area) params.set('area', area)
    if (date) params.set('date', date)
    router.push(`/?${params.toString()}`)
  }

  const selectStyle = {
    border: '1px solid #f1f5f9',
    borderRadius: 12,
    color: '#111827',
    background: '#fff',
    backgroundImage: chevron,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
    appearance: 'none' as const,
  }

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 420, backgroundColor: '#0f172a' }}>

      {/* ── Photo grid background ─────────────────────────────────── */}
      {photos.length === 4 && (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {photos.map((src, i) => (
            <div key={i} className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.55) saturate(0.8)' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Overlay ──────────────────────────────────────────────── */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(10,15,28,0.60) 0%, rgba(10,15,28,0.72) 55%, rgba(10,15,28,0.85) 100%)' }} />

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
          style={{ backgroundColor: 'rgba(132,204,22,0.15)', color: '#a3e635', borderColor: 'rgba(132,204,22,0.35)' }}>
          🎬 Chennai&apos;s Studio Marketplace
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
          Book the perfect Studio<br />
          <span style={{ color: '#a3e635' }}>for your next Shoot</span>
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base max-w-xl mx-auto mb-8" style={{ color: '#cbd5e1' }}>
          Photography, Podcast, Video, and Music studios across Chennai —
          verified, bookable instantly.
        </p>

        {/* ── Structured search bar ─────────────────────────────── */}
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-1.5 shadow-2xl flex flex-col sm:flex-row gap-1.5">

            {/* Studio type */}
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="flex-1 min-w-0 px-4 py-3 text-sm focus:outline-none cursor-pointer"
              style={{ ...selectStyle, color: type ? '#111827' : '#9ca3af' }}
            >
              <option value="">Any studio type</option>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <div className="hidden sm:block w-px self-stretch my-1" style={{ backgroundColor: '#f1f5f9' }} />

            {/* Area */}
            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              className="flex-1 min-w-0 px-4 py-3 text-sm focus:outline-none cursor-pointer"
              style={{ ...selectStyle, color: area ? '#111827' : '#9ca3af' }}
            >
              <option value="">Any area</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <div className="hidden sm:block w-px self-stretch my-1" style={{ backgroundColor: '#f1f5f9' }} />

            {/* Date — "When?" */}
            <div className="flex-1 min-w-0 relative">
              {!date && (
                <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                  <span className="text-sm" style={{ color: '#9ca3af' }}>📅 When?</span>
                </div>
              )}
              <input
                type="date"
                value={date}
                min={today}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 text-sm focus:outline-none rounded-xl"
                style={{
                  color: date ? '#111827' : 'transparent',
                  border: '1px solid #f1f5f9',
                  background: 'white',
                }}
                onFocus={e => { e.currentTarget.style.color = '#111827' }}
                onBlur={e  => { if (!e.currentTarget.value) e.currentTarget.style.color = 'transparent' }}
              />
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="flex-shrink-0 px-7 py-3 rounded-xl text-sm font-bold transition-colors"
              style={{ backgroundColor: '#84cc16', color: '#111827' }}
            >
              Search →
            </button>
          </div>
        </form>

        {/* ── Trust strip ──────────────────────────────────────── */}
        <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-7 mt-6 text-xs" style={{ color: '#94a3b8' }}>
          {['Verified studios', 'Instant confirmation', 'Pay after booking'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <span style={{ color: '#84cc16' }}>✓</span> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
