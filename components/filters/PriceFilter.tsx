'use client'
import { useRef, useEffect, useState } from 'react'
import { PillButton } from './AreaFilter'

interface Props {
  min: number | null
  max: number | null
  onChange: (min: number | null, max: number | null) => void
  studios: any[]
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

export function PriceFilter({ min, max, onChange, studios }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const maxPrice = studios.length > 0
    ? Math.ceil(Math.max(...studios.map(s => s.price_per_hour)) / 500) * 500
    : 5000

  const [localMin, setLocalMin] = useState(min ?? 0)
  const [localMax, setLocalMax] = useState(max ?? maxPrice)

  useEffect(() => { setLocalMin(min ?? 0) }, [min])
  useEffect(() => { setLocalMax(max ?? maxPrice) }, [max, maxPrice])

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('keydown', handleKey) }
  }, [open])

  const active = min != null || max != null
  const labelText = active
    ? `${fmt(min ?? 0)} – ${fmt(max ?? maxPrice)}`
    : 'Price'

  const rangeInStudios = studios.filter(s =>
    s.price_per_hour >= localMin && s.price_per_hour <= localMax
  ).length

  const leftPct  = (localMin / maxPrice) * 100
  const rightPct = (localMax / maxPrice) * 100

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <PillButton label={labelText} active={active} onClick={() => setOpen(o => !o)} />

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 50,
          width: 280,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          padding: '16px',
        }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Price per hour
          </div>

          {/* Dual range track + overlapping inputs */}
          <div style={{ position: 'relative', height: 40, marginBottom: 12 }}>
            {/* Track */}
            <div style={{ position: 'absolute', top: 18, left: 0, right: 0, height: 4, borderRadius: 2, background: '#e5e7eb' }}>
              <div style={{
                position: 'absolute',
                left: `${leftPct}%`,
                right: `${100 - rightPct}%`,
                height: '100%',
                background: '#84cc16',
                borderRadius: 2,
              }} />
            </div>

            {/* Min thumb visual */}
            <div style={{
              position: 'absolute',
              top: 10,
              left: `calc(${leftPct}% - 9px)`,
              width: 18, height: 18,
              background: '#fff',
              border: '2px solid #84cc16',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }} />

            {/* Max thumb visual */}
            <div style={{
              position: 'absolute',
              top: 10,
              left: `calc(${rightPct}% - 9px)`,
              width: 18, height: 18,
              background: '#fff',
              border: '2px solid #84cc16',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }} />

            {/* Invisible range inputs */}
            <input
              type="range" min={0} max={maxPrice} step={100} value={localMin}
              onChange={e => setLocalMin(Math.min(Number(e.target.value), localMax - 100))}
              style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', zIndex: localMin > maxPrice * 0.8 ? 4 : 3 }}
            />
            <input
              type="range" min={0} max={maxPrice} step={100} value={localMax}
              onChange={e => setLocalMax(Math.max(Number(e.target.value), localMin + 100))}
              style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', zIndex: 4 }}
            />
          </div>

          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
            {fmt(localMin)} – {fmt(localMax)} per hour
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
            {rangeInStudios} {rangeInStudios === 1 ? 'studio' : 'studios'} in this range
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: 10 }}>
            <button onClick={() => { setLocalMin(0); setLocalMax(maxPrice); onChange(null, null); setOpen(false) }}
              style={{ fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear
            </button>
            <button onClick={() => {
              onChange(localMin > 0 ? localMin : null, localMax < maxPrice ? localMax : null)
              setOpen(false)
            }}
              style={{ fontSize: 13, fontWeight: 600, color: '#111827', background: '#84cc16', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
