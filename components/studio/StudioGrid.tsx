'use client'
// components/studio/StudioGrid.tsx
import { useState } from 'react'
import { StudioCard } from './StudioCard'
import { FeatureCard } from '@/components/banners/FeatureCard'
import type { Banner } from '@/types/database.types'

interface Props {
  studios: any[]
  favouriteIds?: string[]
  featureBanner?: Banner | null
  insertAtIndex?: number
}

export function StudioGrid({ studios, favouriteIds = [], featureBanner, insertAtIndex = 2 }: Props) {
  const [showFeatureCard, setShowFeatureCard] = useState(true)
  const favSet = new Set(favouriteIds)
  const cards: React.ReactNode[] = []

  studios.forEach((studio, i) => {
    if (featureBanner && showFeatureCard && i === insertAtIndex) {
      cards.push(
        <FeatureCard
          key="__feature_card__"
          banner={featureBanner}
          onDismiss={() => setShowFeatureCard(false)}
        />
      )
    }
    cards.push(
      <StudioCard
        key={studio.id}
        studio={studio}
        isFavourited={favSet.has(studio.id)}
      />
    )
  })

  if (featureBanner && showFeatureCard && insertAtIndex >= studios.length) {
    cards.push(
      <FeatureCard
        key="__feature_card__"
        banner={featureBanner}
        onDismiss={() => setShowFeatureCard(false)}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards}
    </div>
  )
}
