const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM = 'Studio District <noreply@studiodistrict.in>'

async function send(payload: object) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
  return res.json()
}

export async function sendStudioApprovalEmail({
  ownerEmail,
  ownerName,
  studioName,
  dashboardUrl,
  listingUrl,
}: {
  ownerEmail: string
  ownerName: string
  studioName: string
  dashboardUrl: string
  listingUrl: string
}) {
  const firstName = ownerName.split(' ')[0]
  return send({
    from: FROM,
    to: ownerEmail,
    subject: `🎉 ${studioName} is now live on Studio District!`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

        <!-- Header -->
        <tr><td style="background:#0f172a;padding:28px 32px;text-align:center;">
          <span style="font-size:22px;font-weight:700;letter-spacing:-0.03em;">
            <span style="color:#ffffff;">Studio</span><span style="color:#84cc16;">District</span>
          </span>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:24px;">🎉</p>
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a;">
            You're live, ${firstName}!
          </h1>
          <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
            <strong style="color:#0f172a;">${studioName}</strong> has been approved and is now live on Studio District.
            Creators across Chennai can discover and book your studio right now.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr>
              <td style="padding-right:12px;">
                <a href="${listingUrl}" style="display:inline-block;padding:12px 22px;background:#84cc16;color:#111827;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
                  View My Listing →
                </a>
              </td>
              <td>
                <a href="${dashboardUrl}" style="display:inline-block;padding:12px 22px;background:#f1f5f9;color:#334155;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;border:1px solid #e2e8f0;">
                  Studio Dashboard
                </a>
              </td>
            </tr>
          </table>

          <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">

          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#64748b;">WHAT HAPPENS NEXT</p>
          <ul style="margin:0;padding-left:18px;font-size:14px;color:#475569;line-height:1.8;">
            <li>When a creator books, you'll get a WhatsApp notification instantly</li>
            <li>Reply YES or NO — or use your dashboard to confirm</li>
            <li>After confirmation, the customer pays online and you receive your payout</li>
          </ul>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            Questions? Reply to this email or WhatsApp us.<br>
            © 2025 Studio District · Chennai
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
