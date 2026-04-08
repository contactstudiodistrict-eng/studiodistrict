// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface Props { params: { id: string } }

// GET single booking
export async function GET(req: NextRequest, { params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data, error } = await supabase
    .from('bookings')
    .select(`*, studios(studio_name, area, address, owner_phone, google_maps_link)`)
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check access (must be customer or studio owner)
  const isCustomer = data.user_id === user.id
  const { data: studio } = await supabase.from('studios').select('owner_id').eq('id', data.studio_id).single()
  const isOwner = studio?.owner_id === user.id
  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', user.id).single()

  if (!isCustomer && !isOwner && !admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ booking: data })
}

// DELETE — cancel booking
export async function DELETE(req: NextRequest, { params }: Props) {
  const supabase = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Fetch booking to verify ownership and status
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, user_id, status, studio_id, booking_date, booking_ref')
    .eq('id', params.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Only allow cancellation of pending/confirmed/awaiting_payment
  if (!['pending', 'confirmed', 'awaiting_payment'].includes(booking.status)) {
    return NextResponse.json({ error: `Cannot cancel a booking with status: ${booking.status}` }, { status: 400 })
  }

  await adminClient.from('bookings').update({ status: 'cancelled' }).eq('id', params.id)

  // Audit log
  await adminClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking_cancelled',
    entity_type: 'booking',
    entity_id: params.id,
    old_value: { status: booking.status },
    new_value: { status: 'cancelled' },
  })

  return NextResponse.json({ success: true })
}
