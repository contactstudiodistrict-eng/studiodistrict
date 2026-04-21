// lib/razorpay.ts
// ⚠️ STUB — Wire up when Razorpay credentials arrive
// Replace the stub functions below with real API calls

export interface RazorpayPaymentLink {
  id: string
  short_url: string
  amount: number
  status: string
}

// ── Create Order (used with Checkout.js — in-app payment, no Razorpay notifications) ──
export async function createRazorpayOrder(params: {
  bookingId: string
  bookingRef: string
  totalAmountRupees: number
}): Promise<{ id: string; amount: number; currency: string }> {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured')
  }

  const { default: Razorpay } = await import('razorpay')
  const rzp = new Razorpay({
    key_id:    process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const order = await rzp.orders.create({
    amount:   params.totalAmountRupees * 100, // paise
    currency: 'INR',
    receipt:  params.bookingRef,
    notes:    { booking_id: params.bookingId, booking_ref: params.bookingRef },
  })

  return order as { id: string; amount: number; currency: string }
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
