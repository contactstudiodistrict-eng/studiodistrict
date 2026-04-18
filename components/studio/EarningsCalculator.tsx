'use client'
import { useState } from 'react'

const RATES  = [500, 800, 1000, 1200, 1500, 2000, 2500, 3000]
const HOURS  = [5, 8, 10, 15, 20, 25, 30]
const FEE    = 0.10
const WEEKS  = 4.33 // average weeks per month

function fmt(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

export function EarningsCalculator() {
  const [rate,  setRate]  = useState(1200)
  const [hours, setHours] = useState(10)

  const gross   = rate * hours * WEEKS
  const payout  = gross * (1 - FEE)
  const fee     = gross * FEE

  const selectCls = "w-full px-4 py-3 text-sm font-semibold rounded-xl focus:outline-none cursor-pointer appearance-none"
  const chevron   = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2384cc16'/%3E%3C/svg%3E")`
  const selStyle  = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    color: '#f1f5f9',
    backgroundImage: chevron,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
  }

  return (
    <div className="mt-10 max-w-md mx-auto rounded-2xl p-6 sm:p-7"
      style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>

      <p className="text-sm font-semibold mb-5" style={{ color: '#a3e635' }}>
        💰 How much could you earn?
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-xs mb-1.5" style={{ color: '#64748b' }}>My studio rate</label>
          <select value={rate} onChange={e => setRate(Number(e.target.value))}
            className={selectCls} style={selStyle}>
            {RATES.map(r => (
              <option key={r} value={r}>₹{r.toLocaleString('en-IN')}/hr</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1.5" style={{ color: '#64748b' }}>Bookings/week</label>
          <select value={hours} onChange={e => setHours(Number(e.target.value))}
            className={selectCls} style={selStyle}>
            {HOURS.map(h => (
              <option key={h} value={h}>{h} hrs</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }}>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs" style={{ color: '#64748b' }}>Estimated monthly payout</span>
          <span className="text-2xl font-black" style={{ color: '#a3e635' }}>
            {fmt(payout)}
          </span>
        </div>
        <div className="flex justify-between text-xs mt-2 pt-2" style={{ borderTop: '1px solid #1e293b', color: '#475569' }}>
          <span>Gross: {fmt(gross)}</span>
          <span>Platform fee: −{fmt(fee)} (10%)</span>
        </div>
      </div>

      <p className="text-xs mt-3 text-center" style={{ color: '#334155' }}>
        Estimate only · Actual earnings depend on occupancy
      </p>
    </div>
  )
}
