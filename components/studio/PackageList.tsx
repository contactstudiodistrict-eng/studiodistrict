import { PackageCard, StudioPackage } from './PackageCard'
import { formatINR } from '@/lib/pricing'

interface Props {
  packages: StudioPackage[]
  studioId: string
  pricePerHour: number
}

export function PackageList({ packages, studioId, pricePerHour }: Props) {
  if (packages.length === 0) return null

  const colCount = packages.length >= 3 ? 3 : packages.length

  return (
    <section>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <h2 className="text-lg font-bold text-ink-900 tracking-tight">Packages</h2>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: '#f0fdf4', color: '#166534', border: '1px solid #dcfce7',
          borderRadius: '20px', fontSize: '12px', fontWeight: '600', padding: '1px 10px',
        }}>
          {packages.length}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Choose a package for the best value, or book hourly below.
      </p>

      {/* Cards grid: scroll on mobile, 2–3 col on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${colCount}, minmax(260px, 1fr))`,
        gap: '14px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }} className="pkg-grid sm:overflow-visible">
        {/* Mobile override via a class that makes this a scrolling row */}
        <style>{`
          @media (max-width: 639px) {
            .pkg-grid { display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; gap: 12px !important; padding-bottom: 8px !important; }
            .pkg-grid > * { min-width: 280px !important; flex-shrink: 0; }
          }
        `}</style>
        {packages.map(pkg => (
          <PackageCard key={pkg.id} pkg={pkg} studioId={studioId} />
        ))}
      </div>

      {/* "or book by the hour" divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 8px' }}>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        <span style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap', fontWeight: '500' }}>
          or book by the hour
        </span>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
        <span style={{ fontSize: '14px', color: '#374151' }}>
          <strong>{formatINR(pricePerHour)}</strong>
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>/hr</span>
        </span>
        <a
          href={`/studios/${studioId}/book`}
          style={{
            padding: '10px 18px', borderRadius: '10px', border: '1px solid #e5e7eb',
            fontSize: '13px', fontWeight: '600', color: '#374151', textDecoration: 'none',
            background: '#fff', transition: 'background .15s',
          }}
        >
          Book hourly →
        </a>
      </div>
    </section>
  )
}
