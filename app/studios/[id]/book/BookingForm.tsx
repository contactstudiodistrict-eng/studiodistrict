'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calculatePricing, calculatePackagePricing, formatINR } from '@/lib/pricing'

const SHOOT_TYPES = [
  'Model Portfolio', 'Product Creative', 'Social Media / Reels',
  'Brand Campaign', 'YouTube Content', 'Podcast Recording',
  'Music Recording', 'Personal / Family', 'Event Coverage', 'Other',
]

type Studio = {
  id: string
  studio_name: string
  area: string
  price_per_hour: number
  minimum_hours: number
  opening_time: string
  closing_time: string
  working_days: string[]
}

type Package = {
  id: string
  package_name: string
  description: string | null
  duration_hours: number
  price: number
  original_price: number | null
  included_equipment: string[] | null
  included_amenities: string[] | null
  included_extras: string[] | null
  max_people: number | null
  rules: string | null
  badge_text: string | null
}

export function BookingForm({ studio, userId }: { studio: Studio; userId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rebookId  = searchParams.get('rebook')
  const packageId = searchParams.get('package')

  const [step, setStep]           = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [rebookBanner, setRebookBanner] = useState(false)

  // Package state
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [packageLoading, setPackageLoading]   = useState(false)

  // Wallet
  const [walletBalance, setWalletBalance] = useState(0)
  const [applyWallet, setApplyWallet]     = useState(false)
  const [walletLoading, setWalletLoading] = useState(false)

  // Referral code
  const [referralCode,   setReferralCode]   = useState('')
  const [referralStatus, setReferralStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [referralMsg,    setReferralMsg]    = useState('')
  const [showReferral,   setShowReferral]   = useState(false)

  // Form fields
  const [date,      setDate]      = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration,  setDuration]  = useState(studio.minimum_hours)
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [email,     setEmail]     = useState('')
  const [shootType, setShootType] = useState('')
  const [notes,     setNotes]     = useState('')

  // On mount
  useEffect(() => {
    setWalletLoading(true)
    fetch('/api/wallet')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.balance) setWalletBalance(d.balance) })
      .finally(() => setWalletLoading(false))

    if (packageId) {
      setPackageLoading(true)
      fetch(`/api/studios/${studio.id}/packages`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d?.packages) return
          const pkg = d.packages.find((p: Package) => p.id === packageId)
          if (pkg) {
            setSelectedPackage(pkg)
            setDuration(pkg.duration_hours)
          }
        })
        .finally(() => setPackageLoading(false))
    }

    if (rebookId) {
      fetch(`/api/bookings/${rebookId}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d?.booking) return
          const b = d.booking
          if (b.duration_hours && !packageId) setDuration(b.duration_hours)
          if (b.shoot_type)     setShootType(b.shoot_type)
          if (b.customer_name)  setName(b.customer_name)
          if (b.customer_phone) setPhone(b.customer_phone)
          if (b.notes)          setNotes(b.notes)
          setRebookBanner(true)
        })
    }
  }, [rebookId, packageId, studio.id])

  function calcEndTime(start: string, hrs: number): string {
    if (!start) return ''
    const [h, m] = start.split(':').map(Number)
    const endH = h + hrs
    if (endH > 23) return '23:59'
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const endTime = calcEndTime(startTime, duration)

  // Pricing — package mode uses flat price
  const pricing = selectedPackage
    ? calculatePackagePricing(selectedPackage.price)
    : calculatePricing(studio.price_per_hour, duration)

  const walletDiscount = applyWallet ? Math.min(walletBalance, pricing.totalAmount) : 0
  const finalTotal     = pricing.totalAmount - walletDiscount

  const packageItems = selectedPackage ? [
    ...(selectedPackage.included_equipment ?? []),
    ...(selectedPackage.included_amenities ?? []),
    ...(selectedPackage.included_extras ?? []),
  ] : []

  async function validateReferralCode(code: string) {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) { setReferralStatus('idle'); setReferralMsg(''); return }
    setReferralStatus('checking')
    try {
      const res = await fetch(`/api/referral/validate?code=${encodeURIComponent(trimmed)}`)
      const d = await res.json()
      if (res.ok) { setReferralStatus('valid'); setReferralMsg(d.message) }
      else        { setReferralStatus('invalid'); setReferralMsg(d.error) }
    } catch {
      setReferralStatus('invalid'); setReferralMsg('Could not validate code')
    }
  }

  function validateStep1(): string {
    if (!date)      return 'Please select a date'
    if (!startTime) return 'Please select a start time'
    if (date < new Date().toISOString().split('T')[0]) return 'Please select a future date'
    return ''
  }
  function validateStep2(): string {
    if (!name.trim())                 return 'Please enter your full name'
    if (!/^[6-9]\d{9}$/.test(phone)) return 'Enter a valid 10-digit Indian mobile number'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
    if (!shootType)                   return 'Please select a shoot type'
    return ''
  }

  function goToStep2() { const e = validateStep1(); if (e) { setError(e); return }; setError(''); setStep(2) }
  function goToStep3() { const e = validateStep2(); if (e) { setError(e); return }; setError(''); setStep(3) }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    const payload: Record<string, any> = {
      studio_id:           studio.id,
      customer_name:       name.trim(),
      customer_phone:      phone.trim(),
      customer_email:      email.trim() || null,
      booking_date:        date,
      start_time:          startTime,
      end_time:            endTime,
      duration_hours:      duration,
      shoot_type:          shootType,
      notes:               notes.trim() || null,
      apply_wallet_credit: applyWallet && walletBalance > 0,
      ...(referralStatus === 'valid' && referralCode.trim() ? { referral_code: referralCode.trim().toUpperCase() } : {}),
    }

    if (selectedPackage) {
      payload.package_id    = selectedPackage.id
      payload.package_name  = selectedPackage.package_name
      payload.package_price = selectedPackage.price
    }

    try {
      const res = await fetch('/api/bookings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || `Server error (${res.status})`)
      router.push(`/bookings/${result.booking_id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const s = {
    wrap:     { fontFamily: 'system-ui,sans-serif', maxWidth: '560px', margin: '0 auto', paddingBottom: '80px' } as React.CSSProperties,
    card:     { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '14px' } as React.CSSProperties,
    label:    { display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: '6px' },
    input:    { width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, transition: 'border-color .15s' },
    select:   { width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, background: '#fff', appearance: 'none' as const },
    btn:      { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '700', fontFamily: 'inherit', background: '#84cc16', color: '#111827', transition: 'background .15s' } as React.CSSProperties,
    btnGhost: { flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '14px', fontWeight: '500', fontFamily: 'inherit', background: '#fff', color: '#374151' } as React.CSSProperties,
    btnOff:   { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', fontFamily: 'inherit', background: '#d9f99d', color: '#fff', cursor: 'not-allowed' } as React.CSSProperties,
    row2:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } as React.CSSProperties,
    field:    { marginBottom: '14px' } as React.CSSProperties,
    errBox:   { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', color: '#dc2626', fontSize: '14px', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' } as React.CSSProperties,
    priceRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', padding: '5px 0' } as React.CSSProperties,
  }

  function fDate(d: string) {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  function fTime(t: string) {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  const steps = ['Date & Time', 'Your Details', 'Review & Send']

  return (
    <div style={s.wrap}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        {steps.map((label, i) => {
          const n = i + 1; const done = n < step; const active = n === step
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700',
                  background: done ? '#22c55e' : active ? '#84cc16' : '#f3f4f6',
                  color: done || active ? '#fff' : '#9ca3af',
                  border: `2px solid ${done ? '#22c55e' : active ? '#84cc16' : '#e5e7eb'}` }}>
                  {done ? '✓' : n}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '500', color: active ? '#84cc16' : done ? '#22c55e' : '#9ca3af', display: 'none', whiteSpace: 'nowrap' }}
                  className="sm:block">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: done ? '#86efac' : '#f3f4f6', margin: '0 8px' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Package banner */}
      {selectedPackage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #84cc16', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '4px' }}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>📦 {selectedPackage.package_name}</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#166534', flexShrink: 0 }}>{formatINR(selectedPackage.price)}</div>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            {selectedPackage.duration_hours} hours{selectedPackage.max_people ? ` · Up to ${selectedPackage.max_people} people` : ''}
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
            <a href={`/studios/${studio.id}`} style={{ color: '#166534', fontWeight: '600', textDecoration: 'none' }}>Change package</a>
            <span style={{ color: '#d1d5db' }}>·</span>
            <a href={`/studios/${studio.id}/book`} style={{ color: '#6b7280', textDecoration: 'none' }}>Switch to hourly</a>
          </div>
        </div>
      )}

      {/* Rebook banner */}
      {rebookBanner && (
        <div style={{ background: '#f0fdf4', border: '1px solid #84cc16', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#166534' }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>♻️</span>
          <span><strong>Pre-filled from your last booking</strong> · Change any details below</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={s.errBox}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Studio strip */}
      <div style={{ background: '#f7fee7', border: '1px solid #d9f99d', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>📸</span>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{studio.studio_name}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {studio.area} · {selectedPackage ? `📦 ${selectedPackage.package_name}` : `₹${studio.price_per_hour.toLocaleString('en-IN')}/hr`}
          </div>
        </div>
      </div>

      {/* ── STEP 1: Date & Time ── */}
      {step === 1 && (
        <div style={s.card}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', margin: '0 0 18px' }}>Pick date & time</h2>

          <div style={s.field}>
            <label style={s.label}>Booking date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} style={s.input}
              onFocus={e => e.target.style.borderColor = '#84cc16'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <div style={{ ...s.row2, marginBottom: '14px' }}>
            <div>
              <label style={s.label}>Start time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                min={studio.opening_time} max={studio.closing_time} style={s.input}
                onFocus={e => e.target.style.borderColor = '#84cc16'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={s.label}>End time</label>
              <input type="time" value={endTime} readOnly
                style={{ ...s.input, background: '#f9fafb', color: endTime ? '#374151' : '#9ca3af' }} />
            </div>
          </div>

          {/* Duration — locked in package mode */}
          {!selectedPackage ? (
            <div style={s.field}>
              <label style={s.label}>Duration</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                <button type="button" onClick={() => setDuration(d => Math.max(studio.minimum_hours, d - 1))}
                  style={{ padding: '11px 18px', background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#374151', fontWeight: '300' }}>−</button>
                <div style={{ flex: 1, textAlign: 'center', fontWeight: '600', fontSize: '15px', color: '#111827' }}>
                  {duration} {duration === 1 ? 'hour' : 'hours'}
                </div>
                <button type="button" onClick={() => setDuration(d => Math.min(12, d + 1))}
                  style={{ padding: '11px 18px', background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#374151', fontWeight: '300' }}>+</button>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '5px' }}>Minimum {studio.minimum_hours} hours · Opens {studio.opening_time} – Closes {studio.closing_time}</div>
            </div>
          ) : (
            <div style={{ ...s.field, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '4px' }}>Duration (fixed by package)</div>
              <div style={{ fontWeight: '600', fontSize: '15px', color: '#111827' }}>
                {selectedPackage.duration_hours} {selectedPackage.duration_hours === 1 ? 'hour' : 'hours'}
              </div>
            </div>
          )}

          {startTime && date && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#15803d', marginBottom: '14px' }}>
              ✅ {fDate(date)} · {fTime(startTime)} – {fTime(endTime)}
            </div>
          )}

          <button type="button" onClick={goToStep2} style={s.btn}
            onMouseOver={e => (e.currentTarget.style.background = '#65a30d')}
            onMouseOut={e => (e.currentTarget.style.background = '#84cc16')}>
            Continue → Your Details
          </button>
        </div>
      )}

      {/* ── STEP 2: Details ── */}
      {step === 2 && (
        <div style={s.card}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', margin: '0 0 18px' }}>Your details</h2>

          <div style={s.field}>
            <label style={s.label}>Full name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Arjun Sharma" autoFocus style={s.input}
              onFocus={e => e.target.style.borderColor = '#84cc16'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <div style={s.field}>
            <label style={s.label}>WhatsApp number *</label>
            <div style={{ display: 'flex' }}>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRight: 'none', borderRadius: '10px 0 0 10px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                🇮🇳 +91
              </span>
              <input type="tel" inputMode="numeric" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                style={{ ...s.input, borderRadius: '0 10px 10px 0', borderLeft: 'none', flex: 1, width: 'auto' }}
                onFocus={e => e.target.style.borderColor = '#84cc16'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Email (optional)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="arjun@email.com" style={s.input}
              onFocus={e => e.target.style.borderColor = '#84cc16'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Shoot type *</label>
            <select value={shootType} onChange={e => setShootType(e.target.value)} style={s.select}>
              <option value="">— Select shoot type —</option>
              {SHOOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Notes for studio owner</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="e.g. Team of 4, need 3 backdrop changes…"
              style={{ ...s.input, resize: 'none', lineHeight: '1.5' }} />
          </div>

          {/* Referral code */}
          <div style={{ marginBottom: '18px' }}>
            {!showReferral ? (
              <button type="button" onClick={() => setShowReferral(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#84cc16', fontWeight: '600', padding: 0, fontFamily: 'inherit' }}>
                🎟 Have a referral code?
              </button>
            ) : (
              <div>
                <label style={s.label}>Referral code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={e => { setReferralCode(e.target.value.toUpperCase()); setReferralStatus('idle'); setReferralMsg('') }}
                    placeholder="e.g. ARJUN2X"
                    maxLength={12}
                    style={{ ...s.input, flex: 1, textTransform: 'uppercase', letterSpacing: '.05em',
                      borderColor: referralStatus === 'valid' ? '#84cc16' : referralStatus === 'invalid' ? '#ef4444' : '#e5e7eb' }}
                    onFocus={e => e.target.style.borderColor = '#84cc16'}
                    onBlur={e => { if (referralStatus === 'idle') e.target.style.borderColor = '#e5e7eb' }}
                  />
                  <button type="button"
                    onClick={() => validateReferralCode(referralCode)}
                    disabled={referralStatus === 'checking' || !referralCode.trim()}
                    style={{ padding: '0 16px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151', fontFamily: 'inherit', flexShrink: 0, opacity: !referralCode.trim() ? 0.5 : 1 }}>
                    {referralStatus === 'checking' ? '…' : 'Apply'}
                  </button>
                </div>
                {referralMsg && (
                  <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '500',
                    color: referralStatus === 'valid' ? '#15803d' : '#dc2626' }}>
                    {referralStatus === 'valid' ? '✓ ' : '✗ '}{referralMsg}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => { setStep(1); setError('') }} style={s.btnGhost}>← Back</button>
            <button type="button" onClick={goToStep3} style={{ ...s.btn, flex: 2 }}
              onMouseOver={e => (e.currentTarget.style.background = '#65a30d')}
              onMouseOut={e => (e.currentTarget.style.background = '#84cc16')}>
              Review Booking →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {step === 3 && (
        <div>
          {/* Booking summary */}
          <div style={s.card}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>Booking Summary</div>
            {[
              { label: 'Date',       value: fDate(date) },
              { label: 'Time',       value: `${fTime(startTime)} – ${fTime(endTime)}` },
              { label: 'Duration',   value: `${duration} hours` },
              ...(selectedPackage ? [{ label: 'Package', value: `📦 ${selectedPackage.package_name}` }] : []),
              { label: 'Shoot type', value: shootType },
              { label: 'Name',       value: name },
              { label: 'WhatsApp',   value: `+91 ${phone}` },
              ...(notes ? [{ label: 'Notes', value: notes }] : []),
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f9fafb', fontSize: '13px' }}>
                <span style={{ color: '#9ca3af', flexShrink: 0, marginRight: '12px' }}>{label}</span>
                <span style={{ fontWeight: '500', color: '#111827', textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div style={s.card}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '10px' }}>
              {selectedPackage ? `📦 Package: ${selectedPackage.package_name}` : 'Price Breakdown'}
            </div>
            {selectedPackage ? (
              <>
                <div style={s.priceRow}><span>Package price ({selectedPackage.duration_hours} hrs)</span><span>{formatINR(pricing.subtotal)}</span></div>
              </>
            ) : (
              <div style={s.priceRow}><span>Studio ({duration} hrs × ₹{studio.price_per_hour.toLocaleString('en-IN')})</span><span>{formatINR(pricing.subtotal)}</span></div>
            )}
            <div style={s.priceRow}><span>Platform fee (10%)</span><span>{formatINR(pricing.platformFee)}</span></div>
            <div style={s.priceRow}><span>GST (18% on fee)</span><span>{formatINR(pricing.gstAmount)}</span></div>
            {pricing.securityDeposit > 0 && (
              <div style={s.priceRow}><span>Security deposit (refundable)</span><span>{formatINR(pricing.securityDeposit)}</span></div>
            )}
            {applyWallet && walletDiscount > 0 && (
              <div style={{ ...s.priceRow, color: '#16a34a', fontWeight: '600' }}>
                <span>💰 Wallet credit applied</span><span>−{formatINR(walletDiscount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: '#111827', borderTop: '2px solid #f3f4f6', marginTop: '8px', paddingTop: '10px' }}>
              <span>Total</span><span style={{ color: '#65a30d' }}>{formatINR(finalTotal)}</span>
            </div>

            {/* Savings line */}
            {selectedPackage?.original_price && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#166534', fontWeight: '600', textAlign: 'center' }}>
                🎉 You save {formatINR(selectedPackage.original_price - selectedPackage.price)} vs standard rate
              </div>
            )}

            {/* Included items */}
            {packageItems.length > 0 && (
              <div style={{ marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>Included</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {packageItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#374151' }}>
                      <span style={{ color: '#84cc16', fontWeight: '700' }}>✓</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Package rules */}
            {selectedPackage?.rules && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af', lineHeight: '1.5' }}>
                📋 Package rules: {selectedPackage.rules}
              </div>
            )}
          </div>

          {/* Wallet toggle */}
          {!walletLoading && walletBalance > 0 && (
            <div style={{ background: '#f0fdf4', border: `1px solid ${applyWallet ? '#84cc16' : '#d1fae5'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>💰 You have {formatINR(walletBalance)} wallet credit</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {applyWallet ? `New total: ${formatINR(finalTotal)}` : 'Apply to this booking?'}
                  </div>
                </div>
                <button type="button" onClick={() => setApplyWallet(v => !v)}
                  style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', background: applyWallet ? '#84cc16' : '#e5e7eb', color: applyWallet ? '#111827' : '#374151' }}>
                  {applyWallet ? 'Applied ✓' : 'Apply'}
                </button>
              </div>
            </div>
          )}

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'flex', gap: '10px', fontSize: '13px', color: '#15803d' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>✅</span>
            <div>
              <strong style={{ display: 'block', marginBottom: '2px' }}>No payment required now</strong>
              Pay only after the studio confirms. You&apos;ll receive a payment link via WhatsApp on +91 {phone}.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => { setStep(2); setError('') }} style={s.btnGhost} disabled={submitting}>← Back</button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              style={{ ...(submitting ? s.btnOff : s.btn), flex: 2 }}
              onMouseOver={e => { if (!submitting) e.currentTarget.style.background = '#65a30d' }}
              onMouseOut={e => { if (!submitting) e.currentTarget.style.background = '#84cc16' }}>
              {submitting
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#333', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                    Sending request…
                  </span>
                : '📩 Send Booking Request'}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
