// components/studio/StudioCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { FavouriteButton } from './FavouriteButton'

const TYPE_EMOJI: Record<string, string> = {
  photography: '📸', videography: '🎬', audio: '🎙', music: '🎵', mixed: '🎭',
}

const TYPE_LABEL: Record<string, string> = {
  photography: 'Photo Studio', videography: 'Video Studio',
  audio: 'Podcast Studio', music: 'Music Studio', mixed: 'Multi-use Studio',
}

interface Props {
  studio: any
  isFavourited?: boolean
  bookedCount?: number
}

export function StudioCard({ studio, isFavourited = false, bookedCount = 0 }: Props) {
  const thumbnail = studio.thumbnail_url
    || studio.studio_images?.find((i: any) => i.is_thumbnail)?.url
    || studio.studio_images?.[0]?.url

  const amenities = studio.studio_amenities
  const amenityBadges = []
  if (amenities?.ac)            amenityBadges.push('AC')
  if (amenities?.power_backup)  amenityBadges.push('UPS')
  if (amenities?.parking)       amenityBadges.push('Parking')
  if (amenities?.wifi)          amenityBadges.push('WiFi')
  if (amenities?.natural_light) amenityBadges.push('Natural Light')
  if (amenities?.makeup_room)   amenityBadges.push('MUA Room')

  return (
    <Link href={`/studios/${studio.id}`} className="group block">
      <div className="rounded-2xl border border-ink-200 overflow-hidden hover:shadow-lg hover:border-brand-300 transition-all duration-200 bg-white">
        {/* Thumbnail */}
        <div className="relative bg-ink-100 overflow-hidden" style={{ height: '192px' }}>
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={studio.studio_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div style={{ height: '192px' }} className="flex items-center justify-center bg-gradient-to-br from-ink-100 to-brand-100">
              <span className="text-5xl">{TYPE_EMOJI[studio.studio_type] || '📸'}</span>
            </div>
          )}

          {/* Featured badge */}
          {studio.is_featured && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-bold">Featured</span>
            </div>
          )}

          {/* Booked badge */}
          {bookedCount > 0 && (
            <div className="absolute bottom-2 left-2">
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                Booked {bookedCount}×
              </span>
            </div>
          )}

          {/* Type badge (only if no booked badge) */}
          {bookedCount === 0 && (
            <div className="absolute bottom-2 left-2">
              <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                {TYPE_EMOJI[studio.studio_type]} {TYPE_LABEL[studio.studio_type]}
              </span>
            </div>
          )}

          {/* Favourite button */}
          <div className="absolute top-2 right-2">
            <FavouriteButton studioId={studio.id} initialFavourited={isFavourited} />
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-semibold text-ink-900 truncate mb-1">{studio.studio_name}</h3>

          <div className="flex items-center gap-2 text-xs text-ink-500 mb-3">
            <span>📍 {studio.area}</span>
            {studio.review_count > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-ink-300" />
                <span>⭐ {Number(studio.rating).toFixed(1)} ({studio.review_count})</span>
              </>
            )}
          </div>

          {/* Amenity tags */}
          {amenityBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {amenityBadges.slice(0, 3).map(badge => (
                <span key={badge} className="px-1.5 py-0.5 rounded bg-ink-50 text-ink-500 text-xs border border-ink-200">
                  {badge}
                </span>
              ))}
              {amenityBadges.length > 3 && (
                <span className="px-1.5 py-0.5 rounded bg-ink-50 text-ink-400 text-xs border border-ink-200">
                  +{amenityBadges.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-bold text-brand-600">
                ₹{studio.price_per_hour.toLocaleString('en-IN')}
              </span>
              <span className="text-ink-400 text-xs"> / hr</span>
            </div>
            <span className="text-xs text-ink-400">min {studio.minimum_hours} hrs</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
