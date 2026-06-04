'use client'
// components/shared/HeroBanner.tsx — Dynamic hero v2 (full-bleed + use-case carousel)
import { useState, useEffect, useRef, useCallback } from 'react'

// ── Font stacks ────────────────────────────────────────────────────────────
const FD = 'var(--font-bricolage,"Bricolage Grotesque",system-ui,sans-serif)'
const FB = 'var(--font-hanken,"Hanken Grotesk",system-ui,sans-serif)'
const FM = 'var(--font-jetbrains,"JetBrains Mono",monospace)'

// ── Constants ─────────────────────────────────────────────────────────────
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

const AREA_OPTIONS = [
  { label: 'Any area', value: '' },
  ...['Velachery','OMR','Anna Nagar','T. Nagar','Adyar',
      'Sholinganallur','Porur','Vadapalani','Mylapore','Tambaram']
    .map(a => ({ label: a, value: a })),
]

const SHOOT_TYPES = [
  {
    title: 'Product Shoot',      tagline: 'Make your products irresistible',
    from: '₹800',   studios: 38, tags: ['Flat-lay setup', 'Light tent', '360° rig'],
    accent: 'oklch(0.64 0.19 36)', accentBg: 'oklch(0.95 0.04 36)',
    searchType: 'photography', emoji: '📸',
  },
  {
    title: 'Reel / Content',     tagline: 'Stand out on Instagram & YouTube',
    from: '₹500',   studios: 52, tags: ['Ring lights', 'Neon walls', 'Teleprompter'],
    accent: 'oklch(0.58 0.18 280)', accentBg: 'oklch(0.95 0.04 280)',
    searchType: 'videography', emoji: '🎬',
  },
  {
    title: 'Podcast Recording',  tagline: 'Crystal-clear audio, zero hassle',
    from: '₹1,200', studios: 22, tags: ['Soundproofed', 'Dual mics', 'Mixer'],
    accent: 'oklch(0.62 0.19 155)', accentBg: 'oklch(0.95 0.04 155)',
    searchType: 'audio', emoji: '🎙',
  },
  {
    title: 'Family Portraits',   tagline: 'Memories that last generations',
    from: '₹1,500', studios: 29, tags: ['Backdrops', 'Props', 'Print-ready'],
    accent: 'oklch(0.60 0.18 50)', accentBg: 'oklch(0.95 0.04 50)',
    searchType: 'photography', emoji: '👨‍👩‍👧',
  },
  {
    title: 'Music Video',        tagline: 'Bring your tracks to life',
    from: '₹2,000', studios: 16, tags: ['Green screen', 'LED panels', 'Dolly'],
    accent: 'oklch(0.55 0.19 320)', accentBg: 'oklch(0.95 0.04 320)',
    searchType: 'videography', emoji: '🎵',
  },
  {
    title: 'Corporate Headshots',tagline: 'Professional profiles in 30 min',
    from: '₹600',   studios: 44, tags: ['Quick turnaround', 'LinkedIn-ready', 'Team pkg'],
    accent: 'oklch(0.45 0.12 250)', accentBg: 'oklch(0.95 0.03 250)',
    searchType: 'photography', emoji: '💼',
  },
]

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
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
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
            <button
              key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 9,
                border: 'none', cursor: 'pointer', font: `500 14px/1.2 ${FB}`,
                color: opt.value === value ? '#65a30d' : '#1c1917',
                background: opt.value === value ? '#f7fee7' : 'transparent',
                transition: 'background .1s',
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = '#f5f3f1' }}
              onMouseLeave={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Shoot-type carousel card ───────────────────────────────────────────────
function ShootCard({
  shoot, offset, imgH, onClick, onCta,
}: {
  shoot: typeof SHOOT_TYPES[0]
  offset: number
  imgH: number
  onClick: () => void
  onCta: () => void
}) {
  let transform: string, opacity: number, zIndex: number
  if (offset === 0)     { transform = 'translateY(0) scale(1)';       opacity = 1;   zIndex = 6 }
  else if (offset === 1) { transform = 'translateY(22px) scale(0.96)'; opacity = 0.6; zIndex = 5 }
  else if (offset === 2) { transform = 'translateY(40px) scale(0.92)'; opacity = 0.3; zIndex = 4 }
  else                   { transform = 'translateY(55px) scale(0.88)'; opacity = 0;   zIndex = 1 }

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 22, overflow: 'hidden', cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: offset === 0 ? '0 28px 70px -20px rgba(20,16,12,0.35)' : '0 12px 30px -16px rgba(20,16,12,0.2)',
        transition: 'all .55s cubic-bezier(0.22,1,0.36,1)',
        transform, opacity, zIndex,
      }}
    >
      {/* Image strip */}
      <div style={{
        height: imgH, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${shoot.accentBg} 0%, ${shoot.accent}44 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 48, lineHeight: 1 }}>{shoot.emoji}</span>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 50%,rgba(20,16,12,0.5) 100%)' }} />
        <span style={{
          position: 'absolute', top: 12, left: 12,
          font: `600 11px/1 ${FB}`, color: '#fff', padding: '6px 12px', borderRadius: 999,
          background: 'rgba(20,16,12,0.5)', backdropFilter: 'blur(8px)',
        }}>{shoot.title}</span>
        <span style={{
          position: 'absolute', top: 12, right: 12,
          font: `600 10px/1 ${FM}`, letterSpacing: '0.04em', color: '#fff',
          padding: '6px 10px', borderRadius: 999, background: 'rgba(20,16,12,0.5)', backdropFilter: 'blur(8px)',
        }}>{shoot.studios} studios</span>
        <span style={{
          position: 'absolute', bottom: 12, left: 14, right: 14,
          font: `500 13px/1.3 ${FB}`, color: '#fff',
        }}>{shoot.tagline}</span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ font: `600 17px/1.2 ${FD}`, color: '#1c1917', letterSpacing: '-0.01em' }}>{shoot.title}</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <span style={{ font: `600 9px/1 ${FM}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9b8e84' }}>from</span>
            <span style={{ font: `700 18px/1 ${FD}`, color: shoot.accent }}>
              {shoot.from}<span style={{ font: `500 11px/1 ${FB}`, color: '#9b8e84' }}>/hr</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
          {shoot.tags.map(t => (
            <span key={t} style={{
              font: `500 11px/1 ${FB}`, color: '#2b2824',
              padding: '5px 9px', borderRadius: 999,
              background: shoot.accentBg, border: `1px solid ${shoot.accent}33`,
            }}>{t}</span>
          ))}
        </div>

        <button
          type="button"
          onClick={e => { e.stopPropagation(); onCta() }}
          style={{
            width: '100%', marginTop: 12, padding: '11px 0', borderRadius: 10, border: 'none',
            background: shoot.accent, color: '#fff',
            font: `600 12px/1 ${FB}`, cursor: 'pointer', transition: 'filter .15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = 'brightness(0.88)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = 'none')}
        >
          Browse {shoot.title.toLowerCase()} studios →
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
interface Props {
  thumbnails?: string[]
  onSearch?: (type: string, area: string) => void
}

export function HeroBanner({ thumbnails = [], onSearch }: Props) {
  const [wordIdx,  setWordIdx]  = useState(0)
  const [wordAnim, setWordAnim] = useState<'enter' | 'exit'>('enter')
  const [type,     setType]     = useState('')
  const [area,     setArea]     = useState('')
  const [active,   setActive]   = useState(0)
  const [vw,       setVw]       = useState(1280) // SSR-safe default

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    timerRef.current = setInterval(() => setActive(a => (a + 1) % SHOOT_TYPES.length), 4200)
  }, [])
  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [resetTimer])

  // Viewport width for responsive card sizing
  useEffect(() => {
    setVw(window.innerWidth)
    const h = () => setVw(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const mobile = vw < 768
  const tablet = vw >= 768 && vw < 1024

  const cardW  = mobile ? 290 : tablet ? 320 : 360
  const cardH  = mobile ? 420 : tablet ? 450 : 476
  const imgH   = mobile ? 160 : tablet ? 180 : 200

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    onSearch?.(type, area)
  }

  const heroImg = thumbnails[0]

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#fff' }}>

      {/* ── CSS ──────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sd2-word-in  { from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1} }
        @keyframes sd2-word-out { from{transform:translateY(0);opacity:1}to{transform:translateY(-100%);opacity:0} }
        .sd2-wi { animation: sd2-word-in  .4s  cubic-bezier(.22,1,.36,1) forwards; }
        .sd2-wo { animation: sd2-word-out .35s cubic-bezier(.55,0,1,.45) forwards; }

        @keyframes sd2-up { from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1} }
        .sd2-f1{animation:sd2-up .7s .10s cubic-bezier(.22,1,.36,1) both}
        .sd2-f2{animation:sd2-up .7s .25s cubic-bezier(.22,1,.36,1) both}
        .sd2-f3{animation:sd2-up .7s .40s cubic-bezier(.22,1,.36,1) both}
        .sd2-f4{animation:sd2-up .7s .55s cubic-bezier(.22,1,.36,1) both}
        .sd2-f5{animation:sd2-up .7s .85s cubic-bezier(.22,1,.36,1) both}

        @keyframes sd2-glow { 0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)} }
        .sd2-glow{ animation: sd2-glow 6s ease-in-out infinite; }

        /* Desktop gradient: L→R white → transparent */
        .sd2-grad { background: linear-gradient(90deg,
          rgba(255,255,255,0.98) 0%,
          rgba(255,255,255,0.96) 34%,
          rgba(255,255,255,0.75) 48%,
          rgba(255,255,255,0.30) 62%,
          rgba(255,255,255,0.08) 78%,
          transparent 100%
        );}
        /* Mobile gradient: top→bottom */
        @media(max-width:767px){
          .sd2-grad{ background: linear-gradient(180deg,
            rgba(255,255,255,0.97) 0%,
            rgba(255,255,255,0.94) 50%,
            rgba(255,255,255,0.60) 75%,
            rgba(255,255,255,0.30) 90%,
            rgba(255,255,255,0.15) 100%
          );}
        }
        /* Tablet gradient: shifted stops */
        @media(min-width:768px) and (max-width:1023px){
          .sd2-grad{ background: linear-gradient(90deg,
            rgba(255,255,255,0.98) 0%,
            rgba(255,255,255,0.96) 40%,
            rgba(255,255,255,0.75) 55%,
            rgba(255,255,255,0.30) 68%,
            rgba(255,255,255,0.08) 82%,
            transparent 100%
          );}
        }

        .sd2-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          min-height: 100vh;
          padding: 0 48px;
        }
        .sd2-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 64px 40px 72px 0;
        }
        .sd2-right {
          display: flex; align-items: center; justify-content: center;
          padding: 48px 0 72px;
        }
        .sd2-search-row { flex-direction: row; }

        @media(min-width:768px) and (max-width:1023px){
          .sd2-grid { grid-template-columns: 1.1fr 0.9fr; min-height: 90vh; padding: 0 32px; }
          .sd2-left { padding: 56px 32px 64px 0; }
        }
        @media(max-width:767px){
          .sd2-grid { display: flex; flex-direction: column; min-height: auto; padding: 0 20px; }
          .sd2-left { padding: 24px 0 32px; }
          .sd2-right { padding: 0 0 48px; }
          .sd2-search-row { flex-direction: column; }
        }
      `}} />

      {/* ── Full-bleed background image ───────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {heroImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f7fee7 0%, #fef9c3 40%, #f0fdf4 100%)' }} />
        )}
      </div>

      {/* ── Gradient blend overlay ────────────────────────────── */}
      <div className="sd2-grad" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      {/* ── Ambient glow blobs ────────────────────────────────── */}
      <div className="sd2-glow" style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(132,204,22,0.18) 0%,transparent 70%)',
        top: -100, left: -60, zIndex: 1, pointerEvents: 'none',
      }} />
      <div className="sd2-glow" style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)',
        bottom: -80, right: mobile ? -80 : '28%', zIndex: 1, pointerEvents: 'none', animationDelay: '3s',
      }} />

      {/* ── Content ───────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        <div className="sd2-grid">

          {/* LEFT — copy + search */}
          <div className="sd2-left">

            {/* Eyebrow */}
            <div className="sd2-f1">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                font: `600 11px/1 ${FM}`, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'oklch(0.5 0.05 36)', padding: '8px 16px', borderRadius: 999,
                background: 'oklch(0.97 0.015 40)', border: '1px solid oklch(0.9 0.03 40)',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#84cc16', display: 'inline-block' }} />
                Live in Chennai
              </span>
            </div>

            {/* Headline */}
            <h1
              className="sd2-f2"
              style={{
                fontFamily: FD, fontWeight: 700, letterSpacing: '-0.03em',
                fontSize: mobile ? 40 : tablet ? 52 : 68,
                lineHeight: 1.04, color: 'oklch(0.18 0.012 60)', margin: '24px 0 0',
              }}
            >
              Your next<br />
              <span style={{ display: 'inline-flex', overflow: 'hidden', height: '1.08em', verticalAlign: 'bottom' }}>
                <span
                  className={wordAnim === 'enter' ? 'sd2-wi' : 'sd2-wo'}
                  style={{ display: 'inline-block', color: ROTATE_COLORS[wordIdx] }}
                >
                  {ROTATE_WORDS[wordIdx]}
                </span>
              </span>
              <br />studio is here.
            </h1>

            {/* Description */}
            <p className="sd2-f3" style={{
              fontFamily: FB, fontSize: mobile ? 16 : 18, lineHeight: 1.55,
              color: 'oklch(0.42 0.012 60)', margin: '20px 0 0', maxWidth: 460,
            }}>
              Stop scrolling classifieds. Browse{' '}
              <strong style={{ color: 'oklch(0.18 0.012 60)' }}>verified studios</strong> across Chennai —
              see real photos, check availability, and book in under 2 minutes.
            </p>

            {/* Search bar */}
            <form className="sd2-f4" onSubmit={handleSearch} style={{ marginTop: mobile ? 24 : 34, maxWidth: 560 }}>
              <div
                className="sd2-search-row"
                style={{
                  display: 'flex', alignItems: 'stretch',
                  background: '#fff', border: '1px solid #dedbd7',
                  borderRadius: mobile ? 16 : 18, padding: mobile ? 6 : 7,
                  boxShadow: '0 20px 50px -20px rgba(20,16,12,0.22)',
                }}
              >
                <div style={{ flex: 1, padding: mobile ? '10px 14px' : '10px 18px' }}>
                  <HeroDropdown label="Studio type" options={STUDIO_TYPES} value={type} onChange={setType} />
                </div>
                <div style={mobile
                  ? { height: 1, background: '#e3e0dd', margin: '0 8px' }
                  : { width: 1,  background: '#e3e0dd', margin: '8px 0', flexShrink: 0 }
                } />
                <div style={{ flex: 1, padding: mobile ? '10px 14px' : '10px 18px' }}>
                  <HeroDropdown label="Area" options={AREA_OPTIONS} value={area} onChange={setArea} />
                </div>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0,
                    font: `600 14px/1 ${FB}`, color: '#111827',
                    background: '#84cc16', border: 'none',
                    borderRadius: mobile ? 12 : 13, padding: mobile ? '14px 20px' : '0 24px',
                    marginTop: mobile ? 4 : 0, cursor: 'pointer', transition: 'background .15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#65a30d')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#84cc16')}
                >
                  Search studios →
                </button>
              </div>
            </form>

            {/* Trust strip */}
            <div className="sd2-f4" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 22px', marginTop: 16 }}>
              {['Verified studios', 'Instant booking', 'Pay after confirm'].map(t => (
                <span key={t} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  font: `500 ${mobile ? 12 : 13}px/1 ${FB}`, color: 'oklch(0.45 0.012 60)',
                }}>
                  <span style={{ color: '#22c55e' }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — stacked use-case carousel */}
          <div className="sd2-right">
            <div className="sd2-f5" style={{ position: 'relative', width: cardW, height: cardH + 70 }}>

              {SHOOT_TYPES.map((shoot, i) => {
                const offset = ((i - active + SHOOT_TYPES.length) % SHOOT_TYPES.length)
                return (
                  <ShootCard
                    key={shoot.title}
                    shoot={shoot}
                    offset={offset}
                    imgH={imgH}
                    onClick={() => { setActive(i); resetTimer() }}
                    onCta={() => { onSearch?.(shoot.searchType, ''); resetTimer() }}
                  />
                )
              })}

              {/* Dot indicators */}
              <div style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 8, alignItems: 'center',
              }}>
                {SHOOT_TYPES.map((shoot, i) => (
                  <button
                    key={i} type="button"
                    onClick={() => { setActive(i); resetTimer() }}
                    style={{
                      width: active === i ? 28 : 8, height: 8, borderRadius: 999, border: 'none',
                      cursor: 'pointer', padding: 0, flexShrink: 0,
                      background: active === i ? shoot.accent : 'oklch(0.82 0.01 80)',
                      transition: 'all .3s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
