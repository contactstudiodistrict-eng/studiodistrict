// app/api/cloudinary/sign/route.ts
// Returns Cloudinary config for unsigned client-side uploads
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 503 })
  }

  return NextResponse.json({ cloud_name: cloudName, upload_preset: uploadPreset })
}
