'use client'
// BookingForm.tsx — simple controlled state, no react-hook-form, no silent failures
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { calculatePricing, formatINR } from '@/lib/pricing'

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

export function BookingForm({ studio, userId }: { studio: Studio; userId: string }) {
  const router = useRouter()

  const [step, setStep]           = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  // Form fields — plain controlled state
  const [date,       setDate]       = useState('')
  const [startTime,  setStartTime]  = useState('')
  const [duration,   setDuration]   = useState(studio.minimum_hours)
  const [name,       setName]       = useState('')
  const [phone,      setPhone]      = useState('')
  const [email,      setEmail]      = useState('')
  const [shootType,  setShootType]  = useState('')
  const [notes,      setNotes]      = useState('')

  // Auto-calculate end time
  function calcEndTime(start: string, hrs: number): string {
    if (!start) return ''
    const [h, m] = start.split(':').map(Number)
    const endH = h + hrs
    if (endH > 23) return '23:59'
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const endTime = calcEndTime(startTime, duration)
  const pricing = calculatePricing(studio.price_per_hour, duration)

  // ── Step 1 validation ────────────────────────────────────────────────────
  function validateStep1(): string {
    if (!date)      return 'Please select a date'
    if (!startTime) return 'Please select a start time'
    const today = new Date().toISOString().split('T')[0]
    if (date < today) return 'Please select a future date'
    return ''
  }

  // ── Step 2 validation ────────────────────────────────────────────────────
  function validateStep2(): string {
    if (!name.trim())              return 'Please enter your full name'
    if (!/^[6-9]\d{9}$/.test(phone)) return 'Enter a valid 10-digit Indian mobile number'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
    if (!shootType)                return 'Please select a shoot type'
    return ''
  }

  function goToStep2() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  function goToStep3() {
    const err = validateStep2()
    if (err) { setError(err); return }
    setError('')
    setStep(3)
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    const payload = {
      studio_id:      studio.id,
      customer_name:  name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || null,
      booking_date:   date,
      start_time:     startTime,
      end_time:       endTime,
      duration_hours: duration,
      shoot_type:     shootType,
      notes:          notes.trim() || null,
      pricing: {
        subtotal:            pricing.subtotal,
        platformFee:         pricing.platformFee,
        gstAmount:           pricing.gstAmount,
        totalAmount:         pricing.totalAmount,
        securityDeposit:     pricing.securityDeposit,
        studioPayout:        pricing.studioPayout,
      },
    }

    console.log('Submitting booking:', payload)

    try {
      const res = await fetch('/api/bookings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })

      const result = await res.json()
      console.log('API response:', res.status, result)

      if (!res.ok) {
        throw new Error(result.error || `Server error (${res.status})`)
      }

      // Success — redirect to booking status page
      router.push(`/bookings/${result.booking_id}`)

    } catch (err: any) {
      console.error('Booking submit error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Shared styles ────────────────────────────────────────────────────────
  const s = {
    wrap:    { fontFamily: 'system-ui,sans-serif', maxWidth: '560px', margin: '0 auto' } as React.CSSProperties,
    card:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '16px' } as React.CSSProperties,
    label:   { display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: '6px' },
    input:   { width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, transition: 'border-color .15s' },
    select:  { width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, background: '#fff', appearance: 'none' as const },
    btn:     { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', fontFamily: 'inherit', background: '#f07020', color: '#fff', transition: 'background .15s' } as React.CSSProperties,
    btnGhost:{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '14px', fontWeight: '500', fontFamily: 'inherit', background: '#fff', color: '#374151' } as React.CSSProperties,
    btnOff:  { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '600', fontFamily: 'inherit', background: '#ffd0b5', color: '#fff', cursor: 'not-allowed' } as React.CSSProperties,
    row2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } as React.CSSProperties,
    field:   { marginBottom: '14px' } as React.CSSProperties,
    errBox:  { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '11px 14px', color: '#dc2626', fontSize: '13px', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' } as React.CSSProperties,
    priceRow:{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', padding: '5px 0' } as React.CSSProperties,
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

  // ── Step Indicator ───────────────────────────────────────────────────────
  const steps = ['Date & Time', 'Your Details', 'Review & Send']

  return (
    <div style={s.wrap}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        {steps.map((label, i) => {
          const n = i + 1
          const done   = n < step
          const active = n === step
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700',
                  background: done ? '#22c55e' : active ? '#f07020' : '#f3f4f6',
                  color: done || active ? '#fff' : '#9ca3af',
                  border: `2px solid ${done ? '#22c55e' : active ? '#f07020' : '#e5e7eb'}` }}>
                  {done ? '✓' : n}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '500', color: active ? '#f07020' : done ? '#22c55e' : '#9ca3af', display: 'none', whiteSpace: 'nowrap' }}
                  className="sm:block">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: done ? '#86efac' : '#f3f4f6', margin: '0 8px' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div style={s.errBox}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Studio strip */}
      <div style={{ background: '#fff8f5', border: '1px solid #fed7aa', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>📸</span>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{studio.studio_name}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{studio.area} · ₹{studio.price_per_hour.toLocaleString('en-IN')}/hr</div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STEP 1 — Date & Time
      ══════════════════════════════════════════ */}
      {step === 1 && (
        <div style={s.card}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', margin: '0 0 18px' }}>Pick date & time</h2>

          <div style={s.field}>
            <label style={s.label}>Booking date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={s.input}
              onFocus={e => e.target.style.borderColor = '#f07020'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <div style={{ ...s.row2, marginBottom: '14px' }}>
            <div>
              <label style={s.label}>Start time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                min={studio.opening_time} max={studio.closing_time}
                style={s.input}
                onFocus={e => e.target.style.borderColor = '#f07020'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={s.label}>End time</label>
              <input type="time" value={endTime} readOnly
                style={{ ...s.input, background: '#f9fafb', color: endTime ? '#374151' : '#9ca3af' }} />
            </div>
          </div>

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

          {startTime && date && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#15803d', marginBottom: '14px' }}>
              ✅ {fDate(date)} · {fTime(startTime)} – {fTime(endTime)}
            </div>
          )}

          <button type="button" onClick={goToStep2}
            style={s.btn}
            onMouseOver={e => (e.currentTarget.style.background = '#d05010')}
            onMouseOut={e => (e.currentTarget.style.background = '#f07020')}>
            Continue → Your Details
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          STEP 2 — Customer Details
      ══════════════════════════════════════════ */}
      {step === 2 && (
        <div style={s.card}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', margin: '0 0 18px' }}>Your details</h2>

          <div style={s.field}>
            <label style={s.label}>Full name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Arjun Sharma" autoFocus style={s.input}
              onFocus={e => e.target.style.borderColor = '#f07020'}
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
                onFocus={e => e.target.style.borderColor = '#f07020'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Payment link &amp; updates will be sent to this WhatsApp number</div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Email (optional)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="arjun@email.com" style={s.input}
              onFocus={e => e.target.style.borderColor = '#f07020'}
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
              placeholder="e.g. Team of 4, need 3 backdrop changes, bringing own camera…"
              style={{ ...s.input, resize: 'none', lineHeight: '1.5' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => { setStep(1); setError('') }} style={s.btnGhost}>
              ← Back
            </button>
            <button type="button" onClick={goToStep3}
              style={{ ...s.btn, flex: 2 }}
              onMouseOver={e => (e.currentTarget.style.background = '#d05010')}
              onMouseOut={e => (e.currentTarget.style.background = '#f07020')}>
              Review Booking →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          STEP 3 — Review & Submit
      ══════════════════════════════════════════ */}
      {step === 3 && (
        <div>
          {/* Booking summary */}
          <div style={s.card}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>Booking Summary</div>
            {[
              { label: 'Date',       value: fDate(date) },
              { label: 'Time',       value: `${fTime(startTime)} – ${fTime(endTime)}` },
              { label: 'Duration',   value: `${duration} hours` },
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
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '10px' }}>Price Breakdown</div>
            <div style={s.priceRow}><span>Studio ({duration} hrs × ₹{studio.price_per_hour.toLocaleString('en-IN')})</span><span>{formatINR(pricing.subtotal)}</span></div>
            <div style={s.priceRow}><span>Platform fee (10%)</span><span>{formatINR(pricing.platformFee)}</span></div>
            <div style={s.priceRow}><span>GST (18% on fee)</span><span>{formatINR(pricing.gstAmount)}</span></div>
            {pricing.securityDeposit > 0 && (
              <div style={s.priceRow}><span>Security deposit (refundable)</span><span>{formatINR(pricing.securityDeposit)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: '#111827', borderTop: '2px solid #f3f4f6', marginTop: '8px', paddingTop: '10px' }}>
              <span>Total</span><span style={{ color: '#f07020' }}>{formatINR(pricing.totalAmount)}</span>
            </div>
          </div>

          {/* No payment note */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'flex', gap: '10px', fontSize: '13px', color: '#15803d' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>✅</span>
            <div>
              <strong style={{ display: 'block', marginBottom: '2px' }}>No payment required now</strong>
              Pay only after the studio confirms. You&apos;ll receive a payment link via WhatsApp on +91 {phone}.
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => { setStep(2); setError('') }} style={s.btnGhost} disabled={submitting}>
              ← Back
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              style={{ ...(submitting ? s.btnOff : s.btn), flex: 2 }}
              onMouseOver={e => { if (!submitting) e.currentTarget.style.background = '#d05010' }}
              onMouseOut={e => { if (!submitting) e.currentTarget.style.background = '#f07020' }}>
              {submitting
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
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
