import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { PackagesClient } from './PackagesClient'

export const metadata = { title: 'Browse Packages — Studio District' }

export default async function PackagesPage() {
  const supabase = createClient()

  const [studiosResult, packagesResult] = await Promise.all([
    supabase
      .from('studios')
      .select('id, studio_name, studio_type, area, thumbnail_url, price_per_hour')
      .eq('status', 'live'),

    supabase
      .from('studio_packages')
      .select('id, package_name, description, duration_hours, price, original_price, included_equipment, included_amenities, included_extras, max_people, rules, badge_text, is_active, display_order, studio_id')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  ])

  const studios = (studiosResult.data ?? []) as any[]
  const pkgRows = (packagesResult.data ?? []) as any[]

  const studioMap = new Map(studios.map(s => [s.id, s]))

  const packages = pkgRows
    .map(p => {
      const studio = studioMap.get(p.studio_id)
      if (!studio) return null
      return { ...p, studio }
    })
    .filter(Boolean) as any[]

  return (
    <>
      <SiteHeader />
      <PackagesClient packages={packages} />
      <SiteFooter />
    </>
  )
}
