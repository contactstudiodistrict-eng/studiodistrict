// app/api/banners/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const audience = req.nextUrl.searchParams.get('audience') || 'all'
  const supabase = createClient()
  const now = new Date().toISOString()

  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .or(`show_to.eq.all,show_to.eq.${audience}`)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  return NextResponse.json({ banners: banners ?? [] })
}
