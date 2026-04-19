'use client'
import { useRef, useEffect, useState } from 'react'
import { AMENITY_OPTIONS } from './types'
import { PillButton } from './AreaFilter'

interface Props {
  selected: string[]
  onChange: (amenities: string[]) => void
  studios: any[]
  currentFilters?: { types: string[]; areas: string[]; priceMin: number | null; priceMax: number | null }
}

export function AmenityFilter({ selected, onChange, studios, currentFilters }: Props) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState<string[]>(selected)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setLocal(selected) }, [selected])

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

  function countForAmenity(key: string) {
    return studios.filter(s => {
      if (currentFilters) {
        if (currentFilters.types.length > 0 && !currentFilters.types.includes(s.studio_type)) return false
        if (currentFilters.areas.length > 0 && !currentFilters.areas.includes(s.area?.toLowerCase())) return false
        if (currentFilters.priceMin != null && s.price_per_hour < currentFilters.priceMin) return false
        if (currentFilters.priceMax != null && s.price_per_hour > currentFilters.priceMax) return false
      }
      return s.studio_amenities?.[key] === true
    }).length
  }

  function toggle(key: string) {
    setLocal(l => l.includes(key) ? l.filter(a => a !== key) : [...l, key])
  }

  const active = selected.length > 0
  const label  = active ? `Amenities (${selected.length})` : 'Amenities'

  const availableOptions = AMENITY_OPTIONS.filter(opt => countForAmenity(opt.key) > 0 || local.includes(opt.key))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <PillButton label={label} active={active} onClick={() => setOpen(o => !o)} />

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          zIndex: 50,
          width: 260,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 16px 4px', fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Must-have amenities
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {(availableOptions.length > 0 ? availableOptions : AMENITY_OPTIONS).map(opt => {
              const cnt     = countForAmenity(opt.key)
              const checked = local.includes(opt.key)
              const disabled = cnt === 0 && !checked
              return (
                <label key={opt.key} style={{
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
                    onChange={() => toggle(opt.key)}
                    style={{ accentColor: '#84cc16', width: 15, height: 15, cursor: 'pointer' }}
                  />
                  <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{opt.label}</span>
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
