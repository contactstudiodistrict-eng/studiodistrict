// lib/referral.ts — Referral code generation + lookup
import { createAdminClient } from '@/lib/supabase/server'

function generateCode(name: string): string {
  const prefix = (name || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X')
  const suffix = String(Math.floor(10 + Math.random() * 90))
  return prefix + suffix
}

export async function getOrCreateReferralCode(userId: string, userName: string = ''): Promise<string> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .single()

  if (existing?.code) return existing.code

  // Find a unique code
  let code = ''
  for (let i = 0; i < 10; i++) {
    const candidate = generateCode(userName)
    const { data: conflict } = await admin
      .from('referral_codes')
      .select('id')
      .eq('code', candidate)
      .maybeSingle()
    if (!conflict) { code = candidate; break }
  }
  // Fallback to timestamp-based code if all collided
  if (!code) code = `SD${Date.now().toString(36).toUpperCase().slice(-4)}`

  await admin.from('referral_codes').insert({
    user_id: userId,
    code,
    total_referrals: 0,
    total_earned: 0,
  })

  return code
}
