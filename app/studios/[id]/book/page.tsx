// app/studios/[id]/book/page.tsx — Server Component shell
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { BookingForm } from './BookingForm'

interface Props { params: { id: string } }

export default async function BookPage({ params }: Props) {
  const supabase = createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/studios/${params.id}/book`)

  // Studio data
  const { data: studio } = await supabase
    .from('studios')
    .select('id, studio_name, area, price_per_hour, minimum_hours, opening_time, closing_time, working_days, extra_charges_json, thumbnail_url')
    .eq('id', params.id)
    .eq('status', 'live')
    .single()

  if (!studio) notFound()

  return (
    <>
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-5 sm:py-8">
        <div className="mb-5 sm:mb-8">
          <a href={`/studios/${params.id}`} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-3"
            style={{ textDecoration: 'none' }}>
            ← Back to studio
          </a>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">Book a Slot</h1>
          <p className="text-slate-400 text-sm mt-0.5">{studio.studio_name} · {studio.area}</p>
        </div>
        <BookingForm studio={studio} userId={user.id} />
      </main>
    </>
  )
}
