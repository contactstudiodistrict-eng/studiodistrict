// lib/whatsapp.ts — Twilio WhatsApp, server only
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
const FROM   = process.env.TWILIO_WHATSAPP_FROM!

// Sandbox number uses free-form body; production number uses approved Content Templates
const IS_SANDBOX = FROM?.includes('14155238886')

// Meta-approved Content Template SIDs (production only)
const T = {
  BOOKING_REQUEST:   'HX44cc98e8c63c74834c6e9880cb3e883c',
  PAYMENT_LINK:      'HX46e918d5bd084fcedcbfea43d358be8f',
  BOOKING_CONFIRMED: 'HX207ccca2e9ef3ee1f5a519d797070b05',
  PAYMENT_RECEIVED:  'HXe7407b3b8e852a393e45d4e36ce11199',
  BOOKING_DECLINED:  'HX649a43ea247555061ae65c9aad5881fb',
  BOOKING_REMINDER:  'HX10d016532ea2c9c48f30fca59faafa07',
  REVIEW_REQUEST:    'HX6870f211654301c4943e431d19239d72',
  REFERRAL_REWARD:   'HX057a989e8ee3b6bd68281072d6ffeb65',
  NEW_STUDIO_ADMIN:  'HX6ada50a45cbfc86847935f4283e2ec92',
}

function toWA(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const withCC = digits.length === 10 ? `91${digits}` : digits.startsWith('91') ? digits : `91${digits}`
  return `whatsapp:+${withCC}`
}

// Sandbox: free-form body text
async function sendBody(to: string, body: string) {
  const waTo = toWA(to)
  console.log(`[WhatsApp][sandbox] Sending to ${waTo}`)
  try {
    const msg = await client.messages.create({ from: FROM, to: waTo, body })
    console.log(`[WhatsApp] ✅ SID: ${msg.sid}`)
    return msg
  } catch (err: any) {
    console.error(`[WhatsApp] ❌ Failed:`, err.message)
    throw err
  }
}

// Production: Meta-approved Content Template
async function sendTemplate(to: string, contentSid: string, variables: Record<string, string>) {
  const waTo = toWA(to)
  console.log(`[WhatsApp][prod] Sending template ${contentSid} to ${waTo}`)
  try {
    const msg = await client.messages.create({
      from: FROM,
      to: waTo,
      contentSid,
      contentVariables: JSON.stringify(variables),
    } as any)
    console.log(`[WhatsApp] ✅ SID: ${msg.sid}`)
    return msg
  } catch (err: any) {
    console.error(`[WhatsApp] ❌ Failed:`, err.message)
    throw err
  }
}

// ── 1. Booking request → Studio owner ────────────────────────────────────
export async function sendBookingRequest(params: {
  ownerPhone:    string
  studioName:    string
  customerName:  string
  bookingDate:   string
  timeRange:     string
  durationHours: number
  shootType:     string
  notes:         string
  payoutAmount:  number
  bookingRef:    string
  bookingId:     string
  packageName?:  string
  packagePrice?: number
}) {
  const packageLine = params.packageName
    ? `📦 Package: ${params.packageName} (₹${params.packagePrice?.toLocaleString('en-IN')} / ${params.durationHours} hrs)\n`
    : ''
  const notesWithPkg = params.packageName
    ? `Package: ${params.packageName} (₹${params.packagePrice?.toLocaleString('en-IN')})\n${params.notes}`
    : params.notes

  if (IS_SANDBOX) {
    return sendBody(params.ownerPhone,
`🎯 *New Booking — Studio District*

📸 ${params.studioName}
👤 ${params.customerName}
📅 ${params.bookingDate}
🕐 ${params.timeRange} · ${params.durationHours} hrs
${packageLine}🎬 ${params.shootType}
📝 ${params.notes}
💰 Your payout: *₹${params.payoutAmount.toLocaleString('en-IN')}*

*Reply to this message:*
*YES* to confirm ✅
*NO* to decline ❌

_(Code: ${params.bookingId.slice(-8)})_`)
  }

  return sendTemplate(params.ownerPhone, T.BOOKING_REQUEST, {
    '1': params.studioName,
    '2': params.customerName,
    '3': params.bookingDate,
    '4': params.timeRange,
    '5': String(params.durationHours),
    '6': params.shootType,
    '7': notesWithPkg || 'None',
    '8': params.payoutAmount.toLocaleString('en-IN'),
    '9': params.bookingId.slice(-8),
  })
}

// ── 2. Payment link → Customer ───────────────────────────────────────────
export async function sendPaymentLink(params: {
  customerPhone:   string
  studioName:      string
  bookingDate:     string
  timeRange:       string
  bookingRef:      string
  totalAmount:     number
  securityDeposit: number
  paymentUrl:      string
}) {
  if (IS_SANDBOX) {
    return sendBody(params.customerPhone,
`✅ *Slot Confirmed — Pay to Lock It!*

📸 *${params.studioName}*
📅 ${params.bookingDate}
🕐 ${params.timeRange}
🔖 ${params.bookingRef}

💳 *Total: ₹${params.totalAmount.toLocaleString('en-IN')}*
_(Incl. ₹${params.securityDeposit} refundable deposit)_

👉 *Pay here:*
${params.paymentUrl}

⏰ Pay within 30 mins — slot will be released if unpaid.`)
  }

  return sendTemplate(params.customerPhone, T.PAYMENT_LINK, {
    '1': params.studioName,
    '2': params.bookingDate,
    '3': params.timeRange,
    '4': params.bookingRef,
    '5': params.totalAmount.toLocaleString('en-IN'),
    '6': params.securityDeposit.toLocaleString('en-IN'),
    '7': params.paymentUrl,
  })
}

// ── 3. Booking confirmed + contact → Customer (after payment) ────────────
export async function sendBookingConfirmedCustomer(params: {
  customerPhone: string
  studioName:    string
  address:       string
  bookingDate:   string
  timeRange:     string
  shootType:     string
  bookingRef:    string
  mapsLink?:     string
  ownerPhone:    string
}) {
  if (IS_SANDBOX) {
    return sendBody(params.customerPhone,
`🎉 *Booking Confirmed — Studio District*

📸 *${params.studioName}*
📍 ${params.address}
📅 ${params.bookingDate}
🕐 ${params.timeRange}
🎬 ${params.shootType}
🔖 ${params.bookingRef}

📞 Studio: +91 ${params.ownerPhone}
${params.mapsLink ? `📌 Maps: ${params.mapsLink}` : ''}

See you at the shoot! 🙌`)
  }

  return sendTemplate(params.customerPhone, T.BOOKING_CONFIRMED, {
    '1': params.studioName,
    '2': params.address,
    '3': params.bookingDate,
    '4': params.timeRange,
    '5': params.bookingRef,
    '6': params.ownerPhone,
    '7': params.mapsLink ? `Maps: ${params.mapsLink}` : '',
  })
}

// ── 4. Payment received → Studio owner ───────────────────────────────────
export async function sendPaymentReceivedOwner(params: {
  ownerPhone:    string
  customerName:  string
  bookingDate:   string
  timeRange:     string
  bookingRef:    string
  payoutAmount:  number
  payoutDate:    string
  accountLast4?: string
}) {
  if (IS_SANDBOX) {
    return sendBody(params.ownerPhone,
`💰 *Payment Received — Studio District*

👤 ${params.customerName}
📅 ${params.bookingDate} · ${params.timeRange}
🔖 ${params.bookingRef}

Payout: *₹${params.payoutAmount.toLocaleString('en-IN')}*
📆 Date: ${params.payoutDate}
🏦 To: ${params.accountLast4 ? `Account ••••${params.accountLast4}` : 'UPI'}

Prepare your studio! 🎬`)
  }

  return sendTemplate(params.ownerPhone, T.PAYMENT_RECEIVED, {
    '1': params.customerName,
    '2': params.bookingDate,
    '3': params.timeRange,
    '4': params.bookingRef,
    '5': params.payoutAmount.toLocaleString('en-IN'),
    '6': params.payoutDate,
    '7': params.accountLast4 ? `Account ••••${params.accountLast4}` : 'UPI',
  })
}

// ── 5. Booking declined → Customer ───────────────────────────────────────
export async function sendBookingDeclined(params: {
  customerPhone: string
  studioName:    string
  bookingDate:   string
  bookingRef:    string
  appUrl:        string
}) {
  if (IS_SANDBOX) {
    return sendBody(params.customerPhone,
`❌ *Booking Declined*

${params.studioName} declined your request for ${params.bookingDate}.
🔖 ${params.bookingRef}

No payment was taken.
👉 Find another studio: ${params.appUrl}`)
  }

  return sendTemplate(params.customerPhone, T.BOOKING_DECLINED, {
    '1': params.studioName,
    '2': params.bookingDate,
    '3': params.bookingRef,
    '4': params.appUrl,
  })
}

// ── 6. Reminder → Customer (24hrs before) ────────────────────────────────
export async function sendBookingReminder(params: {
  customerPhone: string
  studioName:    string
  bookingDate:   string
  startTime:     string
  address:       string
  ownerPhone:    string
}) {
  if (IS_SANDBOX) {
    return sendBody(params.customerPhone,
`⏰ *Reminder — Your shoot is tomorrow!*

📸 ${params.studioName}
📅 ${params.bookingDate} at ${params.startTime}
📍 ${params.address}
📞 Studio: +91 ${params.ownerPhone}`)
  }

  return sendTemplate(params.customerPhone, T.BOOKING_REMINDER, {
    '1': params.studioName,
    '2': params.bookingDate,
    '3': params.startTime,
    '4': params.address,
    '5': params.ownerPhone,
  })
}

// ── 7. Review request → Customer ─────────────────────────────────────────
export async function sendReviewRequest(params: {
  customerPhone: string
  customerName:  string
  studioName:    string
  bookingDate:   string
  reviewUrl:     string
}) {
  const firstName = params.customerName.split(' ')[0]

  if (IS_SANDBOX) {
    return sendBody(params.customerPhone,
`⭐ *How was your shoot at ${params.studioName}?*

Hi ${firstName}! Your session on ${params.bookingDate} is complete.
We'd love to know how it went.

Rate your experience (takes 30 seconds):
${params.reviewUrl}

Your feedback helps other creators choose the right studio.
— Studio District`)
  }

  return sendTemplate(params.customerPhone, T.REVIEW_REQUEST, {
    '1': firstName,
    '2': params.studioName,
    '3': params.bookingDate,
    '4': params.reviewUrl,
  })
}

// ── 8. Referral reward → Referrer ─────────────────────────────────────────
export async function sendReferralRewardNotification(params: {
  referrerPhone: string
  referredName:  string
  amount:        number
}) {
  if (IS_SANDBOX) {
    return sendBody(params.referrerPhone,
`🎉 *Your referral paid off!*

${params.referredName} just completed their first booking on Studio District.

₹${params.amount} has been added to your Studio District wallet. Keep referring!

— Studio District`)
  }

  return sendTemplate(params.referrerPhone, T.REFERRAL_REWARD, {
    '1': params.referredName,
    '2': String(params.amount),
  })
}

// ── 9. New studio → Admin ─────────────────────────────────────────────────
export async function sendAdminNewStudio(params: {
  adminPhone:  string
  studioName:  string
  ownerName:   string
  area:        string
  studioType:  string
  adminUrl:    string
}) {
  if (IS_SANDBOX) {
    return sendBody(params.adminPhone,
`🏠 *New Studio Submitted — Studio District*

📸 ${params.studioName}
👤 ${params.ownerName}
📍 ${params.area} · ${params.studioType}

Review: ${params.adminUrl}/admin/studios`)
  }

  return sendTemplate(params.adminPhone, T.NEW_STUDIO_ADMIN, {
    '1': params.studioName,
    '2': params.ownerName,
    '3': params.area,
    '4': params.studioType,
    '5': `${params.adminUrl}/admin/studios`,
  })
}
