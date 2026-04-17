// lib/reviews.ts — HMAC token for no-auth review links
import { createHmac } from 'crypto'

export function generateReviewToken(bookingId: string): string {
  const secret = process.env.REVIEW_TOKEN_SECRET || 'fallback_review_secret'
  return createHmac('sha256', secret).update(bookingId).digest('hex').slice(0, 32)
}

export function verifyReviewToken(bookingId: string, token: string): boolean {
  if (!token || token.length !== 32) return false
  return generateReviewToken(bookingId) === token
}
