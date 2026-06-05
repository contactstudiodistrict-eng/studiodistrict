// app/api/studios/draft/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const AMENITY_FIELDS = ['ac','parking','makeup_room','changing_room','restroom','wifi','power_backup','natural_light','elevator','props','waiting_area','pantry']
const EQUIPMENT_FIELDS = [
  'softboxes','led_panels','ring_lights','tripods','light_stands',
  'backdrop_white','backdrop_black','backdrop_colors','green_matte',
  'audio_gear','soundproofing','camera_rental','camera_details',
  'teleprompter','video_monitor',
  'condenser_mic','dynamic_mic','broadcast_mic','pop_filter','podcast_mixer','headphone_amp','acoustic_treatment',
  'studio_monitors','mixing_console','daw_computer','isolation_booth','di_box','instrument_amps',
]

function splitFields(body: Record<string, any>) {
  const studio: Record<string, any> = {}
  const amenity: Record<string, any> = {}
  const equipment: Record<string, any> = {}
  for (const [k, v] of Object.entries(body)) {
    if (AMENITY_FIELDS.includes(k))   amenity[k]   = v
    else if (EQUIPMENT_FIELDS.includes(k)) equipment[k] = v
    else studio[k] = v
  }
  return { studio, amenity, equipment }
}

// GET — fetch the current user's draft studio (if any)
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ draft: null })

  const admin = createAdminClient()
  const { data: draft } = await (admin as any)
    .from('studios')
    .select('*, studio_amenities(*), studio_equipment(*), studio_images(*)')
    .eq('owner_id', user.id)
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ draft: draft ?? null })
}

// POST — create or update the current user's draft (upsert by owner_id)
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { image_urls: imageUrls, ...formValues } = body

  const { studio: raw, amenity: amenityData, equipment: equipmentData } = splitFields(formValues)

  // Fill required DB columns with safe defaults so partial drafts don't fail NOT NULL
  const studioData = {
    studio_name:         raw.studio_name         || 'Untitled Studio',
    studio_type:         raw.studio_type         || 'photography',
    owner_name:          raw.owner_name          || '',
    owner_phone:         raw.owner_phone         || '0000000000',
    email:               raw.email               || '',
    address:             raw.address             || '',
    area:                raw.area                || '',
    price_per_hour:      Number(raw.price_per_hour)  || 0,
    minimum_hours:       Number(raw.minimum_hours)   || 2,
    max_people:          Number(raw.max_people)       || 8,
    no_smoking:          raw.no_smoking          ?? true,
    no_shoes:            raw.no_shoes            ?? true,
    food_allowed:        raw.food_allowed        ?? false,
    pets_allowed:        raw.pets_allowed        ?? false,
    cancellation_policy: raw.cancellation_policy || 'free_24h',
    working_days:        raw.working_days        || ['mon','tue','wed','thu','fri','sat'],
    opening_time:        raw.opening_time        || '07:00',
    closing_time:        raw.closing_time        || '21:00',
    short_description:   raw.short_description   || null,
    full_description:    raw.full_description    || null,
    unique_points:       raw.unique_points       || null,
    ideal_for:           raw.ideal_for           || [],
    extra_charges_json:  raw.extra_charges_json  || {},
    google_maps_link:    raw.google_maps_link    || null,
    half_day_rate:       raw.half_day_rate       || null,
    full_day_rate:       raw.full_day_rate       || null,
    overtime_charges:    raw.overtime_charges    || null,
    bank_account_name:   raw.bank_account_name   || null,
    account_number:      raw.account_number      || null,
    ifsc:                raw.ifsc                || null,
    upi_id:              raw.upi_id              || null,
  }

  const admin = createAdminClient()

  // Check for existing draft
  const { data: existing } = await (admin as any)
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .eq('status', 'draft')
    .limit(1)
    .maybeSingle()

  let draftId: string

  if (existing) {
    draftId = existing.id
    await (admin as any).from('studios').update(studioData).eq('id', draftId)
    await (admin as any).from('studio_amenities')
      .upsert({ studio_id: draftId, ...amenityData }, { onConflict: 'studio_id' })
    await (admin as any).from('studio_equipment')
      .upsert({ studio_id: draftId, ...equipmentData }, { onConflict: 'studio_id' })
  } else {
    const { data: newDraft, error } = await (admin as any)
      .from('studios')
      .insert({ ...studioData, owner_id: user.id, status: 'draft' })
      .select('id')
      .single()

    if (error || !newDraft) {
      console.error('[Draft] Create error:', error)
      return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
    }
    draftId = newDraft.id
    await (admin as any).from('studio_amenities').insert({ studio_id: draftId, ...amenityData })
    await (admin as any).from('studio_equipment').insert({ studio_id: draftId, ...equipmentData })
  }

  // Persist images: delete existing draft images, re-insert current set
  if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    await (admin as any).from('studio_images').delete().eq('studio_id', draftId)
    type DbImageType = 'studio' | 'backdrop' | 'equipment' | 'walkthrough'
    const imageRows = imageUrls.map((img: any, i: number) => ({
      studio_id:     draftId,
      url:           img.url,
      cloudinary_id: img.cloudinary_id,
      image_type:    (img.image_type === 'video' ? 'walkthrough' : img.image_type) as DbImageType,
      is_thumbnail:  i === 0 && img.image_type !== 'video',
      display_order: i,
    }))
    await (admin as any).from('studio_images').insert(imageRows)
  }

  return NextResponse.json({ draft_id: draftId })
}
