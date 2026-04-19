'use client'
import { FilterState, SORT_OPTIONS, AMENITY_OPTIONS, DEFAULT_FILTERS } from './types'
import { STUDIO_TYPE_OPTIONS } from './types'
import { ALL_AREAS } from './types'

interface Props {
  count: number
  filtersActive: boolean
  filters: FilterState
  onFilterChange: (f: FilterState) => void
}

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN') }

export function ResultsHeader({ count, filtersActive, filters, onFilterChange }: Props) {
  const typeLabel = (type: string) =>
    STUDIO_TYPE_OPTIONS.find(t => t.value === type)?.label ?? type
  const areaLabel = (area: string) =>
    ALL_AREAS.find(a => a.toLowerCase() === area) ?? area.charAt(0).toUpperCase() + area.slice(1)
  const amenityLabel = (key: string) =>
    AMENITY_OPTIONS.find(a => a.key === key)?.label ?? key

  const activeChips: { key: string; label: string; onRemove: () => void }[] = []

  filters.types.forEach(t =>
    activeChips.push({
      key: `type:${t}`,
      label: typeLabel(t),
      onRemove: () => onFilterChange({ ...filters, types: filters.types.filter(x => x !== t) }),
    })
  )
  filters.areas.forEach(a =>
    activeChips.push({
      key: `area:${a}`,
      label: areaLabel(a),
      onRemove: () => onFilterChange({ ...filters, areas: filters.areas.filter(x => x !== a) }),
    })
  )
  if (filters.priceMin != null || filters.priceMax != null) {
    activeChips.push({
      key: 'price',
      label: `${fmt(filters.priceMin ?? 0)} – ${fmt(filters.priceMax ?? 9999)}`,
      onRemove: () => onFilterChange({ ...filters, priceMin: null, priceMax: null }),
    })
  }
  filters.amenities.forEach(k =>
    activeChips.push({
      key: `amenity:${k}`,
      label: amenityLabel(k),
      onRemove: () => onFilterChange({ ...filters, amenities: filters.amenities.filter(x => x !== k) }),
    })
  )

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Count + sort row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
            Studios in Chennai
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
            {count === 0
              ? 'No studios match your filters'
              : filtersActive
                ? `${count} ${count === 1 ? 'studio' : 'studios'} match your filters`
                : `${count} ${count === 1 ? 'studio' : 'studios'} available`}
          </p>
        </div>

        {/* Sort dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={e => onFilterChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            style={{
              padding: '7px 32px 7px 12px',
              borderRadius: 99,
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#374151',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
            }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {activeChips.map(chip => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 99,
                border: '1px solid #84cc16',
                background: '#f0fdf4',
                color: '#166534',
                fontSize: 12, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {chip.label}
              <span style={{ fontSize: 11, opacity: 0.7 }}>×</span>
            </button>
          ))}
          <button
            onClick={() => onFilterChange({ ...DEFAULT_FILTERS, sortBy: filters.sortBy })}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99,
              border: '1px solid #fca5a5',
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Clear all ×
          </button>
        </div>
      )}
    </div>
  )
}
