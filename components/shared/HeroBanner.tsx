'use client'
// components/shared/HeroBanner.tsx — Dynamic hero (Design D)
import { useState, useEffect, useRef } from 'react'

const ROTATE_WORDS  = ['Photography', 'Podcast', 'Video', 'Music']
const ROTATE_COLORS = ['#84cc16', '#7c3aed', '#059669', '#d97706']

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

const SAMPLE_CARDS = [
  { title: 'Lumière Studio Co.',  loc: 'Velachery',  price: '₹1,200/hr', rating: '4.9', emoji: '📸' },
  { title: 'SoundBox OMR',        loc: 'OMR',         price: '₹800/hr',   rating: '4.8', emoji: '🎙' },
  { title: 'Frame & Co. Studios', loc: 'Anna Nagar',  price: '₹1,500/hr', rating: '5.0', emoji: '🎬' },
]

const CARD_POSITIONS: React.CSSProperties[] = [
  { top: 48,  left: -24 },
  { top: 210, right: -12 },
  { bottom: 64, left: 28 },
]

// Shared font stacks so we degrade gracefully if CSS vars aren't loaded yet
const F_DISPLAY = 'var(--font-bricolage,"Bricolage Grotesque",system-ui,sans-serif)'
const F_BODY    = 'var(--font-hanken,"Hanken Grotesk",system-ui,sans-serif)'
const F_MONO    = 'var(--font-jetbrains,"JetBrains Mono",monospace)'

// ── Custom dropdown ────────────────────────────────────────────────────────
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
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 18px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
          <span style={{ font: `600 10px/1 ${F_MONO}`, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9b8e84' }}>
            {label}
          </span>
          <span style={{
            font: `500 15px/1.2 ${F_BODY}`, color: value ? '#1c1917' : '#9b8e84',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {selected?.label}
          </span>
        </span>
        <span style={{
          color: '#9b8e84', fontSize: 11, flexShrink: 0, display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s',
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: -8, right: -8, zIndex: 50,
          background: '#fff', border: '1px solid #dedbd7', borderRadius: 14,
          boxShadow: '0 18px 50px -12px rgba(20,16,12,0.32)',
          padding: 6, maxHeight: 280, overflowY: 'auto',
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 9,
                border: 'none', cursor: 'pointer',
                font: `500 14px/1.2 ${F_BODY}`,
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

// ── Hero ──────────────────────────────────────────────────────────────────
interface Props {
  thumbnails?: string[]
  onSearch?: (type: string, area: string) => void
}

export function HeroBanner({ thumbnails = [], onSearch }: Props) {
  const [wordIdx,   setWordIdx]   = useState(0)
  const [wordAnim,  setWordAnim]  = useState<'enter' | 'exit'>('enter')
  const [type, setType] = useState('')
  const [area, setArea] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      setWordAnim('exit')
      setTimeout(() => {
        setWordIdx(i => (i + 1) % ROTATE_WORDS.length)
        setWordAnim('enter')
      }, 350)
    }, 2400)
    return () => clearInterval(id)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    onSearch?.(type, area)
  }

  const heroImg  = thumbnails[0]
  const cardImgs = [thumbnails[1], thumbnails[2], thumbnails[3]]

  return (
    <div style={{ position: 'relative', width: '100%', background: '#fff', overflow: 'hidden' }}>

      {/* ── Keyframes + responsive CSS ─────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sd-word-in  { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes sd-word-out { from{transform:translateY(0);opacity:1} to{transform:translateY(-100%);opacity:0} }
        .sd-word-enter { animation: sd-word-in  .4s  cubic-bezier(.22,1,.36,1) forwards; }
        .sd-word-exit  { animation: sd-word-out .35s cubic-bezier(.55,0,1,.45) forwards; }

        @keyframes sd-up { from{transform:translateY(28px);opacity:0} to{transform:translateY(0);opacity:1} }
        .sd-f1 { animation: sd-up .7s .10s cubic-bezier(.22,1,.36,1) both; }
        .sd-f2 { animation: sd-up .7s .25s cubic-bezier(.22,1,.36,1) both; }
        .sd-f3 { animation: sd-up .7s .40s cubic-bezier(.22,1,.36,1) both; }
        .sd-f4 { animation: sd-up .7s .55s cubic-bezier(.22,1,.36,1) both; }

        @keyframes sd-bob1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes sd-bob2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes sd-bob3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .sd-bob1 { animation: sd-bob1 4.5s        ease-in-out infinite; }
        .sd-bob2 { animation: sd-bob2 5.2s  .8s   ease-in-out infinite; }
        .sd-bob3 { animation: sd-bob3 4.8s  1.6s  ease-in-out infinite; }

        @keyframes sd-glow { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:.75;transform:scale(1.05)} }
        .sd-glow { animation: sd-glow 6s ease-in-out infinite; }

        .sd-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          min-height: 620px;
          padding: 0 48px;
        }
        .sd-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 56px 40px 60px 0;
        }
        .sd-right {
          position: relative; display: flex;
          align-items: center; justify-content: center;
          padding: 56px 0 60px;
        }
        .sd-h1 { font-size: 64px; line-height: 1.02; }
        .sd-cards { display: contents; }

        @media (max-width: 1023px) {
          .sd-grid { grid-template-columns: 1fr; min-height: auto; padding: 0 24px; }
          .sd-left { padding: 40px 0 28px; }
          .sd-right { min-height: 280px; padding: 0 0 48px; }
          .sd-h1 { font-size: 44px; }
          .sd-cards { display: none; }
        }
        @media (max-width: 767px) {
          .sd-grid { padding: 0 20px; }
          .sd-h1 { font-size: 36px; }
          .sd-right { min-height: 220px; }
        }
        @media (max-width: 479px) {
          .sd-grid { padding: 0 16px; }
          .sd-h1 { font-size: 30px; }
        }
      `}} />

      {/* ── Ambient glow blobs ──────────────────────────────────── */}
      <div className="sd-glow" style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(132,204,22,.14) 0%,transparent 70%)',
        top: -80, right: -60, pointerEvents: 'none', zIndex: 0,
      }} />
      <div className="sd-glow" style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(124,58,237,.07) 0%,transparent 70%)',
        bottom: -100, left: -40, pointerEvents: 'none', zIndex: 0, animationDelay: '3s',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="sd-grid">

          {/* ── LEFT ─────────────────────────────────────────────── */}
          <div className="sd-left">

            {/* Eyebrow badge */}
            <div className="sd-f1">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                font: `600 11px/1 ${F_MONO}`, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#6b6560', padding: '8px 16px', borderRadius: 999,
                background: '#faf5f0', border: '1px solid #ede0d5',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#84cc16', display: 'inline-block' }} />
                Live in Chennai
              </span>
            </div>

            {/* Headline */}
            <h1 className="sd-f2 sd-h1" style={{
              fontFamily: F_DISPLAY, fontWeight: 700,
              letterSpacing: '-0.03em', color: '#1c1917',
              margin: '24px 0 0', lineHeight: 'inherit',
            }}>
              Your next<br />
              <span style={{ display: 'inline-flex', overflow: 'hidden', height: '1.08em', verticalAlign: 'bottom' }}>
                <span
                  className={wordAnim === 'enter' ? 'sd-word-enter' : 'sd-word-exit'}
                  style={{ display: 'inline-block', color: ROTATE_COLORS[wordIdx] }}
                >
                  {ROTATE_WORDS[wordIdx]}
                </span>
              </span>
              <br />studio is here.
            </h1>

            {/* Description */}
            <p className="sd-f3" style={{
              fontFamily: F_BODY, fontSize: 17, lineHeight: 1.55,
              color: '#6b6560', margin: '20px 0 0', maxWidth: 460,
            }}>
              Stop scrolling classifieds. Browse{' '}
              <strong style={{ color: '#1c1917' }}>verified studios</strong> across Chennai —
              see real photos, check availability, and book in under 2 minutes.
            </p>

            {/* Search bar */}
            <form className="sd-f4" onSubmit={handleSearch} style={{ marginTop: 32, maxWidth: 560 }}>
              <div style={{
                display: 'flex', alignItems: 'stretch',
                background: '#fff', border: '1px solid #dedbd7',
                borderRadius: 18, padding: 7,
                boxShadow: '0 20px 50px -20px rgba(20,16,12,0.18)',
              }}>
                <HeroDropdown label="Studio type" options={STUDIO_TYPES} value={type} onChange={setType} />
                <div style={{ width: 1, background: '#e3e0dd', margin: '8px 0', flexShrink: 0 }} />
                <HeroDropdown label="Area" options={AREA_OPTIONS} value={area} onChange={setArea} />
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
                    font: `600 15px/1 ${F_BODY}`, color: '#111827',
                    background: '#84cc16', border: 'none', borderRadius: 13,
                    padding: '0 24px', cursor: 'pointer', transition: 'background .15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#65a30d')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#84cc16')}
                >
                  Search →
                </button>
              </div>
            </form>

            {/* Trust strip */}
            <div className="sd-f4" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 24px', marginTop: 18 }}>
              {['Verified studios', 'Instant booking', 'Pay after confirm'].map(t => (
                <span key={t} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  font: `500 13px/1 ${F_BODY}`, color: '#746e68',
                }}>
                  <span style={{ color: '#22c55e' }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────────────────── */}
          <div className="sd-right">

            {/* Hero image backdrop */}
            <div style={{
              position: 'absolute', width: '88%', height: '82%',
              borderRadius: 28, overflow: 'hidden', top: '9%', right: 0,
              background: heroImg ? undefined : 'linear-gradient(135deg,#f7fee7 0%,#ecfccb 50%,#d9f99d 100%)',
            }}>
              {heroImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImg} alt="Studio interior" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>
                  📸
                </div>
              )}
            </div>

            {/* Floating studio cards — hidden below 1024px via CSS */}
            <div className="sd-cards">
              {SAMPLE_CARDS.map((card, i) => (
                <div
                  key={card.title}
                  className={`sd-bob${i + 1}`}
                  style={{
                    position: 'absolute', ...CARD_POSITIONS[i],
                    zIndex: 8, background: '#fff', borderRadius: 16,
                    padding: '12px 14px',
                    boxShadow: '0 16px 44px -12px rgba(20,16,12,0.28)',
                    border: '1px solid #eae8e5',
                    display: 'flex', gap: 12, alignItems: 'center', minWidth: 220,
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, overflow: 'hidden',
                    flexShrink: 0, background: '#f7fee7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {cardImgs[i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cardImgs[i]} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 22 }}>{card.emoji}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                    <span style={{ font: `600 13px/1.2 ${F_BODY}`, color: '#1c1917', whiteSpace: 'nowrap' }}>
                      {card.title}
                    </span>
                    <span style={{ font: `400 11px/1 ${F_BODY}`, color: '#746e68' }}>
                      {card.loc}
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                      <span style={{ font: `600 13px/1 ${F_BODY}`, color: '#84cc16' }}>{card.price}</span>
                      <span style={{ font: `400 11px/1 ${F_BODY}`, color: '#746e68' }}>⭐ {card.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
