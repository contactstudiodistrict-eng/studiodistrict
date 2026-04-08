// lib/pricing.ts
// All pricing calculations in one place — easy to test and audit

const COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 10)
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
  includeDeposit: boolean = true
): PricingBreakdown {
  const subtotal = Math.round(pricePerHour * durationHours)
  const platformFee = Math.round(subtotal * (COMMISSION_PERCENT / 100))
  const gstAmount = Math.round(platformFee * (GST_PERCENT / 100))
  const securityDeposit = includeDeposit ? SECURITY_DEPOSIT : 0
  const totalAmount = subtotal + platformFee + gstAmount + securityDeposit
  const studioPayout = subtotal - platformFee  // studio gets subtotal minus commission

  return {
    studioRate: pricePerHour,
    durationHours,
    subtotal,
    platformFee,
    gstAmount,
    securityDeposit,
    totalAmount,
    studioPayout,
    commissionPercent: COMMISSION_PERCENT,
  }
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
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
