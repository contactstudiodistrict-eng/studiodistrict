import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  const supabase = createClient()
  const admin    = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Verify the studio belongs to this owner
  const { data: studio } = await (admin as any)
    .from('studios')
    .select('owner_id')
    .eq('id', params.id)
    .single()

  if (!studio || studio.owner_id !== user.id) {
    return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
  }

  const { error } = await (admin as any)
    .from('studio_images')
    .delete()
    .eq('id', params.imageId)
    .eq('studio_id', params.id)

  if (error) {
    console.error('[DELETE image]', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
