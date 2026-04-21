'use client'
import { useState } from 'react'
import { formatINR } from '@/lib/pricing'

const STATUS_POUT: Record<string, string> = {
  paid:       'bg-green-100 text-green-700',
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  failed:     'bg-red-100 text-red-600',
}

interface Payout {
  id: string
  amount: number
  status: string
  scheduled_for: string | null
  paid_at: string | null
  payout_method: string | null
  razorpay_payout_id: string | null
  studios: {
    studio_name: string
    owner_name: string | null
    account_number: string | null
    ifsc: string | null
    upi_id: string | null
    bank_account_name: string | null
  } | null
  bookings: {
    booking_ref: string
  } | null
}

export function PayoutsTable({ initialPayouts }: { initialPayouts: Payout[] }) {
  const [payouts, setPayouts] = useState(initialPayouts)
  const [modal, setModal] = useState<Payout | null>(null)
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openModal(p: Payout) {
    setModal(p)
    setReference('')
    setError(null)
  }

  function closeModal() {
    setModal(null)
    setError(null)
  }

  async function markPaid() {
    if (!modal) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/payouts/${modal.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: reference.trim() || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to process payout')
        return
      }
      setPayouts(prev => prev.map(p =>
        p.id === modal.id
          ? { ...p, status: 'paid', paid_at: new Date().toISOString(), payout_method: 'manual', razorpay_payout_id: reference.trim() || null }
          : p
      ))
      closeModal()
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Studio', 'Owner', 'Booking', 'Amount', 'Scheduled', 'Status', 'Ref / Method', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payouts.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No payouts yet</td></tr>
            ) : payouts.map(p => {
              const s = p.studios
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{s?.studio_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s?.owner_name || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.bookings?.booking_ref?.slice(-10) || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{formatINR(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p.scheduled_for ? new Date(p.scheduled_for).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_POUT[p.status] || 'bg-gray-100 text-gray-500'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {p.razorpay_payout_id
                      ? <span className="font-mono">{p.razorpay_payout_id}</span>
                      : p.payout_method
                      ? <span className="capitalize">{p.payout_method}</span>
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'pending' && (
                      <button
                        onClick={() => openModal(p)}
                        className="px-3 py-1 rounded text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-medium"
                      >
                        Process →
                      </button>
                    )}
                    {p.status === 'paid' && p.paid_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(p.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Process Payout Modal ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold text-base">Process Payout</div>
                <div className="text-gray-400 text-xs mt-0.5">{modal.studios?.studio_name}</div>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount */}
              <div className="bg-lime-50 border border-lime-200 rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-lime-700 uppercase tracking-wide mb-1">Amount to Transfer</div>
                <div className="text-3xl font-bold text-lime-700">{formatINR(modal.amount)}</div>
                {modal.bookings?.booking_ref && (
                  <div className="font-mono text-xs text-lime-600 mt-1">{modal.bookings.booking_ref}</div>
                )}
              </div>

              {/* Bank details */}
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Transfer Details</div>
                <div className="space-y-2 bg-gray-50 rounded-xl p-4 text-sm">
                  {modal.studios?.bank_account_name && (
                    <Row label="Account Name" value={modal.studios.bank_account_name} />
                  )}
                  {modal.studios?.account_number ? (
                    <Row label="Account Number" value={modal.studios.account_number} mono />
                  ) : (
                    <div className="text-amber-600 text-xs">⚠️ No bank account on file</div>
                  )}
                  {modal.studios?.ifsc && (
                    <Row label="IFSC Code" value={modal.studios.ifsc} mono />
                  )}
                  {modal.studios?.upi_id && (
                    <Row label="UPI ID" value={modal.studios.upi_id} mono />
                  )}
                  {!modal.studios?.account_number && !modal.studios?.upi_id && (
                    <div className="text-red-600 text-xs font-medium">No bank or UPI details found for this studio.</div>
                  )}
                </div>
              </div>

              {/* Reference ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Transaction / UTR Reference <span className="text-gray-300 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="e.g. UTR123456789012"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-lime-300"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{error}</div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={markPaid}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-lime-400 text-gray-900 text-sm font-bold hover:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving…' : '✓ Mark as Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`font-medium text-gray-800 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
