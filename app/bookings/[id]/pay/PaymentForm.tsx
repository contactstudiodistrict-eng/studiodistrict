'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

interface Props {
  bookingId: string
  bookingRef: string
  studioName: string
  studioArea: string
  bookingDate: string
  timeRange: string
  shootType: string
  subtotal: number
  platformFee: number
  gstAmount: number
  securityDeposit: number
  totalAmount: number
  customerName: string
  customerPhone: string
  customerEmail: string | null
  orderId: string
  orderAmount: number   // paise
  razorpayKeyId: string
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

export function PaymentForm(props: Props) {
  const router = useRouter()
  const [scriptReady, setScriptReady] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openCheckout() {
    if (!scriptReady || paying) return
    setPaying(true)
    setError(null)

    const options = {
      key:         props.razorpayKeyId,
      amount:      props.orderAmount,
      currency:    'INR',
      name:        'StudioDistrict',
      description: `${props.studioName} · ${props.bookingRef}`,
      order_id:    props.orderId,
      prefill: {
        name:    props.customerName,
        contact: props.customerPhone.startsWith('+91') ? props.customerPhone : `+91${props.customerPhone}`,
        email:   props.customerEmail || '',
      },
      theme: { color: '#84cc16' },
      modal: {
        ondismiss: () => { setPaying(false) },
      },
      handler: async (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => {
        try {
          const res = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              booking_id:          props.bookingId,
            }),
          })
          if (res.ok) {
            router.push(`/bookings/${props.bookingId}`)
          } else {
            const data = await res.json()
            setError(data.error || 'Payment verification failed. Please contact support.')
            setPaying(false)
          }
        } catch {
          setError('Network error. Please contact support with your payment ID.')
          setPaying(false)
        }
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.on('payment.failed', (resp: any) => {
      setError(`Payment failed: ${resp.error?.description || 'Unknown error'}`)
      setPaying(false)
    })
    rzp.open()
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
      />

      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ background: '#0f172a', padding: '20px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em', marginBottom: 4 }}>
              <span style={{ color: '#fff' }}>Studio</span><span style={{ color: '#a3e635' }}>District</span>
            </div>
            <div style={{ color: '#64748b', fontSize: 13 }}>Secure payment</div>
          </div>

          <div style={{ padding: 24 }}>
            {/* Booking summary */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Booking</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{props.studioName}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{props.studioArea} · {props.bookingDate}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{props.timeRange} · {props.shootType}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', marginTop: 4 }}>{props.bookingRef}</div>
            </div>

            {/* Breakdown */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginBottom: 20 }}>
              {[
                { label: 'Studio charges', value: fmt(props.subtotal) },
                { label: 'Platform fee (10%)', value: fmt(props.platformFee) },
                { label: 'GST (18% on fee)', value: fmt(props.gstAmount) },
                ...(props.securityDeposit > 0 ? [{ label: 'Refundable deposit', value: fmt(props.securityDeposit) }] : []),
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: '#6b7280' }}>{row.label}</span>
                  <span style={{ color: '#374151' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 4 }}>
                <span style={{ color: '#111827' }}>Total</span>
                <span style={{ color: '#16a34a' }}>{fmt(props.totalAmount)}</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={openCheckout}
              disabled={!scriptReady || paying}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: scriptReady && !paying ? '#84cc16' : '#e5e7eb',
                color: scriptReady && !paying ? '#111827' : '#9ca3af',
                fontWeight: 700, fontSize: 15, cursor: scriptReady && !paying ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
            >
              {paying ? 'Opening payment…' : !scriptReady ? 'Loading…' : `Pay ${fmt(props.totalAmount)} →`}
            </button>

            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
              🔒 Secured by Razorpay · UPI, cards, netbanking accepted
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
