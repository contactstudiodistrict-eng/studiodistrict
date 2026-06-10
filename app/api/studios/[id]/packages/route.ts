import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient()
  const { data, error } = await (admin as any)
    .from('studio_packages')
    .select('*')
    .eq('studio_id', params.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ packages: data ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Must be owner of this studio
  const { data: studio } = await (admin as any)
    .from('studios')
    .select('id')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single()
  if (!studio) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    package_name, description, duration_hours, price, original_price,
    included_equipment, included_extras,
    max_people, rules, badge_text, display_order, images,
  } = body

  if (!package_name || package_name.length < 2 || package_name.length > 100)
    return NextResponse.json({ error: 'Package name must be 2–100 characters' }, { status: 400 })
  if (!duration_hours || Number(duration_hours) <= 0)
    return NextResponse.json({ error: 'Duration must be greater than 0' }, { status: 400 })
  if (!price || Number(price) <= 0)
    return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 })
  if (original_price && Number(original_price) <= Number(price))
    return NextResponse.json({ error: 'Original price must be greater than price' }, { status: 400 })

  const { data, error } = await (admin as any)
    .from('studio_packages')
    .insert({
      studio_id:          params.id,
      package_name:       package_name.trim(),
      description:        description?.trim() || null,
      duration_hours:     Number(duration_hours),
      price:              Number(price),
      original_price:     original_price ? Number(original_price) : null,
      included_equipment: included_equipment ?? [],
      included_extras:    included_extras ?? [],
      images:             Array.isArray(images) ? images : [],
      max_people:         max_people ? Number(max_people) : null,
      rules:              rules?.trim() || null,
      badge_text:         badge_text?.trim() || null,
      display_order:      Number(display_order ?? 0),
      is_active:          true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ package: data }, { status: 201 })
}
