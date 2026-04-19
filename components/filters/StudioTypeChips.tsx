'use client'
import { STUDIO_TYPE_OPTIONS } from './types'

interface Props {
  selected: string[]
  onChange: (types: string[]) => void
  studios: any[]
  wrap?: boolean
}

export function StudioTypeChips({ selected, onChange, studios, wrap = false }: Props) {
  function count(type: string) {
    return studios.filter(s => s.studio_type === type).length
  }

  function toggle(type: string) {
    onChange(selected.includes(type) ? selected.filter(t => t !== type) : [...selected, type])
  }

  const allActive = selected.length === 0

  return (
    <div style={{
      display: 'flex',
      gap: 6,
      overflowX: wrap ? 'visible' : 'auto',
      flexWrap: wrap ? 'wrap' : 'nowrap',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      <Chip
        label={`All (${studios.length})`}
        active={allActive}
        onClick={() => onChange([])}
      />
      {STUDIO_TYPE_OPTIONS.map(t => (
        <Chip
          key={t.value}
          label={`${t.icon} ${t.label} (${count(t.value)})`}
          active={selected.includes(t.value)}
          onClick={() => toggle(t.value)}
        />
      ))}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 99,
        border: `1px solid ${active ? '#84cc16' : '#e5e7eb'}`,
        background: active ? '#84cc16' : 'transparent',
        color: active ? '#111827' : '#374151',
        fontWeight: active ? 600 : 400,
        fontSize: 13,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        flexShrink: 0,
        fontFamily: 'inherit',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {label}
    </button>
  )
}
