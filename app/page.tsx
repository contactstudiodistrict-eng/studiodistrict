// app/page.tsx — Server Component
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { HomepageClient } from '@/components/homepage/HomepageClient'
import type { Banner } from '@/types/database.types'

export const metadata: Metadata = {
  title: 'Studio District — Book Studio Spaces in Chennai',
  description: 'Discover and book photography, podcast, video, and music studios across Chennai. See real photos, check live availability, and book in under 2 minutes.',
  alternates: { canonical: 'https://studiodistrict.in' },
  openGraph: {
    title: 'Studio District — Book Studio Spaces in Chennai',
    description: 'Discover verified studios across Chennai. Real photos, instant availability, transparent pricing.',
    url: 'https://studiodistrict.in',
    type: 'website',
  },
}

interface SearchParams {
  type?: string
  area?: string
  pmin?: string
  pmax?: string
  amenity?: string
  sort?: string
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const audience = user ? 'logged_in' : 'logged_out'
  const now = new Date().toISOString()

  const [studioResult, bannersResult, thumbnailsResult, favouritesResult, packagesResult] = await Promise.all([
    // Fetch ALL live studios — client handles filtering
    supabase
      .from('studios')
      .select(`
        id, studio_name, studio_type, area, address,
        price_per_hour, minimum_hours, rating, review_count,
        thumbnail_url, ideal_for, is_featured, short_description, created_at,
        studio_images(url, image_type, is_thumbnail, display_order),
        studio_amenities(ac, power_backup, parking, wifi, natural_light, makeup_room, changing_room, props, elevator, waiting_area)
      `)
      .eq('status', 'live')
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false }),

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
          .select('studio_id, studios(id, studio_name, studio_type, area, price_per_hour, minimum_hours, thumbnail_url, rating, review_count, is_featured, created_at, studio_images(url, image_type, is_thumbnail, display_order), studio_amenities(ac, power_backup, parking, wifi, natural_light, makeup_room, changing_room, props, elevator, waiting_area))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8)
      : Promise.resolve({ data: null }),

    // Packages — full fields for hero cards + stats for studio cards
    supabase
      .from('studio_packages')
      .select('studio_id, price, id, package_name, original_price, duration_hours, badge_text, included_equipment, included_amenities, included_extras')
      .eq('is_active', true),
  ])

  if (studioResult.error) console.error('Studio fetch error:', studioResult.error)

  const allStudios    = (studioResult.data ?? []) as any[]

  // Build per-studio package stats + hero package cards
  const pkgRows = (packagesResult.data ?? []) as any[]
  const packageStatsByStudio: Record<string, { count: number; minPrice: number }> = {}
  for (const row of pkgRows) {
    const s = packageStatsByStudio[row.studio_id]
    if (!s) packageStatsByStudio[row.studio_id] = { count: 1, minPrice: row.price }
    else { s.count++; if (row.price < s.minPrice) s.minPrice = row.price }
  }
  // Attach stats to studios for client use
  for (const studio of allStudios) {
    const stats = packageStatsByStudio[studio.id]
    studio._packageCount    = stats?.count    ?? 0
    studio._minPackagePrice = stats?.minPrice ?? undefined
  }

  // Hero packages — join with live-studio data already fetched
  const liveStudioMap = new Map(allStudios.map((s: any) => [s.id, s]))
  const heroPackages = pkgRows
    .map((p: any) => {
      const studio = liveStudioMap.get(p.studio_id) as any
      if (!studio) return null
      return {
        id:                  p.id,
        package_name:        p.package_name,
        price:               p.price,
        original_price:      p.original_price ?? null,
        duration_hours:      p.duration_hours,
        badge_text:          p.badge_text ?? null,
        included_equipment:  p.included_equipment ?? [],
        included_amenities:  p.included_amenities ?? [],
        included_extras:     p.included_extras ?? [],
        studio_id:           p.studio_id,
        studio_name:         studio.studio_name,
        area:                studio.area,
        studio_type:         studio.studio_type,
        thumbnail_url:       studio.thumbnail_url ?? null,
      }
    })
    .filter(Boolean)
    .slice(0, 8) as any[]
  const allBanners    = (bannersResult.data   ?? []) as Banner[]
  const heroThumbnails = (thumbnailsResult.data ?? []).map((s: any) => s.thumbnail_url as string)

  const favRows        = (favouritesResult.data ?? []) as any[]
  const favouriteIds   = favRows.map(r => r.studio_id)
  const favouriteStudios = favRows.map(r => r.studios).filter(Boolean)

  return (
    <>
      {/* Preload the hero background image before JS loads */}
      {heroThumbnails[0] && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="preload" as="image" href={heroThumbnails[0]} fetchPriority="high" />
      )}

      {/*
        Server-rendered hero headline — visible immediately in HTML before JS hydrates.
        This is the LCP element. The interactive HeroBanner renders on top once React loads.
        Keep text + styles in sync with HeroBanner.tsx h1.
      */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '120px 48px 0',
        pointerEvents: 'none', zIndex: 0,
      }}>
        {heroThumbnails[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroThumbnails[0]} alt="" fetchPriority="high"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />
        )}
        <h1 style={{
          fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
          fontWeight: 700, fontSize: 'clamp(40px, 6vw, 68px)',
          letterSpacing: '-0.03em', lineHeight: 1.04,
          color: 'oklch(0.18 0.012 60)', margin: 0,
        }}>
          Your next<br />Photography<br />studio is here.
        </h1>
      </div>

      <HomepageClient
        allStudios={allStudios}
        banners={allBanners}
        heroThumbnails={heroThumbnails}
        heroPackages={heroPackages}
        favouriteIds={favouriteIds}
        favouriteStudios={favouriteStudios}
        isLoggedIn={!!user}
        initialParams={searchParams as Record<string, string | undefined>}
      />
    </>
  )
}
