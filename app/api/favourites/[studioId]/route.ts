// app/api/favourites/[studioId]/route.ts — DELETE unfavourite
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface Props { params: { studioId: string } }

export async function DELETE(_req: NextRequest, { params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const admin = createAdminClient()

  const { error } = await admin
    .from('studio_favourites')
    .delete()
    .eq('user_id', user.id)
    .eq('studio_id', params.studioId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ favourited: false })
}
