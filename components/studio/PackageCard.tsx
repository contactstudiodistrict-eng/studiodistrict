'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatINR } from '@/lib/pricing'

export interface StudioPackage {
  id: string
  studio_id: string
  package_name: string
  description: string | null
  duration_hours: number
  price: number
  original_price: number | null
  included_equipment: string[] | null
  included_amenities: string[] | null
  included_extras: string[] | null
  max_people: number | null
  rules: string | null
  badge_text: string | null
  is_active: boolean
  display_order: number
}

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  'Most Popular': { background: '#84cc16', color: '#111827' },
  'Best Value':   { background: '#f0fdf4', color: '#166534', border: '1px solid #84cc16' },
  'Premium':      { background: '#111827', color: '#fbbf24' },
  'New':          { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
}

const MAX_VISIBLE = 6

export function PackageCard({ pkg, studioId }: { pkg: StudioPackage; studioId: string }) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)

  const allItems = [
    ...(pkg.included_equipment ?? []),
    ...(pkg.included_amenities ?? []),
    ...(pkg.included_extras ?? []),
  ]
  const visibleItems = showAll ? allItems : allItems.slice(0, MAX_VISIBLE)
  const hiddenCount  = allItems.length - MAX_VISIBLE

  const savings = pkg.original_price ? pkg.original_price - pkg.price : 0

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      fontFamily: 'system-ui,sans-serif',
    }}>
      {/* Top row: badge + pricing */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {pkg.badge_text && (
            <span style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              marginBottom: '6px',
              ...(BADGE_STYLES[pkg.badge_text] ?? { background: '#f3f4f6', color: '#374151' }),
            }}>
              {pkg.badge_text}
            </span>
          )}
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', lineHeight: '1.3' }}>
            {pkg.package_name}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {pkg.original_price && (
            <div style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'line-through' }}>
              {formatINR(pkg.original_price)}
            </div>
          )}
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
            {formatINR(pkg.price)}
          </div>
          {savings > 0 && (
            <span style={{ display: 'inline-block', background: '#f0fdf4', color: '#166534', fontSize: '11px', fontWeight: '600', padding: '1px 8px', borderRadius: '20px', marginTop: '2px' }}>
              Save {formatINR(savings)}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {pkg.description && (
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
          {pkg.description}
        </p>
      )}

      {/* Duration + people */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#374151' }}>
        <span>⏱ {pkg.duration_hours} {pkg.duration_hours === 1 ? 'hour' : 'hours'}</span>
        {pkg.max_people && <span>👥 Up to {pkg.max_people} people</span>}
      </div>

      {/* Included items */}
      {allItems.length > 0 && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {visibleItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#374151' }}>
                <span style={{ color: '#84cc16', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          {!showAll && hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              style={{ marginTop: '6px', fontSize: '12px', color: '#84cc16', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              + {hiddenCount} more
            </button>
          )}
        </div>
      )}

      {/* Rules */}
      {pkg.rules && (
        <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5' }}>
          📋 {pkg.rules}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => router.push(`/studios/${studioId}/book?package=${pkg.id}`)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          border: 'none',
          background: '#84cc16',
          color: '#111827',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginTop: 'auto',
          transition: 'background .15s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#65a30d')}
        onMouseOut={e => (e.currentTarget.style.background = '#84cc16')}
      >
        Book this package →
      </button>
    </div>
  )
}
