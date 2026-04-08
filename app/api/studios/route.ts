// app/api/studios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { studioOnboardSchema } from '@/lib/validations'
import { sendAdminNewStudio } from '@/lib/whatsapp'

// GET /api/studios — search + filter
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(req.url)

  const type      = searchParams.get('type')
  const area      = searchParams.get('area')
  const minPrice  = searchParams.get('min_price')
  const maxPrice  = searchParams.get('max_price')
  const q         = searchParams.get('q')
  const page      = Number(searchParams.get('page') ?? 1)
  const limit     = Number(searchParams.get('limit') ?? 12)

  let query = supabase
    .from('studios')
    .select(`
      id, studio_name, studio_type, area, address, short_description,
      price_per_hour, minimum_hours, half_day_rate, full_day_rate,
      rating, review_count, thumbnail_url, ideal_for, is_featured,
      working_days, opening_time, closing_time,
      studio_images(url, image_type, is_thumbnail, display_order),
      studio_amenities(ac, parking, wifi, power_backup, natural_light, makeup_room)
    `, { count: 'exact' })
    .eq('status', 'live')
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (type)     query = query.eq('studio_type', type)
  if (area)     query = query.ilike('area', `%${area}%`)
  if (minPrice) query = query.gte('price_per_hour', Number(minPrice))
  if (maxPrice) query = query.lte('price_per_hour', Number(maxPrice))
  if (q)        query = query.ilike('studio_name', `%${q}%`)

  const { data, error, count } = await query

  if (error) {
    console.error('Studios fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    studios: data,
    pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
  })
}

// POST /api/studios — create new studio listing (studio owner onboarding)
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const adminClient = createAdminClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await req.json()
    // image_urls is passed alongside form data but not part of the zod schema
    const { image_urls: rawImageUrls, ...formBody } = body
    const parsed = studioOnboardSchema.safeParse(formBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Extract amenity + equipment fields separately
    const amenityFields = ['ac','parking','makeup_room','changing_room','restroom','wifi','power_backup','natural_light','elevator','props','waiting_area','pantry']
    const equipmentFields = ['softboxes','led_panels','ring_lights','tripods','light_stands','backdrop_white','backdrop_black','backdrop_colors','green_matte','audio_gear','soundproofing','camera_rental','camera_details']

    const studioData: Record<string, any> = {}
    const amenityData: Record<string, any> = {}
    const equipmentData: Record<string, any> = {}

    for (const [k, v] of Object.entries(data)) {
      if (amenityFields.includes(k))   amenityData[k] = v
      else if (equipmentFields.includes(k)) equipmentData[k] = v
      else studioData[k] = v
    }

    // Update user role to studio_owner
    await adminClient.from('users').update({ role: 'studio_owner' }).eq('id', user.id)

    // Insert studio (status = pending for admin review)
    const { data: studio, error: studioErr } = await adminClient
      .from('studios')
      .insert({ ...studioData, owner_id: user.id, status: 'pending' })
      .select('id, studio_name, area, studio_type')
      .single()

    if (studioErr || !studio) {
      console.error('Studio insert error:', studioErr)
      return NextResponse.json({ error: 'Failed to create studio listing' }, { status: 500 })
    }

    // Insert amenities
    await adminClient.from('studio_amenities').insert({ studio_id: studio.id, ...amenityData })

    // Insert equipment
    await adminClient.from('studio_equipment').insert({ studio_id: studio.id, ...equipmentData })

    // Insert studio images + set thumbnail_url
    type DbImageType = 'studio' | 'backdrop' | 'equipment' | 'walkthrough'
    const imageUrls: { url: string; cloudinary_id: string; image_type: string }[] = rawImageUrls ?? []
    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map((img, i) => ({
        studio_id: studio.id,
        url: img.url,
        cloudinary_id: img.cloudinary_id,
        // 'video' uploaded from the form maps to 'walkthrough' in the DB schema
        image_type: (img.image_type === 'video' ? 'walkthrough' : img.image_type) as DbImageType,
        is_thumbnail: i === 0 && img.image_type !== 'video',
        display_order: i,
      }))
      await adminClient.from('studio_images').insert(imageRows)

      const firstPhoto = imageUrls.find(i => i.image_type !== 'video')
      if (firstPhoto) {
        await adminClient.from('studios').update({ thumbnail_url: firstPhoto.url }).eq('id', studio.id)
      }
    }

    // Notify admin via WhatsApp (use the test number as admin for now)
    const adminPhone = process.env.TWILIO_WHATSAPP_TO_TEST?.replace('whatsapp:', '') || ''
    if (adminPhone) {
      sendAdminNewStudio({
        adminPhone,
        studioName: studio.studio_name,
        ownerName: data.owner_name,
        area: data.area,
        studioType: data.studio_type,
        adminUrl: process.env.NEXT_PUBLIC_APP_URL!,
      }).catch(err => console.error('Admin WA notify failed:', err))
    }

    // Audit log
    await adminClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'studio_created',
      entity_type: 'studio',
      entity_id: studio.id,
      new_value: { studio_name: studio.studio_name, status: 'pending' },
    })

    return NextResponse.json({ success: true, studio_id: studio.id }, { status: 201 })

  } catch (err: any) {
    console.error('Studio creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
