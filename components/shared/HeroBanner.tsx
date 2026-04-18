'use client'
// components/shared/HeroBanner.tsx
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HeroBanner() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>

      {/* ── Studio-themed decorative layer ───────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
        {/* Lens / aperture ring — top right */}
        <svg className="absolute -top-10 -right-10 opacity-[0.07]" width="360" height="360" viewBox="0 0 360 360" fill="none">
          <circle cx="180" cy="180" r="170" stroke="#84cc16" strokeWidth="2"/>
          <circle cx="180" cy="180" r="130" stroke="#84cc16" strokeWidth="1.5"/>
          <circle cx="180" cy="180" r="90"  stroke="#84cc16" strokeWidth="1"/>
          <circle cx="180" cy="180" r="50"  stroke="#84cc16" strokeWidth="1"/>
          {/* aperture blades */}
          {[0,30,60,90,120,150].map(a => (
            <line key={a}
              x1={180 + 50 * Math.cos(a * Math.PI / 180)}
              y1={180 + 50 * Math.sin(a * Math.PI / 180)}
              x2={180 + 170 * Math.cos(a * Math.PI / 180)}
              y2={180 + 170 * Math.sin(a * Math.PI / 180)}
              stroke="#84cc16" strokeWidth="1" strokeOpacity="0.6"
            />
          ))}
        </svg>

        {/* Grid dots — left side */}
        <svg className="absolute top-0 left-0 opacity-[0.06]" width="220" height="220" viewBox="0 0 220 220">
          {Array.from({ length: 7 }).map((_, row) =>
            Array.from({ length: 7 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={col * 32 + 16} cy={row * 32 + 16} r="1.5" fill="#84cc16" />
            ))
          )}
        </svg>

        {/* Film-strip strip — bottom left */}
        <svg className="absolute bottom-0 left-0 opacity-[0.05]" width="180" height="60" viewBox="0 0 180 60">
          <rect x="0" y="0" width="180" height="60" fill="#84cc16"/>
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <rect key={i} x={i * 20 + 4} y="4" width="12" height="10" rx="2" fill="#0f172a"/>
          ))}
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <rect key={i} x={i * 20 + 4} y="46" width="12" height="10" rx="2" fill="#0f172a"/>
          ))}
        </svg>

        {/* Small accent circle — bottom right */}
        <div className="absolute bottom-8 right-16 w-32 h-32 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #84cc16 0%, transparent 70%)' }} />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
          style={{ backgroundColor: 'rgba(132,204,22,0.12)', color: '#a3e635', borderColor: 'rgba(132,204,22,0.25)' }}>
          🎬 Chennai&apos;s Studio Booking Platform
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-white mb-4 leading-tight tracking-tight">
          Book the perfect Studio<br />
          <span style={{ color: '#a3e635' }}>for your next Shoot</span>
        </h1>

        <p className="text-base sm:text-lg max-w-lg mx-auto mb-8 px-2" style={{ color: '#94a3b8' }}>
          Photography, Podcast, Video, and Music Studios across Chennai.
          <span className="hidden sm:inline"> Instant availability. No middlemen.</span>
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto px-1 sm:px-0">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            type="search"
            placeholder="Search Studios or areas…"
            className="flex-1 min-w-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff' }}
          />
          <button
            type="submit"
            className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm"
            style={{ backgroundColor: '#84cc16', color: '#111827' }}
          >
            Search
          </button>
        </form>

        {/* Quick-type tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['Photography', 'Videography', 'Podcast', 'Music', 'Velachery', 'OMR', 'Anna Nagar'].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => router.push(`/?q=${encodeURIComponent(tag)}`)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#84cc16'; (e.currentTarget as HTMLElement).style.color = '#a3e635' }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#334155'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-8 mt-8 text-sm" style={{ color: '#64748b' }}>
          <div className="flex items-center gap-1.5"><span>🏠</span> 40+ Studios</div>
          <div className="flex items-center gap-1.5"><span>📍</span> Pan-Chennai</div>
          <div className="flex items-center gap-1.5"><span>⚡</span> Instant Booking</div>
        </div>
      </div>
    </div>
  )
}
