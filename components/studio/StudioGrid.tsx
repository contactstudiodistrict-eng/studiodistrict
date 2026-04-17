// components/studio/StudioGrid.tsx
import { StudioCard } from './StudioCard'

interface Props {
  studios: any[]
  favouriteIds?: string[]
  insertCard?: React.ReactNode
  insertAtIndex?: number
}

export function StudioGrid({ studios, favouriteIds = [], insertCard, insertAtIndex = 2 }: Props) {
  const favSet = new Set(favouriteIds)
  const cards: React.ReactNode[] = []

  studios.forEach((studio, i) => {
    if (insertCard && i === insertAtIndex) {
      cards.push(<div key="__feature_card__">{insertCard}</div>)
    }
    cards.push(
      <StudioCard
        key={studio.id}
        studio={studio}
        isFavourited={favSet.has(studio.id)}
      />
    )
  })

  // Insert at end if index >= studios.length
  if (insertCard && insertAtIndex >= studios.length) {
    cards.push(<div key="__feature_card__">{insertCard}</div>)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards}
    </div>
  )
}
