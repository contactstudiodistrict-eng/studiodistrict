'use client'
// components/shared/HeroBanner.tsx — Dynamic hero v2 (full-bleed + use-case carousel)
import { useState, useEffect, useRef, useCallback } from 'react'

const FD = 'var(--font-bricolage,"Bricolage Grotesque",system-ui,sans-serif)'
const FB = 'var(--font-hanken,"Hanken Grotesk",system-ui,sans-serif)'
const FM = 'var(--font-jetbrains,"JetBrains Mono",monospace)'

const ROTATE_WORDS  = ['Photography', 'Podcast', 'Video', 'Music']
const ROTATE_COLORS = [
  'oklch(0.64 0.19 36)',
  'oklch(0.58 0.18 280)',
  'oklch(0.62 0.19 155)',
  'oklch(0.60 0.18 50)',
]

const STUDIO_TYPES = [
  { label: 'Any studio type', value: '' },
  { label: 'Photography',     value: 'photography' },
  { label: 'Videography',     value: 'videography' },
  { label: 'Podcast / Audio', value: 'audio' },
  { label: 'Music',           value: 'music' },
  { label: 'Multi-use',       value: 'mixed' },
]

const AREA_OPTIONS_FALLBACK = [
  { label: 'Any area', value: '' },
  ...['Velachery','OMR','Anna Nagar','T. Nagar','Adyar',
      'Sholinganallur','Porur','Vadapalani','Mylapore','Tambaram']
    .map(a => ({ label: a, value: a.toLowerCase() })),
]

// HD Unsplash images – replace with actual studio photos once available
const UNS = (id: string, w = 640, h = 280, crop = 'center') =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&crop=${crop}&auto=format&q=80`

const SHOOT_TYPES = [
  {
    title: 'Product Shoot',
    tagline: 'Make your products irresistible',
    from: '₹800', studios: 38,
    tags: ['Flat-lay setup', 'Light tent', '360° rig'],
    accent: 'oklch(0.64 0.19 36)', accentBg: 'oklch(0.95 0.04 36)',
    searchType: 'photography',
    img: UNS('photo-1523275335684-37898b6baf30'),   // product / watch
    emoji: '📸',
  },
  {
    title: 'Reel / Content',
    tagline: 'Stand out on Instagram & YouTube',
    from: '₹500', studios: 52,
    tags: ['Ring lights', 'Neon walls', 'Teleprompter'],
    accent: 'oklch(0.58 0.18 280)', accentBg: 'oklch(0.95 0.04 280)',
    searchType: 'videography',
    img: UNS('photo-1611162617213-7d7a39e9b1d7'),   // content creator / ring light
    emoji: '🎬',
  },
  {
    title: 'Podcast Recording',
    tagline: 'Crystal-clear audio, zero hassle',
    from: '₹1,200', studios: 22,
    tags: ['Soundproofed', 'Dual mics', 'Mixer'],
    accent: 'oklch(0.62 0.19 155)', accentBg: 'oklch(0.95 0.04 155)',
    searchType: 'audio',
    img: UNS('photo-1478737270239-2f02b77fc618'),   // radio / podcast mic
    emoji: '🎙',
  },
  {
    title: 'Family Portraits',
    tagline: 'Memories that last generations',
    from: '₹1,500', studios: 29,
    tags: ['Backdrops', 'Props', 'Print-ready'],
    accent: 'oklch(0.60 0.18 50)', accentBg: 'oklch(0.95 0.04 50)',
    searchType: 'photography',
    img: UNS('photo-1531746020798-e6953c6e8e04', 640, 280, 'faces'),   // portrait studio lighting
    emoji: '👨‍👩‍👧',
  },
  {
    title: 'Music Video',
    tagline: 'Bring your tracks to life',
    from: '₹2,000', studios: 16,
    tags: ['Green screen', 'LED panels', 'Dolly'],
    accent: 'oklch(0.55 0.19 320)', accentBg: 'oklch(0.95 0.04 320)',
    searchType: 'videography',
    img: UNS('photo-1493225457124-a3eb161ffa5f'),   // music / concert lights
    emoji: '🎵',
  },
  {
    title: 'Corporate Headshots',
    tagline: 'Professional profiles in 30 min',
    from: '₹600', studios: 44,
    tags: ['Quick turnaround', 'LinkedIn-ready', 'Team pkg'],
    accent: 'oklch(0.45 0.12 250)', accentBg: 'oklch(0.95 0.03 250)',
    searchType: 'photography',
    img: UNS('photo-1507003211169-0a1dd7228f2d', 640, 280, 'faces'),   // professional headshot
    emoji: '💼',
  },
]

// ── Hero package type (from DB) ────────────────────────────────────────────
export interface HeroPackage {
  id: string
  package_name: string
  price: number
  original_price: number | null
  duration_hours: number
  badge_text: string | null
  included_equipment: string[]
  included_amenities: string[]
  included_extras: string[]
  studio_id: string
  studio_name: string
  area: string
  studio_type: string
  thumbnail_url: string | null
}

const ACCENT: Record<string, string> = {
  photography: 'oklch(0.64 0.19 36)',
  videography: 'oklch(0.58 0.18 280)',
  audio:       'oklch(0.62 0.19 155)',
  music:       'oklch(0.60 0.18 50)',
  mixed:       'oklch(0.55 0.19 320)',
}
const ACCENT_BG: Record<string, string> = {
  photography: 'oklch(0.95 0.04 36)',
  videography: 'oklch(0.95 0.04 280)',
  audio:       'oklch(0.95 0.04 155)',
  music:       'oklch(0.95 0.04 50)',
  mixed:       'oklch(0.95 0.04 320)',
}
const TYPE_EMOJI: Record<string, string> = {
  photography: '📸', videography: '🎬', audio: '🎙', music: '🎵', mixed: '🎭',
}

const N = SHOOT_TYPES.length

// ── Dropdown ───────────────────────────────────────────────────────────────
function HeroDropdown({
  label, options, value, onChange,
}: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value) ?? options[0]

  useEffect(() => {
    function away(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
          <span style={{ font: `600 10px/1 ${FM}`, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9b8e84' }}>{label}</span>
          <span style={{ font: `500 15px/1.2 ${FB}`, color: value ? '#1c1917' : '#9b8e84', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selected?.label}
          </span>
        </span>
        <span style={{ color: '#9b8e84', fontSize: 11, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: -8, right: -8, zIndex: 50,
          background: '#fff', border: '1px solid #dedbd7', borderRadius: 14,
          boxShadow: '0 18px 50px -12px rgba(20,16,12,0.32)', padding: 6, maxHeight: 260, overflowY: 'auto',
        }}>
          {options.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 9,
                border: 'none', cursor: 'pointer', font: `500 14px/1.2 ${FB}`,
                color: opt.value === value ? '#65a30d' : '#1c1917',
                background: opt.value === value ? '#f7fee7' : 'transparent', transition: 'background .1s',
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = '#f5f3f1' }}
              onMouseLeave={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >{opt.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Shoot card ─────────────────────────────────────────────────────────────
function ShootCard({
  shoot, imgH, isActive, onClick, onCta,
}: {
  shoot: typeof SHOOT_TYPES[0]
  imgH: number
  isActive: boolean
  onClick: () => void
  onCta: () => void
}) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div onClick={onClick} style={{
      width: '100%', height: '100%',
      background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
      border: '1px solid rgba(255,255,255,0.7)',
      boxShadow: isActive ? '0 24px 64px -16px rgba(20,16,12,0.38)' : '0 8px 24px -10px rgba(20,16,12,0.2)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Image strip */}
      <div style={{ height: imgH, position: 'relative', overflow: 'hidden', flexShrink: 0, background: shoot.accentBg }}>
        {!imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shoot.img}
            alt={shoot.title}
            loading="lazy"
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${shoot.accentBg} 0%,${shoot.accent}33 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            {shoot.emoji}
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 45%,rgba(20,16,12,0.55) 100%)' }} />
        {/* Type badge */}
        <span style={{ position: 'absolute', top: 10, left: 10, font: `600 11px/1 ${FB}`, color: '#fff', padding: '5px 10px', borderRadius: 999, background: 'rgba(20,16,12,0.52)', backdropFilter: 'blur(8px)' }}>
          {shoot.title}
        </span>
        {/* Tagline */}
        <span style={{ position: 'absolute', bottom: 10, left: 12, right: 12, font: `500 12px/1.3 ${FB}`, color: '#fff' }}>
          {shoot.tagline}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ font: `600 15px/1.2 ${FD}`, color: '#1c1917', letterSpacing: '-0.01em' }}>{shoot.title}</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <span style={{ font: `600 9px/1 ${FM}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b8e84' }}>from</span>
            <span style={{ font: `700 16px/1 ${FD}`, color: shoot.accent }}>
              {shoot.from}<span style={{ font: `500 10px/1 ${FB}`, color: '#9b8e84' }}>/hr</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          {shoot.tags.map(t => (
            <span key={t} style={{ font: `500 10px/1 ${FB}`, color: '#2b2824', padding: '4px 8px', borderRadius: 999, background: shoot.accentBg, border: `1px solid ${shoot.accent}33` }}>{t}</span>
          ))}
        </div>

        <button type="button"
          onClick={e => { e.stopPropagation(); onCta() }}
          style={{ width: '100%', marginTop: 'auto', padding: '10px 0', borderRadius: 10, border: 'none', background: shoot.accent, color: '#fff', font: `600 12px/1 ${FB}`, cursor: 'pointer', transition: 'filter .15s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = 'brightness(0.88)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = 'none')}
        >
          Browse {shoot.title.toLowerCase()} studios →
        </button>
      </div>
    </div>
  )
}

// ── Package card (real DB data) ────────────────────────────────────────────
function PackageHeroCard({
  pkg, imgH, isActive, onClick,
}: {
  pkg: HeroPackage
  imgH: number
  isActive: boolean
  onClick: () => void
}) {
  const accent   = ACCENT[pkg.studio_type]   ?? ACCENT.photography
  const accentBg = ACCENT_BG[pkg.studio_type] ?? ACCENT_BG.photography
  const emoji    = TYPE_EMOJI[pkg.studio_type] ?? '📦'

  // Pick up to 3 tag strings from included items
  const tags = [
    ...(pkg.included_equipment ?? []),
    ...(pkg.included_extras   ?? []),
    ...(pkg.included_amenities ?? []),
  ].filter(Boolean).slice(0, 3)

  const fmtPrice = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div onClick={onClick} style={{
      width: '100%', height: '100%',
      background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
      border: '1px solid rgba(255,255,255,0.7)',
      boxShadow: isActive ? '0 24px 64px -16px rgba(20,16,12,0.38)' : '0 8px 24px -10px rgba(20,16,12,0.2)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Image strip */}
      <div style={{ height: imgH, position: 'relative', overflow: 'hidden', flexShrink: 0, background: accentBg }}>
        {pkg.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pkg.thumbnail_url} alt={pkg.studio_name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${accentBg} 0%,${accent}33 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            {emoji}
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 40%,rgba(20,16,12,0.60) 100%)' }} />
        {/* Package name badge */}
        <span style={{ position: 'absolute', top: 10, left: 10, font: `600 11px/1 ${FB}`, color: '#fff', padding: '5px 10px', borderRadius: 999, background: 'rgba(20,16,12,0.52)', backdropFilter: 'blur(8px)' }}>
          {pkg.package_name}
        </span>
        {/* Duration badge */}
        <span style={{ position: 'absolute', top: 10, right: 10, font: `600 10px/1 ${FM}`, letterSpacing: '0.04em', color: '#fff', padding: '5px 9px', borderRadius: 999, background: 'rgba(20,16,12,0.52)', backdropFilter: 'blur(8px)' }}>
          {pkg.duration_hours} hrs
        </span>
        {/* Studio name + area */}
        <span style={{ position: 'absolute', bottom: 10, left: 12, right: 12, font: `500 12px/1.3 ${FB}`, color: 'rgba(255,255,255,0.90)' }}>
          {pkg.studio_name} · {pkg.area}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
            <div style={{ font: `600 14px/1.2 ${FD}`, color: '#1c1917', letterSpacing: '-0.01em', marginBottom: 2 }}>{pkg.package_name}</div>
            {pkg.badge_text && (
              <span style={{ font: `600 9px/1 ${FM}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent, padding: '3px 7px', borderRadius: 999, background: accentBg, display: 'inline-block', marginTop: 2 }}>{pkg.badge_text}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
            {pkg.original_price && (
              <span style={{ font: `400 10px/1 ${FB}`, color: '#c4b5a5', textDecoration: 'line-through' }}>{fmtPrice(pkg.original_price)}</span>
            )}
            <span style={{ font: `700 16px/1 ${FD}`, color: accent }}>{fmtPrice(pkg.price)}</span>
          </div>
        </div>

        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {tags.map(t => (
              <span key={t} style={{ font: `500 10px/1 ${FB}`, color: '#2b2824', padding: '4px 8px', borderRadius: 999, background: accentBg, border: `1px solid ${accent}33` }}>{t}</span>
            ))}
          </div>
        )}

        <a href={`/studios/${pkg.studio_id}/book?package=${pkg.id}`}
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', marginTop: 'auto', padding: '10px 0', borderRadius: 10, border: 'none', background: accent, color: '#fff', font: `600 12px/1 ${FB}`, cursor: 'pointer', transition: 'filter .15s', display: 'block', textAlign: 'center', textDecoration: 'none' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = 'brightness(0.88)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = 'none')}
        >
          Book this package →
        </a>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────
interface Props {
  thumbnails?: string[]
  packages?: HeroPackage[]
  liveAreas?: string[]
  onSearch?: (type: string, area: string) => void
}

export function HeroBanner({ thumbnails = [], packages = [], liveAreas = [], onSearch }: Props) {
  const [wordIdx,  setWordIdx]  = useState(0)
  const [wordAnim, setWordAnim] = useState<'enter' | 'exit'>('enter')
  const [type, setType] = useState('')
  const [area, setArea] = useState('')
  const [active, setActive]   = useState(0)
  const [vw, setVw]           = useState(1280)
  const [colW, setColW]       = useState(500)   // measured right-column width

  // Use real packages when available, fall back to hardcoded SHOOT_TYPES
  const usePackages = packages.length > 0
  const cardCount   = usePackages ? packages.length : SHOOT_TYPES.length

  const carouselRef = useRef<HTMLDivElement>(null)
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  // Word rotator
  useEffect(() => {
    const id = setInterval(() => {
      setWordAnim('exit')
      setTimeout(() => { setWordIdx(i => (i + 1) % ROTATE_WORDS.length); setWordAnim('enter') }, 350)
    }, 2400)
    return () => clearInterval(id)
  }, [])

  // Carousel auto-rotate
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setActive(a => (a + 1) % cardCount), 4200)
  }, [cardCount])
  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [resetTimer])

  // Viewport + carousel column width
  useEffect(() => {
    function update() {
      setVw(window.innerWidth)
      if (carouselRef.current) setColW(carouselRef.current.offsetWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Re-measure after layout settles
  useEffect(() => {
    const id = setTimeout(() => { if (carouselRef.current) setColW(carouselRef.current.offsetWidth) }, 100)
    return () => clearTimeout(id)
  }, [vw])

  const mobile  = vw < 768
  const desktop = vw >= 1024

  // Card dimensions (stacking carousel used on mobile/tablet)
  const stackCW = mobile ? 290 : 320
  const stackCH = mobile ? 420 : 450
  const stackIH = mobile ? 160 : 180

  // 3-card peek carousel dimensions (desktop only)
  const D_CW   = 260   // center card width
  const D_CH   = 440   // center card height
  const D_IH   = 190   // image strip height (center)
  const D_SW   = 160   // side card width
  const D_SH   = 370   // side card height
  const D_SIH  = 150   // image strip height (side)
  const D_GAP  = 14    // gap between cards

  // Left-edge positions for each slot in the peek carousel
  const dCenterLeft = (colW - D_CW) / 2
  const dLeftLeft   = dCenterLeft - D_GAP - D_SW
  const dRightLeft  = dCenterLeft + D_CW + D_GAP

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    onSearch?.(type, area)
  }

  const heroImg = thumbnails[0]

  return (
    <div style={{ position: 'relative', width: '100%', background: '#fff' }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sd2-wi  { from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1} }
        @keyframes sd2-wo  { from{transform:translateY(0);opacity:1}to{transform:translateY(-100%);opacity:0} }
        .sd2-wi{ animation: sd2-wi .4s  cubic-bezier(.22,1,.36,1) forwards; }
        .sd2-wo{ animation: sd2-wo .35s cubic-bezier(.55,0,1,.45) forwards; }

        @keyframes sd2-up { from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1} }
        .sd2-f1{animation:sd2-up .7s .10s cubic-bezier(.22,1,.36,1) both}
        .sd2-f2{animation:sd2-up .7s .25s cubic-bezier(.22,1,.36,1) both}
        .sd2-f3{animation:sd2-up .7s .40s cubic-bezier(.22,1,.36,1) both}
        .sd2-f4{animation:sd2-up .7s .55s cubic-bezier(.22,1,.36,1) both}
        .sd2-f5{animation:sd2-up .7s .85s cubic-bezier(.22,1,.36,1) both}

        @keyframes sd2-glow{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)}}
        .sd2-glow{ animation: sd2-glow 6s ease-in-out infinite; }

        .sd2-grad{ background: linear-gradient(90deg,
          rgba(255,255,255,0.98) 0%,rgba(255,255,255,0.96) 34%,
          rgba(255,255,255,0.72) 48%,rgba(255,255,255,0.28) 62%,
          rgba(255,255,255,0.06) 78%,transparent 100%); }
        @media(min-width:768px) and (max-width:1023px){
          .sd2-grad{ background: linear-gradient(90deg,
            rgba(255,255,255,0.98) 0%,rgba(255,255,255,0.96) 40%,
            rgba(255,255,255,0.72) 55%,rgba(255,255,255,0.28) 68%,
            rgba(255,255,255,0.06) 82%,transparent 100%); }}
        @media(max-width:767px){
          .sd2-grad{ background: linear-gradient(180deg,
            rgba(255,255,255,0.97) 0%,rgba(255,255,255,0.93) 50%,
            rgba(255,255,255,0.58) 75%,rgba(255,255,255,0.28) 90%,
            rgba(255,255,255,0.12) 100%); }}

        .sd2-grid{ display:grid; grid-template-columns:1.15fr 0.85fr; min-height:clamp(680px,88vh,820px); padding:0 48px; }
        .sd2-left{ display:flex; flex-direction:column; justify-content:center; padding:64px 40px 72px 0; }
        .sd2-right{ display:flex; align-items:center; justify-content:center; padding:48px 0 72px; }
        .sd2-srow{ flex-direction:row; }

        @media(min-width:768px) and (max-width:1023px){
          .sd2-grid{ grid-template-columns:1.1fr 0.9fr; min-height:clamp(600px,82vh,720px); padding:0 32px; }
          .sd2-left{ padding:56px 32px 64px 0; }
          .sd2-right{ padding:40px 0 60px; }}
        @media(max-width:767px){
          .sd2-grid{ display:flex; flex-direction:column; min-height:auto; padding:0 20px; }
          .sd2-left{ padding:24px 0 28px; }
          .sd2-right{ padding:0 0 44px; }
          .sd2-srow{ flex-direction:column; }}
      `}} />

      {/* Background — clipped separately so dropdowns above can overflow */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {heroImg
            ? <img src={heroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> // eslint-disable-line @next/next/no-img-element
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#f7fee7 0%,#fef9c3 40%,#f0fdf4 100%)' }} />
          }
        </div>
        <div className="sd2-grad" style={{ position: 'absolute', inset: 0 }} />
        {/* Glow blobs */}
        <div className="sd2-glow" style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(132,204,22,0.18) 0%,transparent 70%)', top: -100, left: -60, pointerEvents: 'none' }} />
        <div className="sd2-glow" style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)', bottom: -80, right: '28%', pointerEvents: 'none', animationDelay: '3s' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 5 }}>
        <div className="sd2-grid">

          {/* ── LEFT ─────────────────────────────────────────── */}
          <div className="sd2-left">

            <div className="sd2-f1">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, font: `600 11px/1 ${FM}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.5 0.05 36)', padding: '8px 16px', borderRadius: 999, background: 'oklch(0.97 0.015 40)', border: '1px solid oklch(0.9 0.03 40)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#84cc16', display: 'inline-block' }} />
                Live in Chennai
              </span>
            </div>

            <h1 className="sd2-f2" style={{ fontFamily: FD, fontWeight: 700, letterSpacing: '-0.03em', fontSize: mobile ? 40 : vw < 1024 ? 52 : 68, lineHeight: 1.04, color: 'oklch(0.18 0.012 60)', margin: '24px 0 0' }}>
              Your next<br />
              <span style={{ display: 'inline-flex', overflow: 'hidden', height: '1.08em', verticalAlign: 'bottom' }}>
                <span className={wordAnim === 'enter' ? 'sd2-wi' : 'sd2-wo'} style={{ display: 'inline-block', color: ROTATE_COLORS[wordIdx] }}>
                  {ROTATE_WORDS[wordIdx]}
                </span>
              </span>
              <br />studio is here.
            </h1>

            <p className="sd2-f3" style={{ fontFamily: FB, fontSize: mobile ? 16 : 18, lineHeight: 1.55, color: 'oklch(0.42 0.012 60)', margin: '20px 0 0', maxWidth: 460 }}>
              Stop scrolling classifieds. Browse{' '}
              <strong style={{ color: 'oklch(0.18 0.012 60)' }}>verified studios</strong> across Chennai —
              see real photos, check availability, and book in under 2 minutes.
            </p>

            <form className="sd2-f4" onSubmit={handleSearch} style={{ marginTop: mobile ? 24 : 34, maxWidth: 560, position: 'relative', zIndex: 2 }}>
              <div className="sd2-srow" style={{ display: 'flex', alignItems: 'stretch', background: '#fff', border: '1px solid #dedbd7', borderRadius: mobile ? 16 : 18, padding: mobile ? 6 : 7, boxShadow: '0 20px 50px -20px rgba(20,16,12,0.22)' }}>
                <div style={{ flex: 1, padding: mobile ? '10px 14px' : '10px 18px' }}>
                  <HeroDropdown label="Studio type" options={STUDIO_TYPES} value={type} onChange={setType} />
                </div>
                <div style={mobile ? { height: 1, background: '#e3e0dd', margin: '0 8px' } : { width: 1, background: '#e3e0dd', margin: '8px 0', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: mobile ? '10px 14px' : '10px 18px' }}>
                  <HeroDropdown label="Area"
                    options={liveAreas.length > 0
                      ? [{ label: 'Any area', value: '' }, ...liveAreas.map(a => ({ label: a, value: a.toLowerCase() }))]
                      : AREA_OPTIONS_FALLBACK}
                    value={area} onChange={setArea} />
                </div>
                <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0, font: `600 14px/1 ${FB}`, color: '#111827', background: '#84cc16', border: 'none', borderRadius: mobile ? 12 : 13, padding: mobile ? '14px 20px' : '0 24px', marginTop: mobile ? 4 : 0, cursor: 'pointer', transition: 'background .15s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#65a30d')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#84cc16')}
                >Search studios →</button>
              </div>
            </form>

            <div className="sd2-f4" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 22px', marginTop: 16 }}>
              {['Verified studios', 'Instant booking', 'Pay after confirm'].map(t => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: `500 ${mobile ? 12 : 13}px/1 ${FB}`, color: 'oklch(0.45 0.012 60)' }}>
                  <span style={{ color: '#22c55e' }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────────────── */}
          <div className="sd2-right" ref={carouselRef}>
            <div className="sd2-f5" style={{ position: 'relative', width: '100%' }}>

              {desktop ? (
                /* ── Desktop: 3-card peek carousel ──────────── */
                <>
                  <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: D_CH }}>
                    {(usePackages ? packages : SHOOT_TYPES).map((item: any, i: number) => {
                      const offset   = ((i - active + cardCount) % cardCount)
                      const isCenter = offset === 0
                      const isRight  = offset === 1
                      const isLeft   = offset === cardCount - 1
                      const visible  = isCenter || isLeft || isRight

                      const w   = isCenter ? D_CW  : D_SW
                      const h   = isCenter ? D_CH  : D_SH
                      const ih  = isCenter ? D_IH  : D_SIH
                      const top = isCenter ? 0     : (D_CH - D_SH) / 2
                      const lft = isCenter ? dCenterLeft : isLeft ? dLeftLeft : dRightLeft
                      const op  = isCenter ? 1 : 0.62
                      const zi  = isCenter ? 10 : 4

                      return (
                        <div key={usePackages ? item.id : item.title} style={{
                          position: 'absolute', top, left: 0, width: w, height: h, zIndex: zi,
                          opacity: visible ? op : 0,
                          transform: `translateX(${lft}px)`,
                          transition: 'transform .55s cubic-bezier(.22,1,.36,1), opacity .4s',
                          pointerEvents: visible ? 'auto' : 'none',
                        }}>
                          {usePackages
                            ? <PackageHeroCard pkg={item} imgH={ih} isActive={isCenter} onClick={() => { setActive(i); resetTimer() }} />
                            : <ShootCard shoot={item} imgH={ih} isActive={isCenter} onClick={() => { setActive(i); resetTimer() }} onCta={() => { onSearch?.(item.searchType, ''); resetTimer() }} />
                          }
                        </div>
                      )
                    })}
                  </div>

                  {/* Dots + explore link */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 20 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(usePackages ? packages : SHOOT_TYPES).map((item: any, i: number) => {
                        const dotColor = usePackages
                          ? (ACCENT[item.studio_type] ?? ACCENT.photography)
                          : item.accent
                        return (
                          <button key={i} type="button" onClick={() => { setActive(i); resetTimer() }} style={{ width: active === i ? 28 : 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, background: active === i ? dotColor : 'oklch(0.82 0.01 80)', transition: 'all .3s cubic-bezier(.22,1,.36,1)' }} />
                        )
                      })}
                    </div>
                    <a href="/packages"
                      style={{ font: `600 11px/1 ${FB}`, color: '#1c1917', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 999, border: '1px solid #dedbd7', background: '#fff', transition: 'border-color .15s, background .15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#84cc16'; (e.currentTarget as HTMLElement).style.background = '#f7fee7' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#dedbd7'; (e.currentTarget as HTMLElement).style.background = '#fff' }}
                    >📦 Explore all packages →</a>
                  </div>
                </>
              ) : (
                /* ── Mobile / tablet: stacking depth carousel ── */
                <>
                  <div style={{ position: 'relative', width: stackCW, height: stackCH + 60, margin: '0 auto' }}>
                    {(usePackages ? packages : SHOOT_TYPES).map((item: any, i: number) => {
                      const offset = ((i - active + cardCount) % cardCount)
                      let transform: string, opacity: number, zIndex: number
                      if (offset === 0)      { transform = 'translateY(0) scale(1)';       opacity = 1;   zIndex = 6 }
                      else if (offset === 1) { transform = 'translateY(22px) scale(0.96)'; opacity = 0.6; zIndex = 5 }
                      else if (offset === 2) { transform = 'translateY(40px) scale(0.92)'; opacity = 0.3; zIndex = 4 }
                      else                   { transform = 'translateY(55px) scale(0.88)'; opacity = 0;   zIndex = 1 }

                      return (
                        <div key={usePackages ? item.id : item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: stackCH, zIndex, opacity, transform, transition: 'all .55s cubic-bezier(.22,1,.36,1)' }}>
                          {usePackages
                            ? <PackageHeroCard pkg={item} imgH={stackIH} isActive={offset === 0} onClick={() => { setActive(i); resetTimer() }} />
                            : <ShootCard shoot={item} imgH={stackIH} isActive={offset === 0} onClick={() => { setActive(i); resetTimer() }} onCta={() => { onSearch?.(item.searchType, ''); resetTimer() }} />
                          }
                        </div>
                      )
                    })}

                    {/* Dots */}
                    <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(usePackages ? packages : SHOOT_TYPES).map((item: any, i: number) => {
                          const dotColor = usePackages
                            ? (ACCENT[item.studio_type] ?? ACCENT.photography)
                            : item.accent
                          return (
                            <button key={i} type="button" onClick={() => { setActive(i); resetTimer() }} style={{ width: active === i ? 28 : 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, background: active === i ? dotColor : 'oklch(0.82 0.01 80)', transition: 'all .3s cubic-bezier(.22,1,.36,1)' }} />
                          )
                        })}
                      </div>
                      <a href="/packages"
                        style={{ font: `600 11px/1 ${FB}`, color: '#1c1917', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999, border: '1px solid #dedbd7', background: '#fff', marginTop: 2 }}
                      >📦 Explore all packages →</a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
