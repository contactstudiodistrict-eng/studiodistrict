'use client'
import { FavouriteButton } from './FavouriteButton'

interface Props {
  studioId: string
  studioName: string
  area: string
  pricePerHour: number
  thumbnail: string
  onFavouriteToggle: (studioId: string, isFav: boolean) => void
}

export function SavedStudioCard({ studioId, studioName, area, pricePerHour, thumbnail, onFavouriteToggle }: Props) {
  return (
    <div style={{
      flexShrink: 0, width: '280px', background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '10px', flexShrink: 0, background: '#f3f4f6', overflow: 'hidden' }}>
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt={studioName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>📸</div>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {studioName}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>📍 {area}</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>₹{pricePerHour.toLocaleString('en-IN')}/hr</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FavouriteButton studioId={studioId} initialFavourited={true} onToggle={onFavouriteToggle} size={32} />
        <a
          href={`/studios/${studioId}`}
          style={{ padding: '8px 16px', background: '#84cc16', color: '#111827', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
          onMouseOver={e => (e.currentTarget.style.background = '#65a30d')}
          onMouseOut={e => (e.currentTarget.style.background = '#84cc16')}
        >
          View Studio →
        </a>
      </div>
    </div>
  )
}
