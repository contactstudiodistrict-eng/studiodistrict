// components/studio/EquipmentList.tsx
import type { StudioEquipment } from '@/types/database.types'

const EQUIP_CONFIG: { key: keyof StudioEquipment; label: string }[] = [
  { key: 'softboxes',       label: 'Softboxes' },
  { key: 'led_panels',      label: 'LED Panels' },
  { key: 'ring_lights',     label: 'Ring Lights' },
  { key: 'tripods',         label: 'Tripods' },
  { key: 'light_stands',    label: 'Light Stands' },
  { key: 'backdrop_white',  label: 'White Backdrop' },
  { key: 'backdrop_black',  label: 'Black Backdrop' },
  { key: 'backdrop_colors', label: 'Coloured Backdrops' },
  { key: 'green_matte',     label: 'Green Matte' },
  { key: 'audio_gear',      label: 'Audio Gear' },
  { key: 'soundproofing',   label: 'Soundproofing' },
  { key: 'camera_rental',   label: 'Camera Rental' },
]

export function EquipmentList({ equipment }: { equipment: StudioEquipment }) {
  const available = EQUIP_CONFIG.filter(e => equipment[e.key] === true)

  if (available.length === 0) {
    return <p className="text-gray-500 text-sm">No equipment listed.</p>
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {available.map(eq => (
          <span key={eq.key} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-700 font-medium">
            {eq.label}
          </span>
        ))}
      </div>
      {equipment.camera_rental && equipment.camera_details && (
        <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
          📷 Camera rental: {equipment.camera_details}
        </div>
      )}
      {equipment.mic_types && equipment.mic_types.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          🎤 Mic types: {equipment.mic_types.join(', ')}
        </div>
      )}
    </div>
  )
}
