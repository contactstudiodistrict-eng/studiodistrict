// app/studios/[id]/page.tsx  — Server Component
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { ImageGallery } from '@/components/studio/ImageGallery'
import { AmenitiesGrid } from '@/components/studio/AmenitiesGrid'
import { EquipmentList } from '@/components/studio/EquipmentList'
import { BookingSidebar } from '@/components/booking/BookingSidebar'
import { formatINR } from '@/lib/pricing'
import type { StudioWithDetails } from '@/types/database.types'

interface Props { params: { id: string } }

// Generate SEO metadata from studio data
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: studio } = await supabase
    .from('studios')
    .select('studio_name, short_description, area, thumbnail_url')
    .eq('id', params.id)
    .single()

  if (!studio) return { title: 'Studio Not Found' }

  return {
    title: `${studio.studio_name} — ${studio.area}`,
    description: studio.short_description ?? `Book ${studio.studio_name} in Chennai`,
    openGraph: {
      images: studio.thumbnail_url ? [studio.thumbnail_url] : [],
    },
  }
}

export default async function StudioProfilePage({ params }: Props) {
  const supabase = createClient()

  const { data: studio, error } = await supabase
    .from('studios')
    .select(`
      *,
      studio_images(id, url, image_type, is_thumbnail, display_order),
      studio_amenities(*),
      studio_equipment(*)
    `)
    .eq('id', params.id)
    .eq('status', 'live')
    .single()

  if (error || !studio) notFound()

  const s = studio as StudioWithDetails
  const images = s.studio_images.sort((a, b) => a.display_order - b.display_order)
  const studioImages = images.filter(i => i.image_type === 'studio')
  const allImages = images.map(i => i.url)

  const CANCELLATION_LABELS: Record<string, string> = {
    free_24h: 'Free cancellation up to 24 hours before',
    free_48h: 'Free cancellation up to 48 hours before',
    partial_24h: '50% refund if cancelled within 24 hours',
    no_refund: 'No cancellation / No refund',
  }

  return (
    <>
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* ── Left: Studio Info (2/3 width) ── */}
          <div className="lg:col-span-2">

            {/* Image gallery */}
            <ImageGallery images={allImages} studioName={s.studio_name} />

            {/* Title + meta */}
            <div className="mt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">{s.studio_name}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      {s.area}, Chennai
                    </span>
                    {s.google_maps_link && (
                      <a href={s.google_maps_link} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs">
                        Open in Maps ↗
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">
                  ⭐ {s.rating.toFixed(1)}
                  <span className="font-normal text-amber-600 ml-1">({s.review_count})</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{formatINR(s.price_per_hour)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">per hour</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-lg font-bold text-gray-900">{s.minimum_hours} hrs</div>
                  <div className="text-xs text-gray-500 mt-0.5">minimum</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{s.max_people}</div>
                  <div className="text-xs text-gray-500 mt-0.5">max people</div>
                </div>
              </div>

              {/* Tags */}
              {s.ideal_for && s.ideal_for.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {s.ideal_for.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium border border-brand-100">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr className="my-6 border-gray-100" />

            {/* Description */}
            <section>
              <h2 className="text-lg font-bold text-ink-900 tracking-tight mb-3">About this studio</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {s.full_description || s.short_description || 'No description provided.'}
              </p>
              {s.unique_points && (
                <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
                  <div className="text-sm font-semibold text-brand-700 mb-1">What makes it special</div>
                  <p className="text-sm text-brand-800">{s.unique_points}</p>
                </div>
              )}
            </section>

            <hr className="my-6 border-gray-100" />

            {/* Amenities */}
            {s.studio_amenities && (
              <section>
                <h2 className="text-lg font-bold text-ink-900 tracking-tight mb-4">Amenities</h2>
                <AmenitiesGrid amenities={s.studio_amenities} />
              </section>
            )}

            <hr className="my-6 border-gray-100" />

            {/* Equipment */}
            {s.studio_equipment && (
              <section>
                <h2 className="text-lg font-bold text-ink-900 tracking-tight mb-4">Equipment</h2>
                <EquipmentList equipment={s.studio_equipment} />
              </section>
            )}

            <hr className="my-6 border-gray-100" />

            {/* Pricing */}
            <section>
              <h2 className="text-lg font-bold text-ink-900 tracking-tight mb-4">Pricing</h2>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5 bg-white">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-brand-600">{formatINR(s.price_per_hour)}</span>
                    <span className="text-gray-500 text-sm">/ hour</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {s.half_day_rate && (
                      <div className="p-3 rounded-lg bg-gray-50">
                        <div className="font-semibold">{formatINR(s.half_day_rate)}</div>
                        <div className="text-gray-500 text-xs mt-0.5">Half day (4 hrs)</div>
                      </div>
                    )}
                    {s.full_day_rate && (
                      <div className="p-3 rounded-lg bg-gray-50">
                        <div className="font-semibold">{formatINR(s.full_day_rate)}</div>
                        <div className="text-gray-500 text-xs mt-0.5">Full day (8 hrs)</div>
                      </div>
                    )}
                  </div>
                </div>
                {s.extra_charges_json && Object.keys(s.extra_charges_json as object).length > 0 && (
                  <div className="px-5 pb-5">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Extra charges</div>
                    {Object.entries(s.extra_charges_json as Record<string, number>).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
                        <span className="text-gray-600 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{formatINR(v)}/hr</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <hr className="my-6 border-gray-100" />

            {/* Rules */}
            <section>
              <h2 className="text-lg font-bold text-ink-900 tracking-tight mb-4">Studio Rules</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <RuleItem icon="👥" text={`Max ${s.max_people} people per session`} />
                {s.no_smoking && <RuleItem icon="🚭" text="No smoking inside the studio" />}
                {s.no_shoes && <RuleItem icon="👟" text="No outdoor shoes (shoe covers provided)" />}
                <RuleItem icon={s.food_allowed ? '✅' : '❌'} text={s.food_allowed ? 'Light snacks allowed' : 'No food in the studio area'} />
                <RuleItem icon={s.pets_allowed ? '✅' : '❌'} text={s.pets_allowed ? 'Pets allowed' : 'No pets allowed'} />
                {s.overtime_charges && (
                  <RuleItem icon="⏰" text={`Overtime: ${formatINR(s.overtime_charges)}/hr`} />
                )}
                <RuleItem icon="📋" text={CANCELLATION_LABELS[s.cancellation_policy]} />
              </div>
            </section>

            <hr className="my-6 border-gray-100" />

            {/* Working hours */}
            <section>
              <h2 className="text-lg font-bold text-ink-900 tracking-tight mb-3">Availability</h2>
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">Working days: </span>
                  {s.working_days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Hours: </span>
                  {formatTime(s.opening_time)} – {formatTime(s.closing_time)}
                </p>
              </div>
            </section>
          </div>

          {/* ── Right: Booking sidebar (1/3 width) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <BookingSidebar studio={s} />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />

      {/* Mobile sticky booking CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-bottom"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="font-bold text-ink-900 text-base">
              {formatINR(s.price_per_hour)}<span className="font-normal text-slate-400 text-sm"> / hr</span>
            </div>
            <div className="text-xs text-slate-400">min {s.minimum_hours} hrs · {s.area}</div>
          </div>
          <a href={`/studios/${s.id}/book`}
            className="flex-shrink-0 px-5 py-3 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 active:bg-brand-700 transition-colors"
            style={{ textDecoration: 'none' }}>
            Book Now →
          </a>
        </div>
      </div>
    </>
  )
}

function RuleItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5">{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}
