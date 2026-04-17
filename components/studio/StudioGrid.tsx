// components/studio/StudioGrid.tsx
import { StudioCard } from './StudioCard'

interface Props {
  studios: any[]
  favouriteIds?: string[]
}

export function StudioGrid({ studios, favouriteIds = [] }: Props) {
  const favSet = new Set(favouriteIds)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {studios.map(studio => (
        <StudioCard
          key={studio.id}
          studio={studio}
          isFavourited={favSet.has(studio.id)}
        />
      ))}
    </div>
  )
}
