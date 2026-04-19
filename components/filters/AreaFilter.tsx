'use client'
import { useRef, useEffect, useState } from 'react'
import { ALL_AREAS } from './types'

interface Props {
  selected: string[]
  onChange: (areas: string[]) => void
  studios: any[]
}

export function AreaFilter({ selected, onChange, studios }: Props) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState<string[]>(selected)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setLocal(selected) }, [selected])

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('keydown', handleKey) }
  }, [open])

  // Derive areas that actually exist in studios data
  const studioAreas = Array.from(new Set(studios.map(s => s.area).filter(Boolean))) as string[]
  const displayAreas = ALL_AREAS.filter(a =>
    studioAreas.some(sa => sa.toLowerCase() === a.toLowerCase())
  ).concat(studioAreas.filter(sa => !ALL_AREAS.some(a => a.toLowerCase() === sa.toLowerCase())))

  function countForArea(areaLabel: string) {
    return studios.filter(s => s.area?.toLowerCase() === areaLabel.toLowerCase()).length
  }

  function toggle(areaLower: string) {
    setLocal(l => l.includes(areaLower) ? l.filter(a => a !== areaLower) : [...l, areaLower])
  }

  const active = selected.length > 0
  const label  = active ? `Area (${selected.length})` : 'Area'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <PillButton label={label} active={active} onClick={() => setOpen(o => !o)} />

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 50,
          width: 260,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 16px 4px', fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Select areas
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {displayAreas.map(area => {
              const areaLow = area.toLowerCase()
              const cnt     = countForArea(area)
              const checked = local.includes(areaLow)
              const disabled = cnt === 0
              return (
                <label
                  key={area}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 16px', cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                  }}
                  onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggle(areaLow)}
                    style={{ accentColor: '#84cc16', width: 15, height: 15, cursor: 'pointer' }}
                  />
                  <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{area}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{cnt}</span>
                </label>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid #e5e7eb' }}>
            <button onClick={() => { setLocal([]); onChange([]); setOpen(false) }}
              style={{ fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear
            </button>
            <button onClick={() => { onChange(local); setOpen(false) }}
              style={{ fontSize: 13, fontWeight: 600, color: '#111827', background: '#84cc16', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function PillButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px',
        borderRadius: 99,
        border: `1px solid ${active ? '#84cc16' : '#e5e7eb'}`,
        background: active ? '#f0fdf4' : '#fff',
        color: active ? '#166534' : '#374151',
        fontWeight: active ? 600 : 400,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center', gap: 4,
        transition: 'border-color 0.15s',
      }}
    >
      {label}
      <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
    </button>
  )
}
