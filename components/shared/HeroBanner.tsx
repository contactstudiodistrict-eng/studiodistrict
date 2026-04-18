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

      {/* ── Decorative layer ─────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none select-none overflow-hidden">

        {/* Large aperture ring — top right, partially cropped */}
        <svg className="absolute -top-16 -right-16" width="480" height="480" viewBox="0 0 480 480" fill="none">
          {/* Outer glow ring */}
          <circle cx="240" cy="240" r="228" stroke="#84cc16" strokeWidth="1" strokeOpacity="0.18"/>
          {/* Main rings */}
          <circle cx="240" cy="240" r="210" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.28"/>
          <circle cx="240" cy="240" r="160" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.22"/>
          <circle cx="240" cy="240" r="108" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.20"/>
          <circle cx="240" cy="240" r="60"  stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.30"/>
          {/* Centre dot */}
          <circle cx="240" cy="240" r="6"   fill="#84cc16"   fillOpacity="0.25"/>
          {/* Aperture blades — 12 */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
            <line key={a}
              x1={240 + 60  * Math.cos(a * Math.PI / 180)}
              y1={240 + 60  * Math.sin(a * Math.PI / 180)}
              x2={240 + 210 * Math.cos(a * Math.PI / 180)}
              y2={240 + 210 * Math.sin(a * Math.PI / 180)}
              stroke="#84cc16" strokeWidth="1" strokeOpacity="0.15"
            />
          ))}
          {/* Cross-hairs */}
          <line x1="240" y1="20"  x2="240" y2="460" stroke="#84cc16" strokeWidth="0.75" strokeOpacity="0.10"/>
          <line x1="20"  y1="240" x2="460" y2="240" stroke="#84cc16" strokeWidth="0.75" strokeOpacity="0.10"/>
        </svg>

        {/* Second smaller aperture — bottom left */}
        <svg className="absolute -bottom-12 -left-12" width="280" height="280" viewBox="0 0 280 280" fill="none">
          <circle cx="140" cy="140" r="128" stroke="#84cc16" strokeWidth="2" strokeOpacity="0.20"/>
          <circle cx="140" cy="140" r="90"  stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.18"/>
          <circle cx="140" cy="140" r="52"  stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.22"/>
          <circle cx="140" cy="140" r="20"  stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.28"/>
          {[0,45,90,135,180,225,270,315].map(a => (
            <line key={a}
              x1={140 + 20  * Math.cos(a * Math.PI / 180)}
              y1={140 + 20  * Math.sin(a * Math.PI / 180)}
              x2={140 + 128 * Math.cos(a * Math.PI / 180)}
              y2={140 + 128 * Math.sin(a * Math.PI / 180)}
              stroke="#84cc16" strokeWidth="1" strokeOpacity="0.12"
            />
          ))}
        </svg>

        {/* Grid dots — top left */}
        <svg className="absolute top-0 left-4 sm:left-10" width="200" height="180" viewBox="0 0 200 180">
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 34 + 10} cy={row * 30 + 10}
                r={row === 0 || col === 0 ? 2 : 1.5}
                fill="#84cc16"
                fillOpacity={row === 0 && col === 0 ? 0.55 : 0.22}
              />
            ))
          )}
        </svg>

        {/* Film strip — full-width bottom, tall enough to see */}
        <svg className="absolute bottom-0 left-0 w-full" height="52" preserveAspectRatio="none" viewBox="0 0 1200 52" fill="none">
          <rect x="0" y="0" width="1200" height="52" fill="#84cc16" fillOpacity="0.12"/>
          <rect x="0" y="0" width="1200" height="1"  fill="#84cc16" fillOpacity="0.35"/>
          <rect x="0" y="51" width="1200" height="1" fill="#84cc16" fillOpacity="0.35"/>
          {Array.from({ length: 55 }).map((_, i) => (
            <rect key={`t${i}`} x={i * 22 + 2} y="4"  width="14" height="10" rx="2" fill="#84cc16" fillOpacity="0.28"/>
          ))}
          {Array.from({ length: 55 }).map((_, i) => (
            <rect key={`b${i}`} x={i * 22 + 2} y="38" width="14" height="10" rx="2" fill="#84cc16" fillOpacity="0.28"/>
          ))}
          {/* Frame dividers */}
          {Array.from({ length: 30 }).map((_, i) => (
            <rect key={`f${i}`} x={i * 40 + 20} y="16" width="1" height="20" fill="#84cc16" fillOpacity="0.18"/>
          ))}
        </svg>

        {/* Corner bracket — top left */}
        <svg className="absolute top-5 left-5" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M2 22 L2 2 L22 2"  stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.45" strokeLinecap="round"/>
        </svg>

        {/* Corner bracket — top right */}
        <svg className="absolute top-5 right-5" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M46 22 L46 2 L26 2" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.45" strokeLinecap="round"/>
        </svg>

        {/* Subtle radial glow centre */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(132,204,22,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center" style={{ paddingBottom: '4rem' }}>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
          style={{ backgroundColor: 'rgba(132,204,22,0.12)', color: '#a3e635', borderColor: 'rgba(132,204,22,0.30)' }}>
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
