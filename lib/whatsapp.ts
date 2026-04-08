// lib/whatsapp.ts — Twilio WhatsApp, server only
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
const FROM   = process.env.TWILIO_WHATSAPP_FROM!   // whatsapp:+14155238886

function toWA(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // Handle: 10-digit (9876543210) or already has 91 prefix (919876543210)
  const withCC = digits.length === 10 ? `91${digits}` : digits.startsWith('91') ? digits : `91${digits}`
  return `whatsapp:+${withCC}`
}

async function send(to: string, body: string) {
  const waTo = toWA(to)
  console.log(`[WhatsApp] Sending to ${waTo}`)
  try {
    const msg = await client.messages.create({ from: FROM, to: waTo, body })
    console.log(`[WhatsApp] ✅ Sent SID: ${msg.sid} to ${waTo}`)
    return msg
  } catch (err: any) {
    console.error(`[WhatsApp] ❌ Failed to ${waTo}:`, err.message)
    throw err
  }
}

// ── 1. Booking request → Studio owner ────────────────────────────────────
// Uses short 8-char ID + plain YES/NO reply (no exposed URLs)
// Buttons not supported in sandbox — clean text is the best alternative
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
}) {
  // Short 8-char code — easy to type in WhatsApp reply
  const code = params.bookingId.slice(-8)

  const body =
`🎯 *New Booking — Framr*

📸 ${params.studioName}
👤 ${params.customerName}
📅 ${params.bookingDate}
🕐 ${params.timeRange} · ${params.durationHours} hrs
🎬 ${params.shootType}
📝 ${params.notes}
💰 Your payout: *₹${params.payoutAmount.toLocaleString('en-IN')}*

*Reply to this message:*
*YES* to confirm ✅
*NO* to decline ❌

_(Code: ${code})_`

  return send(params.ownerPhone, body)
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
  const body =
`✅ *Slot Confirmed — Pay to Lock It!*

📸 *${params.studioName}*
📅 ${params.bookingDate}
🕐 ${params.timeRange}
🔖 ${params.bookingRef}

💳 *Total: ₹${params.totalAmount.toLocaleString('en-IN')}*
_(Incl. ₹${params.securityDeposit} refundable deposit)_

👉 *Pay here:*
${params.paymentUrl}

⏰ Pay within 30 mins — slot will be released if unpaid.`

  return send(params.customerPhone, body)
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
  const body =
`🎉 *Booking Confirmed — Framr*

📸 *${params.studioName}*
📍 ${params.address}
📅 ${params.bookingDate}
🕐 ${params.timeRange}
🎬 ${params.shootType}
🔖 ${params.bookingRef}

📞 Studio: +91 ${params.ownerPhone}
${params.mapsLink ? `📌 Maps: ${params.mapsLink}` : ''}

GST invoice sent to your email.
See you at the shoot! 🙌`

  return send(params.customerPhone, body)
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
  const body =
`💰 *Payment Received — Framr*

👤 ${params.customerName}
📅 ${params.bookingDate} · ${params.timeRange}
🔖 ${params.bookingRef}

Payout: *₹${params.payoutAmount.toLocaleString('en-IN')}*
📆 Date: ${params.payoutDate}
🏦 To: ${params.accountLast4 ? `Account ••••${params.accountLast4}` : 'UPI'}

Prepare your studio! 🎬`

  return send(params.ownerPhone, body)
}

// ── 5. Booking declined → Customer ───────────────────────────────────────
export async function sendBookingDeclined(params: {
  customerPhone: string
  studioName:    string
  bookingDate:   string
  bookingRef:    string
  appUrl:        string
}) {
  const body =
`❌ *Booking Declined*

${params.studioName} declined your request for ${params.bookingDate}.
🔖 ${params.bookingRef}

No payment was taken.
👉 Find another studio: ${params.appUrl}`

  return send(params.customerPhone, body)
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
  const body =
`⏰ *Reminder — Your shoot is tomorrow!*

📸 ${params.studioName}
📅 ${params.bookingDate} at ${params.startTime}
📍 ${params.address}
📞 Studio: +91 ${params.ownerPhone}`

  return send(params.customerPhone, body)
}

// ── 7. New studio → Admin ─────────────────────────────────────────────────
export async function sendAdminNewStudio(params: {
  adminPhone:  string
  studioName:  string
  ownerName:   string
  area:        string
  studioType:  string
  adminUrl:    string
}) {
  const body =
`🏠 *New Studio Submitted — Framr*

📸 ${params.studioName}
👤 ${params.ownerName}
📍 ${params.area} · ${params.studioType}

Review: ${params.adminUrl}/admin/studios`

  return send(params.adminPhone, body)
}
