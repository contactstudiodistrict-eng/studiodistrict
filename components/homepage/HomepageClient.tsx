'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { SiteHeader } from '@/components/shared/SiteHeader'
import { HeroBanner } from '@/components/shared/HeroBanner'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { AnnouncementBanner } from '@/components/banners/AnnouncementBanner'
import { OfferBanner } from '@/components/banners/OfferBanner'
import { StudioCard } from '@/components/studio/StudioCard'
import { StudioGrid } from '@/components/studio/StudioGrid'
import { RecentlyBookedCard } from '@/components/booking/RecentlyBookedCard'
import { FilterBar } from '@/components/filters/FilterBar'
import { ResultsHeader } from '@/components/filters/ResultsHeader'

import {
  FilterState,
  DEFAULT_FILTERS,
  parseFiltersFromParams,
  filtersToParams,
  applyFilters,
  applySort,
  countActiveFilters,
  STUDIO_TYPE_OPTIONS,
} from '@/components/filters/types'
import type { Banner } from '@/types/database.types'

interface Props {
  allStudios: any[]
  banners: Banner[]
  heroThumbnails: string[]
  favouriteIds: string[]
  favouriteStudios: any[]
  recentBookings: any[]
  isLoggedIn: boolean
  initialParams: Record<string, string | undefined>
}

export function HomepageClient({
  allStudios,
  banners,
  heroThumbnails,
  favouriteIds,
  favouriteStudios,
  recentBookings,
  isLoggedIn,
  initialParams,
}: Props) {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromParams(initialParams))
  const [fading, setFading] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  // Derived banners
  const announcementBanner = banners.find(b => b.type === 'announcement') ?? null
  const offerBanner        = banners.find(b => b.type === 'offer')        ?? null
  const featureBanner      = banners.find(b => b.type === 'feature')      ?? null

  // Filter + sort
  const filtered = applySort(applyFilters(allStudios, filters), filters.sortBy)
  const filtersActive = countActiveFilters(filters) > 0

  // Sync URL on filter change
  const syncUrl = useCallback((f: FilterState) => {
    const params = filtersToParams(f)
    router.replace(params.toString() ? `?${params.toString()}` : '/', { scroll: false } as any)
  }, [router])

  function handleFilterChange(newFilters: FilterState) {
    setFading(true)
    setTimeout(() => {
      setFilters(newFilters)
      syncUrl(newFilters)
      setFading(false)
    }, 100)
  }

  // Hero search → set type/area + scroll to filter bar
  function handleHeroSearch(type: string, area: string) {
    const next: FilterState = {
      ...filters,
      types: type ? [type] : [],
      areas: area ? [area.toLowerCase()] : [],
    }
    handleFilterChange(next)
    setTimeout(() => {
      document.getElementById('filter-bar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <>
      <SiteHeader />

      {announcementBanner && <AnnouncementBanner banner={announcementBanner} />}

      <HeroBanner thumbnails={heroThumbnails} onSearch={handleHeroSearch} />

      {offerBanner && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ paddingTop: 16 }}>
            <OfferBanner banner={offerBanner} />
          </div>
        </div>
      )}

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        studios={allStudios}
      />

      <main>
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 96px' }}>

          <ResultsHeader
            count={filtered.length}
            filtersActive={filtersActive}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Saved studios */}
          {isLoggedIn && favouriteStudios.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Your saved studios</h2>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{favouriteStudios.length} saved</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible"
                style={{ scrollbarWidth: 'none' }}>
                {favouriteStudios.map((studio: any) => (
                  <div key={studio.id} className="flex-shrink-0 w-72 sm:w-auto">
                    <StudioCard studio={studio} isFavourited={true} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Book again */}
          {isLoggedIn && recentBookings.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Book again</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible"
                style={{ scrollbarWidth: 'none' }}>
                {recentBookings.map((b: any) => (
                  <RecentlyBookedCard
                    key={b.id}
                    bookingId={b.id}
                    studioId={b.studio_id}
                    studioName={b.studios?.studio_name || ''}
                    area={b.studios?.area || ''}
                    pricePerHour={b.studios?.price_per_hour || 0}
                    shootType={b.shoot_type}
                    durationHours={b.duration_hours}
                    startTime={b.start_time}
                    thumbnail={b.studios?.thumbnail_url || ''}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Studio grid / empty state */}
          <div
            ref={gridRef}
            style={{ opacity: fading ? 0.4 : 1, transition: 'opacity 0.15s ease' }}
          >
            {filtered.length > 0 ? (
              <StudioGrid
                studios={filtered}
                favouriteIds={favouriteIds}
                featureBanner={featureBanner}
                insertAtIndex={2}
              />
            ) : (
              <EmptyState
                filtersActive={filtersActive}
                onClearFilters={() => handleFilterChange({ ...DEFAULT_FILTERS })}
                onTypeSelect={type => handleFilterChange({ ...DEFAULT_FILTERS, types: [type] })}
              />
            )}
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Mobile: List your studio CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-4 pt-3"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <a href="/studio/list" target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', width: '100%', padding: '14px', textAlign: 'center', borderRadius: 12, background: '#84cc16', color: '#111827', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Own a Studio? List it Free →
        </a>
      </div>
    </>
  )
}

function EmptyState({
  filtersActive,
  onClearFilters,
  onTypeSelect,
}: {
  filtersActive: boolean
  onClearFilters: () => void
  onTypeSelect: (type: string) => void
}) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
        {filtersActive ? 'No studios match your filters' : 'No studios found'}
      </h3>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
        {filtersActive
          ? 'Try removing some filters or searching a different area.'
          : 'No studios are live yet. Be the first to list!'}
      </p>
      {filtersActive && (
        <>
          <button
            onClick={onClearFilters}
            style={{ padding: '10px 24px', borderRadius: 10, background: '#84cc16', color: '#111827', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 32 }}
          >
            Clear all filters
          </button>
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>Or browse by type:</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {STUDIO_TYPE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => onTypeSelect(t.value)}
                  style={{ padding: '7px 16px', borderRadius: 99, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
