// app/api/referral/validate/route.ts — GET: check a code is valid without applying it
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getReferralAmount } from '@/lib/referral-config'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to apply a referral code' }, { status: 401 })

  const code = new URL(req.url).searchParams.get('code')?.toUpperCase().trim()
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const admin = createAdminClient()

  const { data: codeRow } = await admin
    .from('referral_codes')
    .select('id, user_id')
    .eq('code', code)
    .single()

  if (!codeRow) return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
  if (codeRow.user_id === user.id) return NextResponse.json({ error: "You can't use your own referral code" }, { status: 400 })

  const { data: currentUser } = await (admin as any)
    .from('users')
    .select('referred_by')
    .eq('id', user.id)
    .single()

  if (currentUser?.referred_by) return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 })

  const { count } = await (admin as any)
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['paid', 'completed'])

  if ((count ?? 0) > 0) return NextResponse.json({ error: 'Referral codes are only for your first booking' }, { status: 400 })

  const amount = await getReferralAmount()
  return NextResponse.json({ valid: true, message: `Code valid! You'll earn ₹${amount} wallet credit after payment.` })
}
