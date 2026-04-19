import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const NAME_REGEX = /^[a-zA-Z\s\-']{2,50}$/

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { first_name?: string; last_name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const first = body.first_name?.trim() ?? ''
  const last  = body.last_name?.trim()  ?? ''

  if (!NAME_REGEX.test(first)) {
    return NextResponse.json({ error: 'Invalid first name' }, { status: 400 })
  }
  if (!NAME_REGEX.test(last)) {
    return NextResponse.json({ error: 'Invalid last name' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('users')
    .update({ first_name: first, last_name: last } as never)
    .eq('id', user.id)
    .select('first_name, last_name')
    .single()

  if (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true, user: data })
}
