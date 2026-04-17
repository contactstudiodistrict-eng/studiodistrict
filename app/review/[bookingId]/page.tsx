'use client'
// app/review/[bookingId]/page.tsx — no-auth review page via token link
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

type UIState = 'loading' | 'invalid' | 'already_reviewed' | 'form' | 'success'

interface BookingInfo {
  studioName: string
  area: string
  bookingDate: string
  timeRange: string
  shootType: string
}

export default function ReviewPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const bookingId    = params.bookingId as string
  const token        = searchParams.get('token') || ''

  const [ui, setUi]         = useState<UIState>('loading')
  const [info, setInfo]     = useState<BookingInfo | null>(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover]   = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!token) { setUi('invalid'); return }

    fetch(`/api/review/${bookingId}?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error)           { setUi('invalid'); return }
        if (d.alreadyReviewed) { setUi('already_reviewed'); return }
        setInfo(d)
        setUi('form')
      })
      .catch(() => setUi('invalid'))
  }, [bookingId, token])

  async function submitReview() {
    if (rating === 0) { setError('Please select a star rating'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/review/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      setUi('success')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4, #fff, #f7fee7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
  }

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    padding: '28px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (ui === 'loading') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #d9f99d', borderTopColor: '#84cc16', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontSize: '14px' }}>Loading…</p>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  // ── Invalid ──────────────────────────────────────────────────────────────
  if (ui === 'invalid') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Invalid or expired link</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>This review link is no longer valid.</p>
            <a href="/" style={{ display: 'inline-block', padding: '12px 24px', background: '#84cc16', color: '#111827', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              Back to Studio District
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Already reviewed ─────────────────────────────────────────────────────
  if (ui === 'already_reviewed') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Already reviewed!</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>You&apos;ve already submitted a review. Thank you!</p>
            <a href="/" style={{ display: 'inline-block', padding: '12px 24px', background: '#84cc16', color: '#111827', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              Back to Studio District
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (ui === 'success') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Thank you!</h1>
            <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.6', marginBottom: '8px' }}>
              Your review has been posted.
            </p>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
              Your feedback helps Chennai creators find the best studios.
            </p>
            <a href="/" style={{ display: 'inline-block', padding: '13px 28px', background: '#84cc16', color: '#111827', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              Browse Studios →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Review form ──────────────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <a href="/" style={{ fontFamily: 'system-ui', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.03em', textDecoration: 'none' }}>
            <span style={{ color: '#0f172a' }}>Studio</span><span style={{ color: '#84cc16' }}>District</span>
          </a>
        </div>

        {/* Studio info */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>
            How was your shoot at<br />{info?.studioName}?
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {info?.bookingDate} · {info?.timeRange}
          </p>
        </div>

        {/* Star rating */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseOver={() => setHover(star)}
              onMouseOut={() => setHover(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '36px', lineHeight: 1, transition: 'transform .1s', transform: (hover || rating) >= star ? 'scale(1.15)' : 'scale(1)' }}
            >
              <span style={{ color: (hover || rating) >= star ? '#84cc16' : '#d1d5db' }}>★</span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#84cc16', fontWeight: '600', marginTop: '-16px', marginBottom: '16px' }}>
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
          </p>
        )}

        {/* Comment */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: '6px' }}>
            Tell others about your experience (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            placeholder="What did you love? Anything to improve?"
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, resize: 'none', lineHeight: '1.5' }}
            onFocus={e => (e.target.style.borderColor = '#84cc16')}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submitReview}
          disabled={submitting || rating === 0}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            cursor: (submitting || rating === 0) ? 'not-allowed' : 'pointer',
            fontSize: '15px', fontWeight: '700', fontFamily: 'inherit',
            background: (submitting || rating === 0) ? '#d9f99d' : '#84cc16',
            color: '#111827',
            transition: 'background .15s',
          }}
          onMouseOver={e => { if (!submitting && rating > 0) e.currentTarget.style.background = '#65a30d' }}
          onMouseOut={e => { if (!submitting && rating > 0) e.currentTarget.style.background = '#84cc16' }}
        >
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
