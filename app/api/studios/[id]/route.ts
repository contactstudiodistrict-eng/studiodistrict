// app/api/studios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { studioOnboardSchema } from '@/lib/validations'
import { sendAdminNewStudio } from '@/lib/whatsapp'

const AMENITY_FIELDS = ['ac','parking','makeup_room','changing_room','restroom','wifi','power_backup','natural_light','elevator','props','waiting_area','pantry']
const EQUIPMENT_FIELDS = [
  'softboxes','led_panels','ring_lights','tripods','light_stands',
  'backdrop_white','backdrop_black','backdrop_colors','green_matte',
  'audio_gear','soundproofing','camera_rental','camera_details',
  'teleprompter','video_monitor',
  'condenser_mic','dynamic_mic','broadcast_mic','pop_filter','podcast_mixer','headphone_amp','acoustic_treatment',
  'studio_monitors','mixing_console','daw_computer','isolation_booth','di_box','instrument_amps',
]

// GET /api/studios/[id] — fetch studio for owner edit prefill
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase    = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: studio } = await (adminClient as any)
    .from('studios')
    .select('*, studio_amenities(*), studio_equipment(*), studio_images(*)')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single()

  if (!studio) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
  return NextResponse.json({ studio })
}

// PATCH /api/studios/[id] — update an existing studio (draft → pending, or draft → draft)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase    = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Verify ownership
  const { data: existing } = await (adminClient as any)
    .from('studios')
    .select('owner_id, status')
    .eq('id', params.id)
    .single()

  if (!existing || existing.owner_id !== user.id) {
    return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
  }

  const body = await req.json()
  const { image_urls: rawImageUrls, ...formBody } = body

  // Run full Zod validation only when finalising (pending submission)
  if (formBody.status === 'pending') {
    const parsed = studioOnboardSchema.safeParse(formBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
  }

  // Split into studio / amenity / equipment
  const studioData:    Record<string, any> = {}
  const amenityData:   Record<string, any> = {}
  const equipmentData: Record<string, any> = {}

  for (const [k, v] of Object.entries(formBody)) {
    if (AMENITY_FIELDS.includes(k))        amenityData[k]   = v
    else if (EQUIPMENT_FIELDS.includes(k)) equipmentData[k] = v
    else                                   studioData[k]    = v
  }

  // Update studio
  const { error: updateErr } = await (adminClient as any)
    .from('studios')
    .update(studioData)
    .eq('id', params.id)

  if (updateErr) {
    console.error('[PATCH studios] Update error:', updateErr)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  // Upsert amenities + equipment
  if (Object.keys(amenityData).length > 0) {
    await (adminClient as any)
      .from('studio_amenities')
      .upsert({ studio_id: params.id, ...amenityData }, { onConflict: 'studio_id' })
  }
  if (Object.keys(equipmentData).length > 0) {
    await (adminClient as any)
      .from('studio_equipment')
      .upsert({ studio_id: params.id, ...equipmentData }, { onConflict: 'studio_id' })
  }

  // Upsert images when finalising (delete existing draft images first to avoid duplicates)
  if (studioData.status === 'pending' && rawImageUrls?.length > 0) {
    await (adminClient as any).from('studio_images').delete().eq('studio_id', params.id)
    type DbImageType = 'studio' | 'backdrop' | 'equipment' | 'walkthrough'
    const imageRows = (rawImageUrls as any[]).map((img, i) => ({
      studio_id:     params.id,
      url:           img.url,
      cloudinary_id: img.cloudinary_id,
      image_type:    (img.image_type === 'video' ? 'walkthrough' : img.image_type) as DbImageType,
      is_thumbnail:  i === 0 && img.image_type !== 'video',
      display_order: i,
    }))
    await (adminClient as any).from('studio_images').insert(imageRows)

    const firstPhoto = (rawImageUrls as any[]).find(i => i.image_type !== 'video')
    if (firstPhoto) {
      await (adminClient as any).from('studios').update({ thumbnail_url: firstPhoto.url }).eq('id', params.id)
    }
  }

  // On finalise: update role, notify admin, audit
  if (studioData.status === 'pending') {
    const { data: profileUpdates }: any = await (adminClient as any)
      .from('users').select('full_name, role').eq('id', user.id).single()
    const updates: Record<string, string> = {}
    // Never downgrade an existing admin/super_admin
    const adminRoles = ['super_admin', 'admin']
    if (!adminRoles.includes(profileUpdates?.role)) {
      updates.role = 'studio_owner'
    }
    if (!profileUpdates?.full_name || profileUpdates.full_name.includes('@')) {
      updates.full_name = studioData.owner_name || ''
    }
    if (Object.keys(updates).length > 0) {
      await (adminClient as any).from('users').update(updates).eq('id', user.id)
    }

    const { data: studio }: any = await (adminClient as any)
      .from('studios').select('studio_name, area, studio_type, owner_name').eq('id', params.id).single()

    const adminPhone = process.env.TWILIO_WHATSAPP_TO_TEST?.replace('whatsapp:', '') || ''
    if (adminPhone && studio) {
      sendAdminNewStudio({
        adminPhone,
        studioName:  studio.studio_name,
        ownerName:   studio.owner_name,
        area:        studio.area,
        studioType:  studio.studio_type,
        adminUrl:    process.env.NEXT_PUBLIC_APP_URL!,
      }).catch(err => console.error('[PATCH studios] Admin WA failed:', err))
    }

    await (adminClient as any).from('audit_logs').insert({
      user_id:     user.id,
      action:      'studio_submitted',
      entity_type: 'studio',
      entity_id:   params.id,
      new_value:   { status: 'pending' },
    })
  }

  return NextResponse.json({ success: true, studio_id: params.id })
}
