// app/page.tsx  — Server Component (no 'use client')
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { StudioGrid } from '@/components/studio/StudioGrid'
import { SearchFilters } from '@/components/studio/SearchFilters'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { HeroBanner } from '@/components/shared/HeroBanner'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { RecentlyBookedCard } from '@/components/booking/RecentlyBookedCard'
import { StudioCard } from '@/components/studio/StudioCard'
import { AnnouncementBanner } from '@/components/banners/AnnouncementBanner'
import { OfferBanner } from '@/components/banners/OfferBanner'
import type { Studio, Banner } from '@/types/database.types'

const DAY_MAP = ['sun','mon','tue','wed','thu','fri','sat']

interface SearchParams {
  type?: string
  area?: string
  min_price?: string
  max_price?: string
  amenities?: string
  q?: string
  date?: string
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  // Auth check (non-blocking — null if not logged in)
  const { data: { user } } = await supabase.auth.getUser()

  // Build main studios query
  let query = supabase
    .from('studios')
    .select(`
      id, studio_name, studio_type, area, address,
      price_per_hour, minimum_hours, rating, review_count,
      thumbnail_url, ideal_for, is_featured, short_description,
      studio_images(url, image_type, is_thumbnail, display_order),
      studio_amenities(ac, power_backup, parking, wifi, natural_light, makeup_room)
    `)
    .eq('status', 'live')
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .limit(24)

  if (searchParams.type)      query = query.eq('studio_type', searchParams.type)
  if (searchParams.area)      query = query.ilike('area', `%${searchParams.area}%`)
  if (searchParams.min_price) query = query.gte('price_per_hour', Number(searchParams.min_price))
  if (searchParams.max_price) query = query.lte('price_per_hour', Number(searchParams.max_price))
  if (searchParams.q)         query = query.or(`studio_name.ilike.%${searchParams.q}%,area.ilike.%${searchParams.q}%`)

  // Filter by working day when a date is selected
  if (searchParams.date) {
    const [y, m, d] = searchParams.date.split('-').map(Number)
    const dayAbbr = DAY_MAP[new Date(y, m - 1, d).getDay()]
    query = (query as any).contains('working_days', [dayAbbr])
  }

  const audience = user ? 'logged_in' : 'logged_out'
  const now = new Date().toISOString()

  // Fetch studios + banners + hero thumbnails + (if logged in) favourites + recent bookings
  const [studioResult, bannersResult, thumbnailsResult, favouritesResult, recentResult] = await Promise.all([
    query,
    supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .or(`show_to.eq.all,show_to.eq.${audience}`)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('studios')
      .select('thumbnail_url')
      .eq('status', 'live')
      .not('thumbnail_url', 'is', null)
      .limit(4),
    user
      ? supabase
          .from('studio_favourites')
          .select('studio_id, studios(id, studio_name, studio_type, area, price_per_hour, minimum_hours, thumbnail_url, rating, review_count, is_featured, studio_images(url, image_type, is_thumbnail, display_order), studio_amenities(ac, power_backup, parking, wifi, natural_light, makeup_room))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8)
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from('bookings')
          .select('id, studio_id, shoot_type, duration_hours, start_time, customer_name, customer_phone, studios(studio_name, area, price_per_hour, thumbnail_url)')
          .eq('user_id', user.id)
          .in('status', ['paid', 'completed'])
          .order('created_at', { ascending: false })
          .limit(10)
      : Promise.resolve({ data: null }),
  ])

  if (studioResult.error) console.error('Studio fetch error:', studioResult.error)

  const studioList      = (studioResult.data    ?? []) as any[]
  const allBanners      = (bannersResult.data    ?? []) as Banner[]
  const heroThumbnails  = (thumbnailsResult.data ?? []).map((s: any) => s.thumbnail_url as string)

  const announcementBanner = allBanners.find(b => b.type === 'announcement') ?? null
  const offerBanner        = allBanners.find(b => b.type === 'offer')        ?? null
  const featureBanner      = allBanners.find(b => b.type === 'feature')      ?? null

  // Deduplicate recent bookings by studio_id (keep latest per studio, max 3)
  const recentRaw = (recentResult.data ?? []) as any[]
  const seenStudio = new Set<string>()
  const recentBookings = recentRaw.filter(b => {
    if (seenStudio.has(b.studio_id)) return false
    seenStudio.add(b.studio_id)
    return true
  }).slice(0, 3)

  // Favourited studios
  const favRows        = (favouritesResult.data ?? []) as any[]
  const favouriteIds   = favRows.map(r => r.studio_id)
  const favouriteStudios = favRows.map(r => r.studios).filter(Boolean)

  // Results heading
  const selectedDate = searchParams.date
    ? new Date(...(searchParams.date.split('-').map(Number) as [number,number,number]))
        .toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
    : null

  return (
    <>
      <SiteHeader />
      {announcementBanner && <AnnouncementBanner banner={announcementBanner} />}
      <main>
        <HeroBanner thumbnails={heroThumbnails} />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 sm:pb-10">

          {/* ── Saved studios section ── */}
          {user && favouriteStudios.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-ink-900">Your saved studios</h2>
                <span className="text-sm text-ink-400">{favouriteStudios.length} saved</span>
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

          {/* ── Book again section ── */}
          {user && recentBookings.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-ink-900 mb-4">Book again</h2>
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

          {/* ── Offer banner ── */}
          {offerBanner && <OfferBanner banner={offerBanner} />}

          {/* Search + filters */}
          <Suspense fallback={<div className="h-14 bg-gray-100 rounded-xl animate-pulse mb-8" />}>
            <SearchFilters initialParams={searchParams} />
          </Suspense>

          {/* Results header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-ink-900">
                {searchParams.type ? `${searchParams.type} Studios` : 'Studios in Chennai'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {studioList.length} {studioList.length === 1 ? 'studio' : 'studios'} available
                {selectedDate && <span className="ml-1">open on {selectedDate}</span>}
              </p>
            </div>
            <a href="/studio/list" target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500 text-brand-600 text-sm font-medium hover:bg-brand-50 transition-colors">
              + List Your Studio
            </a>
          </div>

          {/* Studio grid */}
          <Suspense fallback={<StudioGridSkeleton />}>
            {studioList.length > 0 ? (
              <StudioGrid
                studios={studioList}
                favouriteIds={favouriteIds}
                featureBanner={featureBanner}
                insertAtIndex={2}
              />
            ) : (
              <EmptyState searchParams={searchParams} />
            )}
          </Suspense>
        </section>
      </main>

      <SiteFooter />

      {/* Mobile: List your studio CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-4 pt-3"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <a href="/studio/list" target="_blank" rel="noopener noreferrer"
          className="block w-full py-3.5 text-center rounded-xl bg-brand-500 text-white font-bold text-sm active:bg-brand-700 transition-colors"
          style={{ textDecoration: 'none' }}>
          Own a Studio? List it Free →
        </a>
      </div>
    </>
  )
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
        {searchParams.q || searchParams.type || searchParams.area || searchParams.date
          ? 'Try adjusting your filters or search term'
          : 'No studios are live yet. Be the first to list!'}
      </p>
      <a href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
        Browse Studios
      </a>
    </div>
  )
}
