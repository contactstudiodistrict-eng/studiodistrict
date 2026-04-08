// components/studio/AmenitiesGrid.tsx
import type { StudioAmenities } from '@/types/database.types'

const AMENITY_CONFIG: { key: keyof StudioAmenities; icon: string; label: string }[] = [
  { key: 'ac',           icon: '❄️', label: '24/7 AC' },
  { key: 'power_backup', icon: '🔌', label: 'UPS / Power Backup' },
  { key: 'parking',      icon: '🚗', label: 'Free Parking' },
  { key: 'wifi',         icon: '📶', label: 'High-speed WiFi' },
  { key: 'makeup_room',  icon: '💄', label: 'Makeup Room' },
  { key: 'changing_room',icon: '👗', label: 'Changing Room' },
  { key: 'restroom',     icon: '🚿', label: 'Restroom' },
  { key: 'elevator',     icon: '🛗', label: 'Elevator Access' },
  { key: 'natural_light',icon: '🌿', label: 'Natural Light' },
  { key: 'waiting_area', icon: '🪑', label: 'Waiting Area' },
  { key: 'pantry',       icon: '☕', label: 'Pantry / Refreshments' },
  { key: 'props',        icon: '🎭', label: 'Props Available' },
]

export function AmenitiesGrid({ amenities }: { amenities: StudioAmenities }) {
  const available = AMENITY_CONFIG.filter(a => amenities[a.key])
  const unavailable = AMENITY_CONFIG.filter(a => !amenities[a.key])

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {available.map(amenity => (
          <div key={amenity.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
            <span className="text-lg flex-shrink-0">{amenity.icon}</span>
            <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
          </div>
        ))}
      </div>

      {unavailable.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-2">Not available</div>
          <div className="flex flex-wrap gap-2">
            {unavailable.map(amenity => (
              <span key={amenity.key} className="flex items-center gap-1 text-xs text-gray-400 line-through">
                {amenity.icon} {amenity.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
