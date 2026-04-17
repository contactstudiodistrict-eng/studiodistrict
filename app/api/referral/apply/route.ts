// app/api/referral/apply/route.ts — POST apply a referral code
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })

  const admin = createAdminClient()

  // Check code exists
  const { data: codeRow } = await admin
    .from('referral_codes')
    .select('id, user_id')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (!codeRow) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
  }

  // Can't use own code
  if (codeRow.user_id === user.id) {
    return NextResponse.json({ error: "You can't use your own referral code" }, { status: 400 })
  }

  // Check user hasn't already used a referral code
  const { data: currentUser } = await admin
    .from('users')
    .select('referred_by')
    .eq('id', user.id)
    .single()

  if (currentUser?.referred_by) {
    return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 })
  }

  // Check user has 0 paid/completed bookings (new users only)
  const { count } = await admin
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['paid', 'completed'])

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'Referral codes are only for new users before their first booking' }, { status: 400 })
  }

  // Apply code
  await admin.from('users').update({ referred_by: code.toUpperCase().trim() }).eq('id', user.id)

  await admin.from('referrals').insert({
    referrer_user_id: codeRow.user_id,
    referred_user_id: user.id,
    referral_code: code.toUpperCase().trim(),
    status: 'pending',
  })

  return NextResponse.json({
    success: true,
    message: "Code applied! You'll get ₹200 credit after your first booking.",
  })
}
