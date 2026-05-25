// lib/pricing.ts
// All pricing calculations in one place — easy to test and audit

const COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 10)
export const WALLET_CAP = 200
export const REFERRAL_DISCOUNT = 100
const GST_PERCENT = Number(process.env.GST_PERCENT ?? 18)
const SECURITY_DEPOSIT = Number(process.env.SECURITY_DEPOSIT_AMOUNT ?? 1200)

export interface PricingBreakdown {
  studioRate: number          // price per hour (₹)
  durationHours: number
  subtotal: number            // studioRate × durationHours
  platformFee: number         // 10% of subtotal
  gstAmount: number           // 18% of platformFee
  securityDeposit: number     // fixed ₹1,200
  totalAmount: number         // subtotal + platformFee + gstAmount + securityDeposit
  studioPayout: number        // subtotal − any add-on fees
  commissionPercent: number
}

export function calculatePricing(
  pricePerHour: number,
  durationHours: number,
  _includeDeposit: boolean = true
): PricingBreakdown {
  const subtotal    = Math.round(pricePerHour * durationHours)
  const platformFee = Math.round(subtotal * (COMMISSION_PERCENT / 100))

  return {
    studioRate: pricePerHour,
    durationHours,
    subtotal,
    platformFee,
    gstAmount: 0,
    securityDeposit: 0,
    totalAmount:  subtotal,               // customer pays the listed price
    studioPayout: subtotal - platformFee, // platform fee deducted internally
    commissionPercent: COMMISSION_PERCENT,
  }
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export interface PackagePricingBreakdown {
  subtotal: number
  platformFee: number
  gstAmount: number
  securityDeposit: number
  totalAmount: number
  studioPayout: number
}

export function calculatePackagePricing(packagePrice: number): PackagePricingBreakdown {
  const subtotal    = packagePrice
  const platformFee = Math.round(subtotal * (COMMISSION_PERCENT / 100))
  return { subtotal, platformFee, gstAmount: 0, securityDeposit: 0, totalAmount: subtotal, studioPayout: subtotal - platformFee }
}

// For display in booking summary UI
export function getPricingLineItems(breakdown: PricingBreakdown) {
  return [
    {
      label: `Studio (${breakdown.durationHours} hrs × ${formatINR(breakdown.studioRate)})`,
      amount: breakdown.subtotal,
    },
    {
      label: `Platform fee (${breakdown.commissionPercent}%)`,
      amount: breakdown.platformFee,
    },
    {
      label: `GST (18% on fee)`,
      amount: breakdown.gstAmount,
    },
    ...(breakdown.securityDeposit > 0
      ? [{
          label: 'Refundable security deposit',
          amount: breakdown.securityDeposit,
          note: 'Released within 2 hrs after booking if no damage',
        }]
      : []),
    {
      label: 'Total payable',
      amount: breakdown.totalAmount,
      isTotal: true,
    },
  ]
}
