'use client'
import { useState, useMemo } from 'react'
import { formatINR } from '@/lib/pricing'

const TYPE_OPTIONS = [
  { value: '',             label: 'All types',    icon: '✦' },
  { value: 'photography',  label: 'Photography',  icon: '📸' },
  { value: 'videography',  label: 'Video',        icon: '🎬' },
  { value: 'audio',        label: 'Podcast',      icon: '🎙' },
  { value: 'music',        label: 'Music',        icon: '🎵' },
  { value: 'mixed',        label: 'Multi-use',    icon: '🎭' },
]

const SORT_OPTIONS = [
  { value: 'default',      label: 'Recommended' },
  { value: 'price_asc',    label: 'Price: low to high' },
  { value: 'price_desc',   label: 'Price: high to low' },
  { value: 'duration_asc', label: 'Duration: short first' },
]

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  'Most Popular': { background: '#84cc16', color: '#111827' },
  'Best Value':   { background: '#f0fdf4', color: '#166534', border: '1px solid #84cc16' },
  'Premium':      { background: '#111827', color: '#fbbf24' },
  'New':          { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
}

const TYPE_LABEL: Record<string, string> = {
  photography: '📸 Photography',
  videography: '🎬 Video',
  audio:       '🎙 Podcast',
  music:       '🎵 Music',
  mixed:       '🎭 Multi-use',
}

const MAX_ITEMS = 6

function PackagePageCard({ pkg }: { pkg: any }) {
  const [showAll, setShowAll] = useState(false)
  const studio = pkg.studio

  const allItems = [
    ...(pkg.included_equipment ?? []),
    ...(pkg.included_amenities ?? []),
    ...(pkg.included_extras ?? []),
  ]
  const visibleItems = showAll ? allItems : allItems.slice(0, MAX_ITEMS)
  const hiddenCount = allItems.length - MAX_ITEMS
  const savings = pkg.original_price ? pkg.original_price - pkg.price : 0

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui,sans-serif',
      transition: 'box-shadow .15s',
    }}
    onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)')}
    onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Studio strip */}
      <a
        href={`/studios/${studio.id}`}
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}
      >
        {studio.thumbnail_url ? (
          <img
            src={studio.thumbnail_url}
            alt={studio.studio_name}
            style={{ width: 32, height: 32, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            🏢
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {studio.studio_name}
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
            {TYPE_LABEL[studio.studio_type] ?? studio.studio_type} · {studio.area}
          </div>
        </div>
      </a>

      {/* Package body */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>

        {/* Badge + name + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {pkg.badge_text && (
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
                fontSize: '11px', fontWeight: '700', marginBottom: '5px',
                ...(BADGE_STYLES[pkg.badge_text] ?? { background: '#f3f4f6', color: '#374151' }),
              }}>
                {pkg.badge_text}
              </span>
            )}
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', lineHeight: '1.3' }}>
              {pkg.package_name}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {pkg.original_price && (
              <div style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>
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
        <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: '#374151' }}>
          <span>⏱ {pkg.duration_hours} {pkg.duration_hours === 1 ? 'hr' : 'hrs'}</span>
          {pkg.max_people && <span>👥 Up to {pkg.max_people}</span>}
        </div>

        {/* Included items */}
        {allItems.length > 0 && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {visibleItems.map((item: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#374151' }}>
                  <span style={{ color: '#84cc16', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {!showAll && hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(true)}
                style={{ marginTop: '5px', fontSize: '12px', color: '#84cc16', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
              >
                + {hiddenCount} more
              </button>
            )}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* CTA */}
        <a
          href={`/studios/${studio.id}/book?package=${pkg.id}`}
          style={{
            display: 'block', textAlign: 'center', padding: '11px',
            borderRadius: '10px', background: '#84cc16', color: '#111827',
            fontWeight: '600', fontSize: '14px', textDecoration: 'none',
            transition: 'background .15s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#65a30d')}
          onMouseOut={e => (e.currentTarget.style.background = '#84cc16')}
        >
          Book this package →
        </a>
      </div>
    </div>
  )
}

export function PackagesClient({ packages }: { packages: any[] }) {
  const [selectedType, setSelectedType] = useState('')
  const [sortBy, setSortBy] = useState('default')

  const filtered = useMemo(() => {
    let list = selectedType
      ? packages.filter(p => p.studio?.studio_type === selectedType)
      : packages

    if (sortBy === 'price_asc')    list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc')   list = [...list].sort((a, b) => b.price - a.price)
    if (sortBy === 'duration_asc') list = [...list].sort((a, b) => a.duration_hours - b.duration_hours)

    return list
  }, [packages, selectedType, sortBy])

  return (
    <main style={{ minHeight: '80vh', background: '#fafaf9' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Browse Packages
            </h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', background: '#f0fdf4',
              color: '#166534', border: '1px solid #dcfce7', borderRadius: '20px',
              fontSize: '12px', fontWeight: '600', padding: '2px 10px',
            }}>
              {packages.length} packages
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Curated bundles from Chennai's top studios — flat pricing, no surprises.
          </p>

          {/* Type filter chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '1px', scrollbarWidth: 'none' }}>
            {TYPE_OPTIONS.map(t => {
              const active = selectedType === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '7px 14px', borderRadius: '99px', border: '1px solid',
                    borderColor: active ? '#84cc16' : '#e5e7eb',
                    background: active ? '#84cc16' : '#fff',
                    color: active ? '#111827' : '#374151',
                    fontSize: '13px', fontWeight: active ? '700' : '500',
                    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    transition: 'all .12s',
                    marginBottom: '12px',
                  }}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results bar + sort */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {filtered.length === packages.length
              ? `${filtered.length} packages`
              : `${filtered.length} of ${packages.length} packages`}
          </span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e7eb',
              fontSize: '13px', color: '#374151', background: '#fff',
              cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
            }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            paddingBottom: '80px',
          }}>
            {filtered.map(pkg => (
              <PackagePageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              No packages found
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              No packages match this studio type yet.
            </p>
            <button
              onClick={() => setSelectedType('')}
              style={{ padding: '10px 24px', borderRadius: '10px', background: '#84cc16', color: '#111827', fontWeight: '600', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Show all packages
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
