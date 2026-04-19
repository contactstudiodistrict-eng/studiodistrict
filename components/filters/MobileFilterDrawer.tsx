'use client'
import { useEffect, useState } from 'react'
import { FilterState, AMENITY_OPTIONS, applyFilters } from './types'
import { StudioTypeChips } from './StudioTypeChips'
import { ALL_AREAS } from './types'

interface Props {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFilterChange: (f: FilterState) => void
  studios: any[]
}

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN') }

export function MobileFilterDrawer({ isOpen, onClose, filters, onFilterChange, studios }: Props) {
  const [local, setLocal] = useState<FilterState>(filters)

  useEffect(() => { if (isOpen) setLocal(filters) }, [isOpen, filters])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const maxPrice = studios.length > 0
    ? Math.ceil(Math.max(...studios.map(s => s.price_per_hour)) / 500) * 500
    : 5000

  const filtered = applyFilters(studios, local)

  function set(partial: Partial<FilterState>) {
    setLocal(f => ({ ...f, ...partial }))
  }

  function studioAreas() {
    const areas = Array.from(new Set(studios.map(s => s.area).filter(Boolean))) as string[]
    return ALL_AREAS.filter(a => areas.some(sa => sa.toLowerCase() === a.toLowerCase()))
      .concat(areas.filter(sa => !ALL_AREAS.some(a => a.toLowerCase() === sa.toLowerCase())))
  }

  function countArea(area: string) {
    return studios.filter(s => s.area?.toLowerCase() === area.toLowerCase()).length
  }

  function countAmenity(key: string) {
    return studios.filter(s => {
      if (local.types.length > 0 && !local.types.includes(s.studio_type)) return false
      if (local.areas.length > 0 && !local.areas.includes(s.area?.toLowerCase())) return false
      return s.studio_amenities?.[key] === true
    }).length
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: '85vh',
        background: '#fff',
        borderRadius: '16px 16px 0 0',
        zIndex: 51,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.28s ease',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e5e7eb' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Filters</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#9ca3af', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

          {/* Studio type */}
          <Section title="Studio type">
            <StudioTypeChips
              selected={local.types}
              onChange={types => set({ types })}
              studios={studios}
              wrap
            />
          </Section>

          {/* Area */}
          <Section title="Area">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {studioAreas().map(area => {
                const areaLow = area.toLowerCase()
                const cnt     = countArea(area)
                const checked = local.areas.includes(areaLow)
                return (
                  <label key={area} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => set({ areas: checked ? local.areas.filter(a => a !== areaLow) : [...local.areas, areaLow] })}
                      style={{ accentColor: '#84cc16', width: 16, height: 16 }}
                    />
                    <span style={{ flex: 1, fontSize: 14, color: '#374151' }}>{area}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{cnt}</span>
                  </label>
                )
              })}
            </div>
          </Section>

          {/* Price range */}
          <Section title="Price per hour">
            <div style={{ padding: '4px 0 8px' }}>
              <div style={{ position: 'relative', height: 40, marginBottom: 12 }}>
                <div style={{ position: 'absolute', top: 18, left: 0, right: 0, height: 4, borderRadius: 2, background: '#e5e7eb' }}>
                  <div style={{
                    position: 'absolute',
                    left: `${((local.priceMin ?? 0) / maxPrice) * 100}%`,
                    right: `${100 - ((local.priceMax ?? maxPrice) / maxPrice) * 100}%`,
                    height: '100%', background: '#84cc16', borderRadius: 2,
                  }} />
                </div>
                <div style={{
                  position: 'absolute', top: 10, left: `calc(${((local.priceMin ?? 0) / maxPrice) * 100}% - 9px)`,
                  width: 18, height: 18, background: '#fff', border: '2px solid #84cc16',
                  borderRadius: '50%', pointerEvents: 'none', zIndex: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }} />
                <div style={{
                  position: 'absolute', top: 10, left: `calc(${((local.priceMax ?? maxPrice) / maxPrice) * 100}% - 9px)`,
                  width: 18, height: 18, background: '#fff', border: '2px solid #84cc16',
                  borderRadius: '50%', pointerEvents: 'none', zIndex: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }} />
                <input type="range" min={0} max={maxPrice} step={100} value={local.priceMin ?? 0}
                  onChange={e => set({ priceMin: Math.min(Number(e.target.value), (local.priceMax ?? maxPrice) - 100) || null })}
                  style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', zIndex: 3 }}
                />
                <input type="range" min={0} max={maxPrice} step={100} value={local.priceMax ?? maxPrice}
                  onChange={e => set({ priceMax: Math.max(Number(e.target.value), (local.priceMin ?? 0) + 100) })}
                  style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', zIndex: 4 }}
                />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                {fmt(local.priceMin ?? 0)} – {fmt(local.priceMax ?? maxPrice)} per hour
              </div>
            </div>
          </Section>

          {/* Amenities */}
          <Section title="Amenities">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
              {AMENITY_OPTIONS.map(opt => {
                const cnt     = countAmenity(opt.key)
                const checked = local.amenities.includes(opt.key)
                const disabled = cnt === 0 && !checked
                return (
                  <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => set({ amenities: checked ? local.amenities.filter(a => a !== opt.key) : [...local.amenities, opt.key] })}
                      style={{ accentColor: '#84cc16', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 13, color: '#374151' }}>{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </Section>
        </div>

        {/* Sticky footer */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #e5e7eb',
          padding: '12px 16px',
          display: 'flex', gap: 10,
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}>
          <button
            onClick={() => { set({ types: [], areas: [], priceMin: null, priceMax: null, amenities: [] }) }}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Clear all
          </button>
          <button
            onClick={() => { onFilterChange(local); onClose() }}
            style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: '#84cc16', color: '#111827', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Show {filtered.length} {filtered.length === 1 ? 'studio' : 'studios'}
          </button>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 16, borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}
