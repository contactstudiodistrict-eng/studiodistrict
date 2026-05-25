// lib/whatsapp.ts — Twilio WhatsApp, server only
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
const FROM   = process.env.TWILIO_WHATSAPP_FROM!

// Meta-approved Content Template SIDs
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

async function sendTemplate(to: string, contentSid: string, variables: Record<string, string>) {
  const waTo = toWA(to)
  console.log(`[WhatsApp] Sending template ${contentSid} to ${waTo}`)
  try {
    const msg = await client.messages.create({
      from: FROM,
      to: waTo,
      contentSid,
      contentVariables: JSON.stringify(variables),
    } as any)
    console.log(`[WhatsApp] ✅ Sent SID: ${msg.sid} to ${waTo}`)
    return msg
  } catch (err: any) {
    console.error(`[WhatsApp] ❌ Failed to ${waTo}:`, err.message)
    throw err
  }
}

// ── 1. Booking request → Studio owner ────────────────────────────────────
// Variables: 1=studio_name 2=customer_name 3=booking_date 4=time_range
//            5=duration_hrs 6=shoot_type 7=notes 8=payout_amount 9=booking_code
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
  const notes = params.packageName
    ? `Package: ${params.packageName} (₹${params.packagePrice?.toLocaleString('en-IN')})\n${params.notes}`
    : params.notes

  return sendTemplate(params.ownerPhone, T.BOOKING_REQUEST, {
    '1': params.studioName,
    '2': params.customerName,
    '3': params.bookingDate,
    '4': params.timeRange,
    '5': String(params.durationHours),
    '6': params.shootType,
    '7': notes || 'None',
    '8': params.payoutAmount.toLocaleString('en-IN'),
    '9': params.bookingId.slice(-8),
  })
}

// ── 2. Payment link → Customer ───────────────────────────────────────────
// Variables: 1=studio_name 2=booking_date 3=time_range 4=booking_ref
//            5=total_amount 6=security_deposit 7=payment_url
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
// Variables: 1=studio_name 2=address 3=booking_date 4=time_range
//            5=booking_ref 6=owner_phone 7=maps_line
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
// Variables: 1=customer_name 2=booking_date 3=time_range 4=booking_ref
//            5=payout_amount 6=payout_date 7=account_info
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
// Variables: 1=studio_name 2=booking_date 3=booking_ref 4=app_url
export async function sendBookingDeclined(params: {
  customerPhone: string
  studioName:    string
  bookingDate:   string
  bookingRef:    string
  appUrl:        string
}) {
  return sendTemplate(params.customerPhone, T.BOOKING_DECLINED, {
    '1': params.studioName,
    '2': params.bookingDate,
    '3': params.bookingRef,
    '4': params.appUrl,
  })
}

// ── 6. Reminder → Customer (24hrs before) ────────────────────────────────
// Variables: 1=studio_name 2=booking_date 3=start_time 4=address 5=owner_phone
export async function sendBookingReminder(params: {
  customerPhone: string
  studioName:    string
  bookingDate:   string
  startTime:     string
  address:       string
  ownerPhone:    string
}) {
  return sendTemplate(params.customerPhone, T.BOOKING_REMINDER, {
    '1': params.studioName,
    '2': params.bookingDate,
    '3': params.startTime,
    '4': params.address,
    '5': params.ownerPhone,
  })
}

// ── 7. Review request → Customer ─────────────────────────────────────────
// Variables: 1=customer_first_name 2=studio_name 3=booking_date 4=review_url
export async function sendReviewRequest(params: {
  customerPhone: string
  customerName:  string
  studioName:    string
  bookingDate:   string
  reviewUrl:     string
}) {
  return sendTemplate(params.customerPhone, T.REVIEW_REQUEST, {
    '1': params.customerName.split(' ')[0],
    '2': params.studioName,
    '3': params.bookingDate,
    '4': params.reviewUrl,
  })
}

// ── 8. Referral reward → Referrer ─────────────────────────────────────────
// Variables: 1=referred_name 2=reward_amount
export async function sendReferralRewardNotification(params: {
  referrerPhone: string
  referredName:  string
  amount:        number
}) {
  return sendTemplate(params.referrerPhone, T.REFERRAL_REWARD, {
    '1': params.referredName,
    '2': String(params.amount),
  })
}

// ── 9. New studio → Admin ─────────────────────────────────────────────────
// Variables: 1=studio_name 2=owner_name 3=area 4=studio_type 5=admin_url
export async function sendAdminNewStudio(params: {
  adminPhone:  string
  studioName:  string
  ownerName:   string
  area:        string
  studioType:  string
  adminUrl:    string
}) {
  return sendTemplate(params.adminPhone, T.NEW_STUDIO_ADMIN, {
    '1': params.studioName,
    '2': params.ownerName,
    '3': params.area,
    '4': params.studioType,
    '5': `${params.adminUrl}/admin/studios`,
  })
}
