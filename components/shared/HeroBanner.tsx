'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HeroBanner() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>

      {/* ── Mobile decorative layer ───────────────────────────────────────── */}
      <div aria-hidden className="sm:hidden absolute inset-0 pointer-events-none select-none overflow-hidden">

        {/* Centered aperture ring behind content */}
        <svg className="absolute" style={{ top: '-40px', left: '50%', transform: 'translateX(-50%)' }}
          width="300" height="300" viewBox="0 0 300 300" fill="none">
          <circle cx="150" cy="150" r="140" stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.14"/>
          <circle cx="150" cy="150" r="122" stroke="#84cc16" strokeWidth="2"   strokeOpacity="0.22"/>
          <circle cx="150" cy="150" r="92"  stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.17"/>
          <circle cx="150" cy="150" r="60"  stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.15"/>
          <circle cx="150" cy="150" r="5"   fill="#84cc16"   fillOpacity="0.20"/>
          {[0,45,90,135,180,225,270,315].map(a => (
            <line key={a}
              x1={150 + 60  * Math.cos(a * Math.PI / 180)}
              y1={150 + 60  * Math.sin(a * Math.PI / 180)}
              x2={150 + 122 * Math.cos(a * Math.PI / 180)}
              y2={150 + 122 * Math.sin(a * Math.PI / 180)}
              stroke="#84cc16" strokeWidth="0.75" strokeOpacity="0.13"
            />
          ))}
          <line x1="150" y1="28"  x2="150" y2="272" stroke="#84cc16" strokeWidth="0.5" strokeOpacity="0.08"/>
          <line x1="28"  y1="150" x2="272" y2="150" stroke="#84cc16" strokeWidth="0.5" strokeOpacity="0.08"/>
        </svg>

        {/* Grid dots — top left */}
        <svg className="absolute top-0 left-3" width="108" height="88" viewBox="0 0 108 88">
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => (
              <circle key={`${row}-${col}`}
                cx={col * 30 + 8} cy={row * 26 + 8}
                r={row === 0 || col === 0 ? 1.8 : 1.2}
                fill="#84cc16"
                fillOpacity={row === 0 && col === 0 ? 0.50 : 0.18}
              />
            ))
          )}
        </svg>

        {/* Camera viewfinder brackets */}
        <svg className="absolute top-4 left-4" width="38" height="38" viewBox="0 0 48 48" fill="none">
          <path d="M2 22 L2 2 L22 2" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.42" strokeLinecap="round"/>
        </svg>
        <svg className="absolute top-4 right-4" width="38" height="38" viewBox="0 0 48 48" fill="none">
          <path d="M46 22 L46 2 L26 2" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.42" strokeLinecap="round"/>
        </svg>

        {/* Film strip — bottom left, narrow */}
        <svg className="absolute bottom-4 left-4" width="156" height="40" viewBox="0 0 156 40" fill="none">
          <rect x="0" y="0" width="156" height="40" rx="4" fill="#84cc16" fillOpacity="0.10"/>
          <rect x="0" y="0" width="156" height="1"  fill="#84cc16" fillOpacity="0.38"/>
          <rect x="0" y="39" width="156" height="1" fill="#84cc16" fillOpacity="0.38"/>
          {[0,1,2,3,4,5].map(i => (
            <rect key={`t${i}`} x={i * 24 + 4} y="3" width="12" height="7" rx="1.5" fill="#84cc16" fillOpacity="0.28"/>
          ))}
          {[0,1,2,3,4,5].map(i => (
            <rect key={`b${i}`} x={i * 24 + 4} y="30" width="12" height="7" rx="1.5" fill="#84cc16" fillOpacity="0.28"/>
          ))}
          {[1,2].map(i => (
            <rect key={`d${i}`} x={i * 52 + 4} y="12" width="1" height="16" fill="#84cc16" fillOpacity="0.20"/>
          ))}
        </svg>

        {/* Equalizer bars — bottom right */}
        <svg className="absolute bottom-3 right-4" width="52" height="44" viewBox="0 0 52 44" fill="none">
          {[
            { x: 0,  h: 18, o: 0.32 },
            { x: 8,  h: 30, o: 0.42 },
            { x: 16, h: 24, o: 0.36 },
            { x: 24, h: 40, o: 0.52 },
            { x: 32, h: 32, o: 0.45 },
            { x: 40, h: 20, o: 0.35 },
          ].map(({ x, h, o }) => (
            <rect key={x} x={x} y={44 - h} width="5" height={h} rx="2.5" fill="#84cc16" fillOpacity={o}/>
          ))}
        </svg>

        {/* Radial glow */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 100% 70% at 50% 28%, rgba(132,204,22,0.08) 0%, transparent 68%)' }} />
      </div>

      {/* ── Desktop decorative layer ──────────────────────────────────────── */}
      <div aria-hidden className="hidden sm:block absolute inset-0 pointer-events-none select-none overflow-hidden">

        {/* Large aperture ring — top right */}
        <svg className="absolute -top-16 -right-16" width="480" height="480" viewBox="0 0 480 480" fill="none">
          <circle cx="240" cy="240" r="228" stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.18"/>
          <circle cx="240" cy="240" r="210" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.28"/>
          <circle cx="240" cy="240" r="160" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.22"/>
          <circle cx="240" cy="240" r="108" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.20"/>
          <circle cx="240" cy="240" r="60"  stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.30"/>
          <circle cx="240" cy="240" r="6"   fill="#84cc16"   fillOpacity="0.25"/>
          {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
            <line key={a}
              x1={240 + 60  * Math.cos(a * Math.PI / 180)}
              y1={240 + 60  * Math.sin(a * Math.PI / 180)}
              x2={240 + 210 * Math.cos(a * Math.PI / 180)}
              y2={240 + 210 * Math.sin(a * Math.PI / 180)}
              stroke="#84cc16" strokeWidth="1" strokeOpacity="0.15"
            />
          ))}
          <line x1="240" y1="20"  x2="240" y2="460" stroke="#84cc16" strokeWidth="0.75" strokeOpacity="0.10"/>
          <line x1="20"  y1="240" x2="460" y2="240" stroke="#84cc16" strokeWidth="0.75" strokeOpacity="0.10"/>
        </svg>

        {/* Second smaller aperture — bottom left */}
        <svg className="absolute -bottom-12 -left-12" width="280" height="280" viewBox="0 0 280 280" fill="none">
          <circle cx="140" cy="140" r="128" stroke="#84cc16" strokeWidth="2"   strokeOpacity="0.20"/>
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
        <svg className="absolute top-0 left-10" width="200" height="180" viewBox="0 0 200 180">
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

        {/* Camera viewfinder brackets */}
        <svg className="absolute top-5 left-5" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M2 22 L2 2 L22 2" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.45" strokeLinecap="round"/>
        </svg>
        <svg className="absolute top-5 right-5" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M46 22 L46 2 L26 2" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.45" strokeLinecap="round"/>
        </svg>

        {/* Film strip — bottom left, fixed width */}
        <svg className="absolute bottom-6 left-6" width="260" height="48" viewBox="0 0 260 48" fill="none">
          <rect x="0" y="0" width="260" height="48" rx="4" fill="#84cc16" fillOpacity="0.10"/>
          <rect x="0" y="0" width="260" height="1"  fill="#84cc16" fillOpacity="0.40"/>
          <rect x="0" y="47" width="260" height="1" fill="#84cc16" fillOpacity="0.40"/>
          {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
            <rect key={`t${i}`} x={i * 24 + 4} y="4" width="14" height="9" rx="2" fill="#84cc16" fillOpacity="0.30"/>
          ))}
          {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
            <rect key={`b${i}`} x={i * 24 + 4} y="35" width="14" height="9" rx="2" fill="#84cc16" fillOpacity="0.30"/>
          ))}
          {[1,2,3,4,5].map(i => (
            <rect key={`d${i}`} x={i * 44 + 4} y="15" width="1" height="18" fill="#84cc16" fillOpacity="0.25"/>
          ))}
        </svg>

        {/* Audio equaliser bars — bottom right */}
        <svg className="absolute bottom-4 right-16" width="72" height="64" viewBox="0 0 72 64" fill="none">
          {[
            { x: 0,  h: 28, o: 0.35 },
            { x: 8,  h: 44, o: 0.45 },
            { x: 16, h: 36, o: 0.38 },
            { x: 24, h: 56, o: 0.55 },
            { x: 32, h: 48, o: 0.50 },
            { x: 40, h: 36, o: 0.40 },
            { x: 48, h: 52, o: 0.48 },
            { x: 56, h: 32, o: 0.35 },
            { x: 64, h: 20, o: 0.28 },
          ].map(({ x, h, o }) => (
            <rect key={x} x={x} y={64 - h} width="5" height={h} rx="2.5" fill="#84cc16" fillOpacity={o}/>
          ))}
        </svg>

        {/* Podcast microphone — left side, mid-height */}
        <svg className="absolute left-12" style={{ top: '38%' }} width="44" height="64" viewBox="0 0 44 64" fill="none">
          <rect x="13" y="2" width="18" height="28" rx="9" stroke="#84cc16" strokeWidth="1.8" strokeOpacity="0.40"/>
          {[10, 16, 22].map(y => (
            <line key={y} x1="14" y1={y} x2="30" y2={y} stroke="#84cc16" strokeWidth="1" strokeOpacity="0.25"/>
          ))}
          <path d="M6 30 Q6 48 22 48 Q38 48 38 30" stroke="#84cc16" strokeWidth="1.8" strokeOpacity="0.38" fill="none"/>
          <line x1="22" y1="48" x2="22" y2="60" stroke="#84cc16" strokeWidth="1.8" strokeOpacity="0.38"/>
          <line x1="12" y1="60" x2="32" y2="60" stroke="#84cc16" strokeWidth="2" strokeOpacity="0.38" strokeLinecap="round"/>
        </svg>

        {/* Sound waveform — right side, mid-height */}
        <svg className="absolute right-14" style={{ top: '42%' }} width="80" height="40" viewBox="0 0 80 40" fill="none">
          {[
            { x: 0,  h: 6  },
            { x: 8,  h: 14 },
            { x: 16, h: 22 },
            { x: 24, h: 32 },
            { x: 32, h: 38 },
            { x: 40, h: 30 },
            { x: 48, h: 20 },
            { x: 56, h: 12 },
            { x: 64, h: 18 },
            { x: 72, h: 8  },
          ].map(({ x, h }) => (
            <rect key={x} x={x} y={(40 - h) / 2} width="5" height={h} rx="2.5" fill="#84cc16" fillOpacity="0.32"/>
          ))}
        </svg>

        {/* Musical note — top area */}
        <svg className="absolute" style={{ top: '12%', left: '28%' }} width="28" height="36" viewBox="0 0 28 36" fill="none">
          <path d="M10 28 L10 8 L26 4 L26 14 L10 18" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.30" fill="none" strokeLinejoin="round"/>
          <circle cx="7"  cy="29" r="5" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.30"/>
          <circle cx="23" cy="16" r="5" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.30"/>
        </svg>

        {/* Radial centre glow */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(132,204,22,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center" style={{ paddingBottom: '5rem' }}>

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
