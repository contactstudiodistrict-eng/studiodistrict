// app/api/favourites/route.ts — GET list + POST add
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const admin = createAdminClient()

  // Return studio_ids + full studio data for homepage section
  const { data, error } = await admin
    .from('studio_favourites')
    .select(`
      studio_id,
      studios(
        id, studio_name, studio_type, area, price_per_hour, minimum_hours,
        thumbnail_url, rating, review_count, is_featured, short_description,
        studio_images(url, image_type, is_thumbnail, display_order),
        studio_amenities(ac, power_backup, parking, wifi, natural_light, makeup_room)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const studioIds = (data || []).map(r => r.studio_id)
  const studios   = (data || []).map(r => r.studios).filter(Boolean)

  return NextResponse.json({ studioIds, studios })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { studio_id } = await req.json()
  if (!studio_id) return NextResponse.json({ error: 'studio_id required' }, { status: 400 })

  const admin = createAdminClient()

  // Upsert — ignore conflict (already favourited)
  const { error } = await admin
    .from('studio_favourites')
    .upsert({ user_id: user.id, studio_id }, { onConflict: 'user_id,studio_id', ignoreDuplicates: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ favourited: true })
}
