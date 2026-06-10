import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function ownerCheck(userId: string, studioId: string, packageId: string, admin: any) {
  const { data: pkg } = await admin
    .from('studio_packages')
    .select('id, studios(owner_id)')
    .eq('id', packageId)
    .eq('studio_id', studioId)
    .single()
  if (!pkg) return null
  if ((pkg.studios as any)?.owner_id !== userId) return null
  return pkg
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; packageId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const pkg = await ownerCheck(user.id, params.id, params.packageId, admin)
  if (!pkg) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  const body = await req.json()

  // Validate if price fields present
  if (body.price !== undefined && Number(body.price) <= 0)
    return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 })
  if (body.original_price !== undefined && body.price !== undefined
    && Number(body.original_price) <= Number(body.price))
    return NextResponse.json({ error: 'Original price must be greater than price' }, { status: 400 })

  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  const allowed = ['package_name','description','duration_hours','price','original_price',
    'included_equipment','included_extras','max_people','rules',
    'badge_text','display_order','is_active','images']
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await (admin as any)
    .from('studio_packages')
    .update(updates)
    .eq('id', params.packageId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ package: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; packageId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const pkg = await ownerCheck(user.id, params.id, params.packageId, admin)
  if (!pkg) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  // Soft delete
  const { error } = await (admin as any)
    .from('studio_packages')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', params.packageId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
