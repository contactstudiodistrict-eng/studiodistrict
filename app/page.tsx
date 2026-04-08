// app/page.tsx  — Server Component (no 'use client')
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { StudioGrid } from '@/components/studio/StudioGrid'
import { SearchFilters } from '@/components/studio/SearchFilters'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { HeroBanner } from '@/components/shared/HeroBanner'
import type { Studio } from '@/types/database.types'

interface SearchParams {
  type?: string
  area?: string
  min_price?: string
  max_price?: string
  amenities?: string
  q?: string
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  // Build query from search params
  let query = supabase
    .from('studios')
    .select(`
      id, studio_name, studio_type, area, address,
      price_per_hour, minimum_hours, rating, review_count,
      thumbnail_url, ideal_for, is_featured, short_description,
      studio_images(url, image_type, is_thumbnail, display_order)
    `)
    .eq('status', 'live')
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .limit(24)

  if (searchParams.type)      query = query.eq('studio_type', searchParams.type)
  if (searchParams.area)      query = query.ilike('area', `%${searchParams.area}%`)
  if (searchParams.min_price) query = query.gte('price_per_hour', Number(searchParams.min_price))
  if (searchParams.max_price) query = query.lte('price_per_hour', Number(searchParams.max_price))
  if (searchParams.q)         query = query.ilike('studio_name', `%${searchParams.q}%`)

  const { data: studios, error } = await query

  if (error) {
    console.error('Studio fetch error:', error)
  }

  const studioList = (studios ?? []) as any[]

  return (
    <>
      <SiteHeader />
      <main>
        <HeroBanner />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Search + filters */}
          <Suspense fallback={<div className="h-14 bg-gray-100 rounded-xl animate-pulse mb-8" />}>
            <SearchFilters initialParams={searchParams} />
          </Suspense>

          {/* Results header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif text-gray-900">
                {searchParams.type
                  ? `${capitalize(searchParams.type)} Studios`
                  : 'Studios in Chennai'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {studioList.length} {studioList.length === 1 ? 'studio' : 'studios'} available
              </p>
            </div>
            <a
              href="/studio/onboard"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-400 text-brand-400 text-sm font-medium hover:bg-brand-50 transition-colors"
            >
              + List Your Studio
            </a>
          </div>

          {/* Studio grid */}
          <Suspense fallback={<StudioGridSkeleton />}>
            {studioList.length > 0 ? (
              <StudioGrid studios={studioList} />
            ) : (
              <EmptyState searchParams={searchParams} />
            )}
          </Suspense>
        </section>
      </main>

      {/* Mobile: List your studio CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-40">
        <a
          href="/studio/onboard"
          className="block w-full py-3 text-center rounded-xl bg-brand-400 text-white font-semibold text-sm"
        >
          Own a Studio? List it Free →
        </a>
      </div>
    </>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function StudioGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-5 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No studios found</h3>
      <p className="text-gray-500 mb-6">
        {searchParams.q || searchParams.type || searchParams.area
          ? 'Try adjusting your filters or search term'
          : 'No studios are live yet. Be the first to list!'}
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-400 text-white text-sm font-medium hover:bg-brand-500 transition-colors"
      >
        Clear filters
      </a>
    </div>
  )
}
