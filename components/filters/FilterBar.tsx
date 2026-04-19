'use client'
import { useRef, useEffect, useState } from 'react'
import { FilterState, countActiveFilters } from './types'
import { StudioTypeChips } from './StudioTypeChips'
import { AreaFilter } from './AreaFilter'
import { PriceFilter } from './PriceFilter'
import { AmenityFilter } from './AmenityFilter'
import { MobileFilterDrawer } from './MobileFilterDrawer'

interface Props {
  filters: FilterState
  onFilterChange: (f: FilterState) => void
  studios: any[]
}

export function FilterBar({ filters, onFilterChange, studios }: Props) {
  const [isSticky, setIsSticky]     = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const obs = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [])

  const nonTypeActive = countActiveFilters({ ...filters, types: [] })

  return (
    <>
      {/* Sentinel — sits just above the bar's natural position */}
      <div ref={sentinelRef} style={{ height: 1, marginBottom: -1 }} />

      <div
        id="filter-bar"
        style={{
          position: 'sticky',
          top: 56, // below h-14 SiteHeader
          zIndex: 40,
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: isSticky ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          transition: 'box-shadow 0.2s',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* ── Desktop ── */}
          <div className="hidden md:flex" style={{ flex: 1, alignItems: 'center', gap: 8, minWidth: 0 }}>
            {/* Type chips — scrollable */}
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <StudioTypeChips
                selected={filters.types}
                onChange={types => onFilterChange({ ...filters, types })}
                studios={studios}
              />
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: '#e5e7eb', flexShrink: 0 }} />

            {/* Dropdown pills */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <AreaFilter
                selected={filters.areas}
                onChange={areas => onFilterChange({ ...filters, areas })}
                studios={studios}
              />
              <PriceFilter
                min={filters.priceMin}
                max={filters.priceMax}
                onChange={(priceMin, priceMax) => onFilterChange({ ...filters, priceMin, priceMax })}
                studios={studios}
              />
              <AmenityFilter
                selected={filters.amenities}
                onChange={amenities => onFilterChange({ ...filters, amenities })}
                studios={studios}
                currentFilters={filters}
              />
            </div>
          </div>

          {/* ── Mobile ── */}
          <div className="flex md:hidden" style={{ flex: 1, alignItems: 'center', gap: 8, minWidth: 0 }}>
            {/* Type chips scroll */}
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <StudioTypeChips
                selected={filters.types}
                onChange={types => onFilterChange({ ...filters, types })}
                studios={studios}
              />
            </div>

            {/* Filters button */}
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px',
                borderRadius: 99,
                border: `1px solid ${nonTypeActive > 0 ? '#84cc16' : '#e5e7eb'}`,
                background: nonTypeActive > 0 ? '#f0fdf4' : '#fff',
                color: nonTypeActive > 0 ? '#166534' : '#374151',
                fontWeight: nonTypeActive > 0 ? 600 : 400,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                <path d="M0 1h14M3 6h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Filters
              {nonTypeActive > 0 && (
                <span style={{
                  background: '#84cc16', color: '#111827',
                  borderRadius: 99, width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {nonTypeActive}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <MobileFilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onFilterChange={f => { onFilterChange(f); setDrawerOpen(false) }}
        studios={studios}
      />
    </>
  )
}
