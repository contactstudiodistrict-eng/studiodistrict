import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const supabase = createClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('studio_id', params.id)
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed', 'awaiting_payment', 'paid'])

  return NextResponse.json({ bookedSlots: bookings ?? [] })
}
