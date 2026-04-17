import { createAdminClient } from '@/lib/supabase/server'

const DEFAULT_AMOUNT = 200

export async function getReferralAmount(): Promise<number> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('banners')
      .select('referral_amount')
      .eq('type', 'referral')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle()
    return (data?.referral_amount as number) ?? DEFAULT_AMOUNT
  } catch {
    return DEFAULT_AMOUNT
  }
}
