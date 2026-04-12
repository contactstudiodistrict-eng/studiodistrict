'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatINR } from '@/lib/pricing'

const STATUS_CONFIG: Record<string, {
  label: string; icon: string
  colorBg: string; colorBorder: string; colorText: string; description: string
}> = {
  pending: {
    label: 'Awaiting Studio Confirmation', icon: '⏳',
    colorBg: '#fffbeb', colorBorder: '#fde68a', colorText: '#92400e',
    description: 'Your request has been sent to the studio owner via WhatsApp. They typically respond within 30 minutes.',
  },
  confirmed: {
    label: 'Studio Confirmed — Pay to Lock', icon: '✅',
    colorBg: '#f0fdf4', colorBorder: '#bbf7d0', colorText: '#14532d',
    description: 'The studio confirmed your slot! A payment link has been sent to your WhatsApp. Complete payment to lock your booking.',
  },
  awaiting_payment: {
    label: 'Payment Pending', icon: '💳',
    colorBg: '#eff6ff', colorBorder: '#bfdbfe', colorText: '#1e3a5f',
    description: 'Payment link sent to your WhatsApp. Pay now to lock your slot — link expires in 30 minutes.',
  },
  paid: {
    label: 'Booking Confirmed & Paid 🎉', icon: '🎉',
    colorBg: '#f0fdf4', colorBorder: '#86efac', colorText: '#14532d',
    description: 'Your slot is locked! Studio address and contact details have been sent to your WhatsApp.',
  },
  completed: {
    label: 'Booking Completed', icon: '⭐',
    colorBg: '#faf5ff', colorBorder: '#d8b4fe', colorText: '#4c1d95',
    description: 'Your booking is complete. We hope you had a great shoot!',
  },
  declined: {
    label: 'Booking Declined', icon: '❌',
    colorBg: '#fef2f2', colorBorder: '#fecaca', colorText: '#7f1d1d',
    description: 'The studio has declined this request. No payment was taken. Try another studio.',
  },
  cancelled: {
    label: 'Booking Cancelled', icon: '🚫',
    colorBg: '#f9fafb', colorBorder: '#e5e7eb', colorText: '#374151',
    description: 'This booking has been cancelled.',
  },
}

const LIFECYCLE = [
  { key: 'pending',          label: 'Request sent',        field: 'created_at' },
  { key: 'awaiting_payment', label: 'Studio confirmed',     field: 'confirmed_at' },
  { key: 'paid',             label: 'Payment received',     field: 'paid_at' },
  { key: 'completed',        label: 'Booking complete',     field: 'completed_at' },
]

const CONTACT_VISIBLE = ['paid', 'completed']

export function BookingStatusCard({ booking: initial }: { booking: any }) {
  const [booking, setBooking] = useState(initial)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  const studio  = booking.studios
  const cfg     = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
  const showContact = CONTACT_VISIBLE.includes(booking.status)
  const currentStepIdx = LIFECYCLE.findIndex(s => s.key === booking.status)

  // ── Supabase Realtime subscription ──────────────────────────────────────
  useEffect(() => {
    console.log('[Realtime] Subscribing to booking:', booking.id)

    const channel = supabase
      .channel(`booking_updates_${booking.id}`, {
        config: { broadcast: { self: true } }
      })
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'bookings',
          filter: `id=eq.${booking.id}`,
        },
        (payload) => {
          console.log('[Realtime] UPDATE received:', payload.new)
          setBooking((prev: any) => ({ ...prev, ...payload.new }))
          setLastUpdated(new Date())
        }
      )
      .subscribe((status, err) => {
        console.log('[Realtime] Subscription status:', status, err || '')
      })

    channelRef.current = channel

    // Also poll every 10 seconds as fallback (in case realtime drops)
    const poll = setInterval(async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('status, confirmed_at, paid_at, completed_at, wa_payment_sent_at, studio_wa_response')
        .eq('id', booking.id)
        .single()
      if (!error && data && data.status !== booking.status) {
        console.log('[Poll] Status changed:', booking.status, '→', data.status)
        setBooking((prev: any) => ({ ...prev, ...data }))
        setLastUpdated(new Date())
      }
    }, 10000)

    return () => {
      console.log('[Realtime] Unsubscribing')
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [booking.id])

  function fDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  function fTime(t: string) {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  const c: Record<string, React.CSSProperties> = {
    card:   { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden', marginBottom: '12px', fontFamily: 'system-ui,sans-serif' },
    row:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', fontSize: '13px', borderBottom: '1px solid #f9fafb' },
    prRow:  { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', padding: '4px 0' },
  }

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif' }}>

      {/* ── Status banner ── */}
      <div style={{ background: cfg.colorBg, border: `1px solid ${cfg.colorBorder}`, borderRadius: '14px', padding: '18px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '30px' }}>{cfg.icon}</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: cfg.colorText }}>{cfg.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{booking.booking_ref}</div>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: cfg.colorText, opacity: 0.85, lineHeight: '1.6', margin: 0 }}>{cfg.description}</p>
        {lastUpdated && (
          <div style={{ fontSize: '11px', color: cfg.colorText, opacity: 0.6, marginTop: '8px' }}>
            Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
          </div>
        )}
      </div>

      {/* ── Live indicator ── */}
      {['pending', 'awaiting_payment'].includes(booking.status) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '12px', color: '#15803d', marginBottom: '12px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          Page is live — updates automatically when studio responds
        </div>
      )}

      {/* ── Pay now CTA ── */}
      {booking.status === 'awaiting_payment' && (
        <a href={`/bookings/${booking.id}/pay`}
          style={{ display: 'block', padding: '15px', borderRadius: '12px', background: '#84cc16', color: '#fff', textAlign: 'center', textDecoration: 'none', fontWeight: '700', fontSize: '15px', marginBottom: '12px', boxSizing: 'border-box' }}>
          💳 Pay Now to Lock Your Slot →
        </a>
      )}

      {/* ── Booking details ── */}
      <div style={c.card}>
        <div style={{ background: '#f9fafb', padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '20px' }}>📸</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{studio.studio_name}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{studio.area}</div>
          </div>
        </div>
        <div style={{ padding: '6px 16px 12px' }}>
          {[
            { label: 'Date',       value: fDate(booking.booking_date) },
            { label: 'Time',       value: `${fTime(booking.start_time)} – ${fTime(booking.end_time)}` },
            { label: 'Duration',   value: `${booking.duration_hours} hours` },
            { label: 'Shoot type', value: booking.shoot_type },
            ...(booking.notes ? [{ label: 'Notes', value: booking.notes }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={c.row}>
              <span style={{ color: '#9ca3af', flexShrink: 0, marginRight: '12px', minWidth: '80px' }}>{label}</span>
              <span style={{ fontWeight: '500', color: '#111827', textAlign: 'right' }}>{value}</span>
            </div>
          ))}

          {/* Contact — hidden until paid */}
          {showContact ? (
            <div style={{ marginTop: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>
                📍 Studio Contact Details
              </div>
              <div style={{ fontSize: '13px', color: '#166534', lineHeight: '2' }}>
                <div><strong>Address:</strong> {studio.address}</div>
                {studio.owner_phone && (
                  <div>
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:+91${studio.owner_phone}`} style={{ color: '#15803d' }}>+91 {studio.owner_phone}</a>
                    {'  '}
                    <a href={`https://wa.me/91${studio.owner_phone}`} target="_blank" rel="noopener noreferrer"
                      style={{ background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', textDecoration: 'none', fontWeight: '600' }}>
                      WhatsApp
                    </a>
                  </div>
                )}
                {studio.google_maps_link && (
                  <div>
                    <a href={studio.google_maps_link} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#1d4ed8', fontWeight: '600' }}>📌 Open in Google Maps ↗</a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>🔒</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '3px' }}>Studio contact hidden until payment</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>
                  Full address, phone, and directions will be sent to your WhatsApp after payment is confirmed.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Pricing ── */}
      <div style={c.card}>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '10px' }}>
            Payment Summary
          </div>
          <div style={c.prRow}><span>Studio charges</span><span>{formatINR(booking.subtotal)}</span></div>
          <div style={c.prRow}><span>Platform fee</span><span>{formatINR(booking.platform_fee)}</span></div>
          <div style={c.prRow}><span>GST</span><span>{formatINR(booking.gst_amount)}</span></div>
          {booking.security_deposit > 0 && (
            <div style={c.prRow}><span>Security deposit (refundable)</span><span>{formatINR(booking.security_deposit)}</span></div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: '#0f172a', borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '10px' }}>
            <span>Total</span><span style={{ color: '#65a30d' }}>{formatINR(booking.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div style={c.card}>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '14px' }}>
            Booking Timeline
          </div>
          {LIFECYCLE.map((s, i) => {
            const done   = i <= currentStepIdx && !['declined','cancelled'].includes(booking.status)
            const active = i === currentStepIdx + 1 && !['declined','cancelled'].includes(booking.status)
            const dateVal = booking[s.field]
            return (
              <div key={s.key} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0,
                    background: done ? '#22c55e' : active ? '#84cc16' : '#f3f4f6',
                    color: done || active ? '#fff' : '#9ca3af' }}>
                    {done ? '✓' : i + 1}
                  </div>
                  {i < LIFECYCLE.length - 1 && (
                    <div style={{ width: '2px', height: '28px', background: done ? '#86efac' : '#f3f4f6', margin: '3px 0' }} />
                  )}
                </div>
                <div style={{ paddingBottom: '4px', flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '1px',
                    color: done ? '#15803d' : active ? '#65a30d' : '#9ca3af' }}>
                    {s.label}
                    {active && <span style={{ marginLeft: '6px', fontSize: '10px', animation: 'blink 1s infinite' }}>⏳</span>}
                  </div>
                  {dateVal && (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(dateVal).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {booking.status === 'declined' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✕</div>
              <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>Declined by studio</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      {['pending','confirmed','awaiting_payment'].includes(booking.status) && (
        <button
          onClick={async () => {
            if (!confirm('Cancel this booking?')) return
            const res = await fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' })
            if (res.ok) setBooking((prev: any) => ({ ...prev, status: 'cancelled' }))
          }}
          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px', boxSizing: 'border-box' }}>
          Cancel booking
        </button>
      )}

      {['paid','completed','declined','cancelled'].includes(booking.status) && (
        <a href="/" style={{ display: 'block', width: '100%', padding: '13px', borderRadius: '10px', background: '#84cc16', color: '#fff', textAlign: 'center', textDecoration: 'none', fontWeight: '700', fontSize: '14px', boxSizing: 'border-box' }}>
          Browse more studios →
        </a>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(0.9)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}
