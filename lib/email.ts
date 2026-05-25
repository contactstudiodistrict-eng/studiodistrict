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

export async function sendBookingConfirmedEmail({
  customerEmail,
  customerName,
  studioName,
  studioArea,
  address,
  ownerPhone,
  bookingDate,
  timeRange,
  shootType,
  bookingRef,
  subtotal,
  platformFee,
  gstAmount,
  securityDeposit,
  totalAmount,
  packageName,
  mapsLink,
  bookingUrl,
}: {
  customerEmail:   string
  customerName:    string
  studioName:      string
  studioArea:      string
  address:         string
  ownerPhone:      string
  bookingDate:     string
  timeRange:       string
  shootType:       string
  bookingRef:      string
  subtotal:        number
  platformFee:     number
  gstAmount:       number
  securityDeposit: number
  totalAmount:     number
  packageName?:    string | null
  mapsLink?:       string | null
  bookingUrl:      string
}) {
  const firstName = customerName.split(' ')[0]
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
  const subtotalLabel = packageName ? `Package: ${packageName}` : 'Studio charges'

  return send({
    from: FROM,
    to: customerEmail,
    subject: `Booking Confirmed — ${studioName} on ${bookingDate}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

        <tr><td style="background:#0f172a;padding:28px 32px;text-align:center;">
          <span style="font-size:22px;font-weight:700;letter-spacing:-0.03em;">
            <span style="color:#ffffff;">Studio</span><span style="color:#84cc16;">District</span>
          </span>
        </td></tr>

        <tr><td style="padding:32px;">
          <p style="margin:0 0 4px;font-size:22px;">🎉</p>
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">You're all set, ${firstName}!</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Your booking at <strong style="color:#0f172a;">${studioName}</strong> is confirmed and paid.</p>

          <!-- Booking details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Studio</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${studioName}</p>
              <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${studioArea}</p>
            </td></tr>
            <tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Date & Time</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">${bookingDate}</p>
              <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${timeRange}</p>
            </td></tr>
            <tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Shoot Type</p>
              <p style="margin:0;font-size:14px;color:#0f172a;">${shootType}</p>
            </td></tr>
            <tr><td style="padding:14px 20px;">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Booking Ref</p>
              <p style="margin:0;font-size:13px;font-family:monospace;color:#475569;">${bookingRef}</p>
            </td></tr>
          </table>

          <!-- Pricing breakdown -->
          <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Payment Summary</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding:5px 0;font-size:14px;color:#475569;">${subtotalLabel}</td>
              <td style="padding:5px 0;font-size:14px;color:#0f172a;text-align:right;">${fmt(subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;font-size:14px;color:#475569;">Platform fee (10%)</td>
              <td style="padding:5px 0;font-size:14px;color:#0f172a;text-align:right;">${fmt(platformFee)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:8px;border-top:2px solid #f1f5f9;"></td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:15px;font-weight:700;color:#0f172a;">Total paid <span style="font-size:12px;font-weight:400;color:#94a3b8;">(all inclusive)</span></td>
              <td style="padding:4px 0;font-size:15px;font-weight:700;color:#65a30d;text-align:right;">${fmt(totalAmount)}</td>
            </tr>
          </table>

          <!-- Studio contact -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <tr><td>
              <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#166534;">📍 Studio Contact</p>
              <p style="margin:0 0 4px;font-size:14px;color:#0f172a;">${address}</p>
              <p style="margin:0 0 4px;font-size:14px;color:#0f172a;">📞 +91 ${ownerPhone}</p>
              ${mapsLink ? `<a href="${mapsLink}" style="font-size:13px;color:#16a34a;font-weight:600;">Open in Google Maps →</a>` : ''}
            </td></tr>
          </table>

          <!-- CTA -->
          <a href="${bookingUrl}" style="display:block;padding:14px;background:#84cc16;color:#111827;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;text-align:center;margin-bottom:20px;">
            View Booking Status →
          </a>

          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
            The amount shown is all-inclusive. No hidden charges.
          </p>
        </td></tr>

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

export async function sendPayoutReceiptEmail({
  ownerEmail,
  ownerName,
  customerName,
  studioName,
  bookingDate,
  timeRange,
  bookingRef,
  payoutAmount,
  payoutDate,
  accountLast4,
  dashboardUrl,
}: {
  ownerEmail:    string
  ownerName:     string
  customerName:  string
  studioName:    string
  bookingDate:   string
  timeRange:     string
  bookingRef:    string
  payoutAmount:  number
  payoutDate:    string
  accountLast4?: string
  dashboardUrl:  string
}) {
  const firstName = ownerName.split(' ')[0]
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return send({
    from: FROM,
    to: ownerEmail,
    subject: `Payment received — ${fmt(payoutAmount)} for ${bookingRef}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

        <tr><td style="background:#0f172a;padding:28px 32px;text-align:center;">
          <span style="font-size:22px;font-weight:700;letter-spacing:-0.03em;">
            <span style="color:#ffffff;">Studio</span><span style="color:#84cc16;">District</span>
          </span>
        </td></tr>

        <tr><td style="padding:32px;">
          <p style="margin:0 0 4px;font-size:22px;">💰</p>
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Payment received, ${firstName}!</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#64748b;">
            <strong style="color:#0f172a;">${customerName}</strong> has paid for their booking at ${studioName}.
          </p>

          <!-- Booking summary -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Customer</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">${customerName}</p>
            </td></tr>
            <tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Date & Time</p>
              <p style="margin:0;font-size:14px;color:#0f172a;">${bookingDate} · ${timeRange}</p>
            </td></tr>
            <tr><td style="padding:14px 20px;">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Booking Ref</p>
              <p style="margin:0;font-size:13px;font-family:monospace;color:#475569;">${bookingRef}</p>
            </td></tr>
          </table>

          <!-- Payout highlight -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
            <tr><td style="text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#166534;font-weight:600;">YOUR PAYOUT</p>
              <p style="margin:0 0 8px;font-size:32px;font-weight:700;color:#15803d;">${fmt(payoutAmount)}</p>
              <p style="margin:0;font-size:13px;color:#16a34a;">
                Expected by <strong>${payoutDate}</strong>
                ${accountLast4 ? ` · Account ••••${accountLast4}` : ' · via UPI'}
              </p>
            </td></tr>
          </table>

          <!-- CTA -->
          <a href="${dashboardUrl}" style="display:block;padding:14px;background:#84cc16;color:#111827;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;text-align:center;margin-bottom:20px;">
            View Dashboard →
          </a>

          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
            Payouts are processed within 1 business day after the booking completes. Contact us if you have any questions about your payout.
          </p>
        </td></tr>

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
