// app/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server'
import { HomepageClient } from '@/components/homepage/HomepageClient'
import type { Banner } from '@/types/database.types'

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

  const [studioResult, bannersResult, thumbnailsResult, favouritesResult, recentResult] = await Promise.all([
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

  const allStudios    = (studioResult.data    ?? []) as any[]
  const allBanners    = (bannersResult.data   ?? []) as Banner[]
  const heroThumbnails = (thumbnailsResult.data ?? []).map((s: any) => s.thumbnail_url as string)

  // Deduplicate recent bookings by studio (max 3)
  const recentRaw = (recentResult.data ?? []) as any[]
  const seenStudio = new Set<string>()
  const recentBookings = recentRaw.filter(b => {
    if (seenStudio.has(b.studio_id)) return false
    seenStudio.add(b.studio_id)
    return true
  }).slice(0, 3)

  const favRows        = (favouritesResult.data ?? []) as any[]
  const favouriteIds   = favRows.map(r => r.studio_id)
  const favouriteStudios = favRows.map(r => r.studios).filter(Boolean)

  return (
    <HomepageClient
      allStudios={allStudios}
      banners={allBanners}
      heroThumbnails={heroThumbnails}
      favouriteIds={favouriteIds}
      favouriteStudios={favouriteStudios}
      recentBookings={recentBookings}
      isLoggedIn={!!user}
      initialParams={searchParams as Record<string, string | undefined>}
    />
  )
}
