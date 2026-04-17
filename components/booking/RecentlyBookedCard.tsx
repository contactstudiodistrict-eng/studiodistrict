'use client'
// components/booking/RecentlyBookedCard.tsx
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
  studioId: string
  studioName: string
  area: string
  pricePerHour: number
  shootType: string
  durationHours: number
  startTime: string
  thumbnail: string
}

export function RecentlyBookedCard({
  bookingId, studioId, studioName, area, pricePerHour,
  shootType, durationHours, startTime, thumbnail,
}: Props) {
  const router = useRouter()

  function formatTime(t: string) {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div style={{
      flexShrink: 0,
      width: '280px',
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '14px',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Thumbnail */}
        <div style={{
          width: 64, height: 64, borderRadius: '10px', flexShrink: 0,
          background: '#f3f4f6', overflow: 'hidden', position: 'relative',
        }}>
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt={studioName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>📸</div>
          )}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {studioName}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>📍 {area}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
            {shootType} · {durationHours}h · {formatTime(startTime)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          ₹{pricePerHour.toLocaleString('en-IN')}/hr
        </span>
        <button
          onClick={() => router.push(`/studios/${studioId}/book?rebook=${bookingId}`)}
          style={{
            padding: '8px 16px',
            background: '#84cc16',
            color: '#111827',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#65a30d')}
          onMouseOut={e => (e.currentTarget.style.background = '#84cc16')}
        >
          Book again →
        </button>
      </div>
    </div>
  )
}
