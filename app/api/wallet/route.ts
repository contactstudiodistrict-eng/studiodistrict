// app/api/wallet/route.ts — GET wallet balance + credits
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ balance: 0, credits: [], expiredCount: 0 })

  const admin = createAdminClient()

  const { data: userData } = await admin
    .from('users')
    .select('wallet_balance')
    .eq('id', user.id)
    .single()

  const now = new Date().toISOString()

  const { data: credits } = await admin
    .from('wallet_credits')
    .select('id, amount, type, description, expires_at, created_at')
    .eq('user_id', user.id)
    .is('used_at', null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })

  const { count: expiredCount } = await admin
    .from('wallet_credits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('used_at', null)
    .lt('expires_at', now)

  return NextResponse.json({
    balance: userData?.wallet_balance ?? 0,
    credits: credits || [],
    expiredCount: expiredCount ?? 0,
  })
}
