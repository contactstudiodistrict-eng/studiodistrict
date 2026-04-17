// app/api/referral/route.ts — GET referral code + stats
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getOrCreateReferralCode } from '@/lib/referral'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const admin = createAdminClient()

  // Get user's name for code generation
  const { data: profile } = await admin
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const code = await getOrCreateReferralCode(user.id, profile?.full_name || '')

  // Get referral stats
  const { data: codeRow } = await admin
    .from('referral_codes')
    .select('total_referrals, total_earned')
    .eq('user_id', user.id)
    .single()

  // Get successful referrals list
  const { data: referralsList } = await admin
    .from('referrals')
    .select('status, rewarded_at, created_at, referred_user_id, users!referrals_referred_user_id_fkey(full_name)')
    .eq('referrer_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const referrals = (referralsList || []).map((r: any) => ({
    status: r.status,
    rewarded_at: r.rewarded_at,
    created_at: r.created_at,
    referred_name: (r.users?.full_name || 'Friend').split(' ')[0],
  }))

  return NextResponse.json({
    code,
    total_referrals: codeRow?.total_referrals ?? 0,
    total_earned: codeRow?.total_earned ?? 0,
    referrals,
  })
}
