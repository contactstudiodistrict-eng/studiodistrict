// lib/pricing.ts
// All pricing calculations in one place — easy to test and audit

export const WALLET_CAP = 200
export const REFERRAL_DISCOUNT = 100

// Tiered commission: marginal brackets (like tax slabs)
// ₹1–₹2,400 → 10% | ₹2,401–₹10,000 → 5% | ₹10,001+ → 2%
function calculateTieredCommission(subtotal: number): number {
  let fee = 0
  if (subtotal <= 2400) {
    fee = subtotal * 0.10
  } else if (subtotal <= 10000) {
    fee = 2400 * 0.10 + (subtotal - 2400) * 0.05
  } else {
    fee = 2400 * 0.10 + (10000 - 2400) * 0.05 + (subtotal - 10000) * 0.02
  }
  return Math.round(fee)
}

export interface PricingBreakdown {
  studioRate: number          // price per hour (₹)
  durationHours: number
  subtotal: number            // studioRate × durationHours
  platformFee: number         // tiered commission on subtotal
  gstAmount: number
  securityDeposit: number
  totalAmount: number         // subtotal + platformFee + gstAmount + securityDeposit
  studioPayout: number        // subtotal − platformFee
  commissionPercent: number   // effective rate for display
}

export function calculatePricing(
  pricePerHour: number,
  durationHours: number,
  _includeDeposit: boolean = true
): PricingBreakdown {
  const subtotal    = Math.round(pricePerHour * durationHours)
  const platformFee = calculateTieredCommission(subtotal)

  return {
    studioRate: pricePerHour,
    durationHours,
    subtotal,
    platformFee,
    gstAmount: 0,
    securityDeposit: 0,
    totalAmount:  subtotal,
    studioPayout: subtotal - platformFee,
    commissionPercent: subtotal > 0 ? Math.round((platformFee / subtotal) * 100 * 10) / 10 : 0,
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
  const platformFee = calculateTieredCommission(subtotal)
  return { subtotal, platformFee, gstAmount: 0, securityDeposit: 0, totalAmount: subtotal, studioPayout: subtotal - platformFee }
}

// For display in booking summary UI — pricing shown to customer is all-inclusive
export function getPricingLineItems(breakdown: PricingBreakdown) {
  return [
    {
      label: `Studio (${breakdown.durationHours} hrs × ${formatINR(breakdown.studioRate)})`,
      amount: breakdown.subtotal,
    },
    ...(breakdown.securityDeposit > 0
      ? [{
          label: 'Refundable security deposit',
          amount: breakdown.securityDeposit,
          note: 'Released within 2 hrs after booking if no damage',
        }]
      : []),
    {
      label: 'Total (all inclusive)',
      amount: breakdown.totalAmount,
      isTotal: true,
    },
  ]
}
