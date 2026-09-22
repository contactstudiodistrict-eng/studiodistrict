import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = 'https://studiodistrict.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  const { data: studios } = await supabase
    .from('studios')
    .select('id, updated_at')
    .eq('status', 'live')

  const studioUrls: MetadataRoute.Sitemap = (studios ?? []).map(s => ({
    url:              `${BASE}/studios/${s.id}`,
    lastModified:     s.updated_at ? new Date(s.updated_at) : new Date(),
    changeFrequency:  'weekly',
    priority:         0.8,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                        changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/packages`,          changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/how-it-works`,      changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/studio/list`,       changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`,             changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/terms`,             changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,           changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/refund-policy`,     changeFrequency: 'yearly',  priority: 0.3 },
  ]

  return [...staticPages, ...studioUrls]
}
