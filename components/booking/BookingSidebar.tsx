'use client'
// components/booking/BookingSidebar.tsx
import { useState } from 'react'
import { calculatePricing, formatINR, getPricingLineItems } from '@/lib/pricing'
import type { Studio } from '@/types/database.types'

export function BookingSidebar({ studio }: { studio: Studio }) {
  const [hours, setHours] = useState(studio.minimum_hours)
  const pricing = calculatePricing(studio.price_per_hour, hours)
  const lineItems = getPricingLineItems(pricing)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-50">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-serif text-gray-900">{formatINR(studio.price_per_hour)}</span>
          <span className="text-sm text-gray-400">/ hour</span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">Minimum {studio.minimum_hours} hours</div>
      </div>

      <div className="p-5">
        {/* Duration selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Duration</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
            <button onClick={() => setHours(h => Math.max(studio.minimum_hours, h - 1))}
              className="text-gray-400 hover:text-gray-700 text-xl font-light w-6 h-6 flex items-center justify-center">−</button>
            <span className="flex-1 text-center text-sm font-semibold">{hours} {hours === 1 ? 'hour' : 'hours'}</span>
            <button onClick={() => setHours(h => Math.min(8, h + 1))}
              className="text-gray-400 hover:text-gray-700 text-xl font-light w-6 h-6 flex items-center justify-center">+</button>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 mb-5">
          {lineItems.map((item, i) => (
            <div key={i} className={`flex justify-between text-sm ${item.isTotal ? 'border-t border-gray-100 pt-3 mt-3 font-bold text-gray-900' : 'text-gray-500'}`}>
              <span>{item.label}</span>
              <span>{formatINR(item.amount)}</span>
            </div>
          ))}
        </div>

        <a href={`/studios/${studio.id}/book`}
          className="block w-full py-4 text-center rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-colors">
          Check Availability →
        </a>

        <div className="mt-4 text-center text-xs text-gray-400">
          No payment required to request a booking
        </div>
      </div>

      {/* Package rates */}
      {(studio.half_day_rate || studio.full_day_rate) && (
        <div className="px-5 pb-5">
          <div className="border-t border-gray-50 pt-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Package rates</div>
            <div className="space-y-2">
              {studio.half_day_rate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Half day (4 hrs)</span>
                  <span className="font-semibold text-gray-700">{formatINR(studio.half_day_rate)}</span>
                </div>
              )}
              {studio.full_day_rate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Full day (8 hrs)</span>
                  <span className="font-semibold text-gray-700">{formatINR(studio.full_day_rate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
