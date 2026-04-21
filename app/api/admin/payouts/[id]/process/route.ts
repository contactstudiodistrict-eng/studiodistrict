import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { reference } = await req.json()

  const adminClient = createAdminClient()

  const { error } = await (adminClient as any)
    .from('payouts')
    .update({
      status:            'paid',
      paid_at:           new Date().toISOString(),
      payout_method:     'manual',
      razorpay_payout_id: reference || null,
    })
    .eq('id', params.id)
    .eq('status', 'pending')

  if (error) {
    console.error('[Payout] Update error:', error)
    return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 })
  }

  await (adminClient as any).from('audit_logs').insert({
    action:      'payout_processed',
    entity_type: 'payout',
    entity_id:   params.id,
    new_value:   { status: 'paid', method: 'manual', reference: reference || null },
  })

  return NextResponse.json({ success: true })
}
