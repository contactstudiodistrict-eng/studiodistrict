// app/api/admin/studios/[id]/[action]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendAdminNewStudio } from '@/lib/whatsapp'
import { sendStudioApprovalEmail } from '@/lib/email'

interface Props { params: { id: string; action: string } }

export async function GET(req: NextRequest, { params }: Props) {
  return handler(req, params)
}
export async function POST(req: NextRequest, { params }: Props) {
  return handler(req, params)
}

async function handler(req: NextRequest, params: { id: string; action: string }) {
  const supabase = createClient()
  const adminClient = createAdminClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: studioId, action } = params

  const STATUS_MAP: Record<string, string> = {
    approve: 'live',
    reject: 'suspended',
    suspend: 'suspended',
    reactivate: 'live',
  }

  const newStatus = STATUS_MAP[action]
  if (!newStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  // Update studio status
  const { data: studio, error } = await adminClient
    .from('studios')
    .update({ status: newStatus })
    .eq('id', studioId)
    .select('studio_name, owner_id, owner_phone, owner_name, owner_email, area, studio_type')
    .single()

  if (error || !studio) return NextResponse.json({ error: 'Studio not found' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (action === 'approve') {
    // Promote owner role to studio_owner
    await adminClient.from('users').update({ role: 'studio_owner' }).eq('id', studio.owner_id)

    // Notify via WhatsApp
    const twilio = await import('twilio')
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
    const ownerPhone = studio.owner_phone.replace(/\D/g, '')
    const waPhone = `+${ownerPhone.startsWith('91') ? ownerPhone : '91' + ownerPhone}`
    client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${waPhone}`,
      body: `🎉 *Your studio is now LIVE on Studio District!*\n\n📸 ${studio.studio_name}\n\nCreators in Chennai can now discover and book your studio.\n\n👉 View your listing: ${appUrl}\n\n— Team Studio District`,
    }).catch(console.error)

    // Send approval email via Resend
    if (studio.owner_email) {
      sendStudioApprovalEmail({
        ownerEmail: studio.owner_email,
        ownerName: studio.owner_name,
        studioName: studio.studio_name,
        dashboardUrl: `${appUrl}/studio/dashboard`,
        listingUrl: `${appUrl}/studios/${studioId}`,
      }).catch(err => console.error('Approval email failed:', err))
    }
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    user_id: user.id,
    action: `studio_${action}d`,
    entity_type: 'studio',
    entity_id: studioId,
    new_value: { status: newStatus },
  })

  // Redirect back to admin studios page
  return NextResponse.redirect(new URL('/admin/studios', req.url))
}
