// app/auth/callback/route.ts
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Backfill full_name from Google OAuth metadata if not yet set
      const { data: { user } } = await supabase.auth.getUser()
      const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name
      if (user && googleName) {
        const adminClient = createAdminClient()
        const { data: profile } = await adminClient.from('users').select('full_name').eq('id', user.id).single()
        if (!profile?.full_name || profile.full_name.includes('@')) {
          await adminClient.from('users').update({ full_name: googleName }).eq('id', user.id)
        }
      }
      return NextResponse.redirect(new URL(next, req.url))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', req.url))
}
