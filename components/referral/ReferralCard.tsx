'use client'
// components/referral/ReferralCard.tsx
import { useEffect, useState } from 'react'

interface ReferralData {
  code: string
  referral_amount: number
  total_referrals: number
  total_earned: number
  referrals: { status: string; referred_name: string; created_at: string }[]
}

export function ReferralCard() {
  const [data, setData]       = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  function copyCode() {
    if (!data?.code) return
    navigator.clipboard.writeText(data.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function shareWhatsApp() {
    if (!data?.code) return
    const amount = data.referral_amount ?? 200
    const msg = encodeURIComponent(
      `Book studios in Chennai instantly on Studio District. Use my code ${data.code} for ₹${amount} off your first booking 🎨\nhttps://studiodistrict.in/login?ref=${data.code}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  if (loading) {
    return (
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ height: '16px', background: '#e5e7eb', borderRadius: '8px', width: '40%', marginBottom: '12px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '8px', width: '70%', animation: 'pulse 1.5s infinite' }} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #fff)', border: '1px solid #d9f99d', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ fontSize: '24px' }}>🎁</span>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>Refer &amp; Earn</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Give a friend ₹{data.referral_amount ?? 200} · Get ₹{data.referral_amount ?? 200} back</div>
        </div>
      </div>

      {/* Code row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ flex: 1, background: '#fff', border: '2px solid #84cc16', borderRadius: '10px', padding: '10px 14px', fontWeight: '700', fontSize: '18px', color: '#111827', letterSpacing: '0.1em', textAlign: 'center' as const }}>
          {data.code}
        </div>
        <button
          onClick={copyCode}
          style={{ padding: '10px 16px', background: copied ? '#22c55e' : '#84cc16', color: '#111827', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s', whiteSpace: 'nowrap' as const }}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      {/* WhatsApp share */}
      <button
        onClick={shareWhatsApp}
        style={{ width: '100%', padding: '11px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Share on WhatsApp
      </button>

      {/* Stats */}
      {(data.total_referrals > 0 || data.total_earned > 0) && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {data.total_referrals} {data.total_referrals === 1 ? 'friend' : 'friends'} referred
          </span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>
            ₹{data.total_earned.toLocaleString('en-IN')} earned
          </span>
        </div>
      )}
    </div>
  )
}
