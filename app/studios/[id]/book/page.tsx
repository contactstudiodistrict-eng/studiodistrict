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
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <a href={`/studios/${params.id}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
            ← Back to studio
          </a>
          <h1 className="text-2xl font-serif text-gray-900">Book a Slot</h1>
          <p className="text-gray-500 text-sm mt-1">{studio.studio_name} · {studio.area}</p>
        </div>
        <BookingForm studio={studio} userId={user.id} />
      </main>
    </>
  )
}
