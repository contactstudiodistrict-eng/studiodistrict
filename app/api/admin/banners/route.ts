// app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
  return admin ? user : null
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const admin = createAdminClient()
  const { data: banners, error } = await admin
    .from('banners')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ banners: banners ?? [] })
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { referral_amount, ...rest } = body
  const payload: Record<string, unknown> = { ...rest, created_by: user.id }
  if (rest.type === 'referral' && referral_amount != null) payload.referral_amount = referral_amount

  const admin = createAdminClient()
  const { data, error } = await admin.from('banners').insert(payload).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ banner: data })
}
