// lib/razorpay.ts
// ⚠️ STUB — Wire up when Razorpay credentials arrive
// Replace the stub functions below with real API calls

export interface RazorpayPaymentLink {
  id: string
  short_url: string
  amount: number
  status: string
}

// ── Create Payment Link ───────────────────────────────────────────────────
export async function createRazorpayPaymentLink(params: {
  bookingId: string
  bookingRef: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  totalAmountRupees: number  // in ₹ (not paise)
  description: string
}): Promise<RazorpayPaymentLink> {

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    // Return a stub payment URL pointing to our own payment page
    console.log('[Razorpay] Credentials not set — using stub payment link')
    return {
      id: `stub_${Date.now()}`,
      short_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${params.bookingId}/pay`,
      amount: params.totalAmountRupees * 100,
      status: 'created',
    }
  }

  // ── Real Razorpay implementation ─────────────────────────────────────
  const { default: Razorpay } = await import('razorpay')
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const link = await (razorpay as any).paymentLink.create({
    amount: params.totalAmountRupees * 100,  // convert to paise
    currency: 'INR',
    accept_partial: false,
    description: params.description,
    customer: {
      name: params.customerName,
      contact: `+91${params.customerPhone}`,
      email: params.customerEmail || '',
    },
    notify: { sms: true, email: !!params.customerEmail, whatsapp: false },
    reminder_enable: true,
    notes: {
      booking_id: params.bookingId,
      booking_ref: params.bookingRef,
    },
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${params.bookingId}/success`,
    callback_method: 'get',
    expire_by: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
  })

  return link
}

// ── Verify Webhook Signature ──────────────────────────────────────────────
export function verifyRazorpayWebhook(body: string, signature: string): boolean {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return true  // stub: always pass

  const crypto = require('crypto')
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  return signature === expected
}

// ── Process Payout ────────────────────────────────────────────────────────
export async function createRazorpayPayout(params: {
  accountNumber: string
  ifsc: string
  amountRupees: number
  narration: string
  referenceId: string
}): Promise<{ id: string; status: string }> {

  if (!process.env.RAZORPAY_KEY_ID) {
    console.log('[Razorpay] Payout stub — credentials not set')
    return { id: `payout_stub_${Date.now()}`, status: 'processing' }
  }

  // Real Razorpay Payouts API call goes here
  // Requires Razorpay X (Current Account) — different from standard Razorpay
  throw new Error('Razorpay Payouts API not configured. Requires Razorpay X account.')
}
