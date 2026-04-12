// app/refund-policy/page.tsx
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteFooter } from '@/components/shared/SiteFooter'

export const metadata: Metadata = {
  title: 'Booking & Refund Policy',
  description: 'Cancellation, refund, and booking modification policy for Studio District.',
}

const S = {
  page:    { background: '#f9fafb', minHeight: '100vh', fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif' } as React.CSSProperties,
  hero:    { background: '#0f172a', padding: '48px 20px 44px', textAlign: 'center' as const },
  body:    { maxWidth: '720px', margin: '0 auto', padding: '0 20px' },
  section: { padding: '40px 0', borderBottom: '1px solid #e2e8f0' } as React.CSSProperties,
  h1:      { fontSize: 'clamp(24px,5vw,32px)', fontWeight: '700', color: '#fff', letterSpacing: '-0.03em', margin: '0 0 10px' } as React.CSSProperties,
  meta:    { fontSize: '13px', color: '#64748b', margin: 0 } as React.CSSProperties,
  h2:      { fontSize: '18px', fontWeight: '600', color: '#111827', letterSpacing: '-0.02em', margin: '0 0 14px', paddingLeft: '12px', borderLeft: '3px solid #84cc16' } as React.CSSProperties,
  p:       { fontSize: '15px', color: '#374151', lineHeight: '1.8', margin: '0 0 12px' } as React.CSSProperties,
  li:      { fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '6px' } as React.CSSProperties,
  tag:     { display: 'inline-block', fontSize: '12px', fontWeight: '600', color: '#84cc16', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '10px' },
}

export default function RefundPolicyPage() {
  return (
    <div style={S.page}>
      <SiteHeader />

      {/* Hero */}
      <div style={S.hero}>
        <span style={S.tag}>Legal</span>
        <h1 style={S.h1}>Booking & Refund Policy</h1>
        <p style={S.meta}>Last updated: April 2025</p>
      </div>

      <div style={S.body}>

        {/* Important notice */}
        <div style={{ margin: '32px 0 0', background: '#f0fdf4', border: '1px solid #84cc16', borderRadius: '12px', padding: '16px 18px' }}>
          <p style={{ ...S.p, margin: 0, color: '#166534' }}>
            <strong>Note:</strong> Studio District is a studio rental marketplace. We do not sell or ship physical
            products. This policy covers studio booking cancellations and refunds.
          </p>
        </div>

        {/* How booking works */}
        <div style={S.section}>
          <h2 style={S.h2}>1. How booking works</h2>
          <ol style={{ paddingLeft: '20px', margin: 0 }}>
            {[
              'Submit a booking request — no payment is taken at this stage',
              'The studio confirms within 30–60 minutes via WhatsApp',
              'You receive a Razorpay payment link after confirmation',
              'Your slot is locked only after payment is successfully completed',
            ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
          </ol>
        </div>

        {/* Cancellation by customer */}
        <div style={S.section}>
          <h2 style={S.h2}>2. Cancellation by you (customer)</h2>
          <div style={{ overflowX: 'auto' as const, marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' as const, fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>When you cancel</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' as const, fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Refund</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { when: 'Before studio confirms',        refund: '100% — no charge',     highlight: true },
                  { when: '48+ hours before booking',      refund: '100% refund',           highlight: false },
                  { when: '24–48 hours before booking',    refund: '50% refund',            highlight: false },
                  { when: 'Less than 24 hours before',     refund: 'No refund',             highlight: false },
                ].map(({ when, refund, highlight }, i) => (
                  <tr key={i} style={{ background: highlight ? '#f0fdf4' : '#fff', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{when}</td>
                    <td style={{ padding: '12px 16px', fontWeight: highlight ? '600' : '400', color: highlight ? '#166534' : '#374151' }}>{refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...S.p, margin: 0, fontSize: '13px', color: '#64748b' }}>
            Note: Cancellation policy may vary per studio — check the studio listing before booking.
          </p>
        </div>

        {/* Cancellation by studio */}
        <div style={S.section}>
          <h2 style={S.h2}>3. Cancellation by studio</h2>
          <p style={S.p}>
            If a studio cancels a confirmed and paid booking, you will receive a{' '}
            <strong>100% full refund</strong> within 5–7 business days to your original payment method.
          </p>
          <p style={{ ...S.p, margin: 0 }}>
            We will also proactively reach out to help you find a suitable alternative studio.
          </p>
        </div>

        {/* No-show */}
        <div style={S.section}>
          <h2 style={S.h2}>4. No-show policy</h2>
          <p style={{ ...S.p, margin: 0 }}>
            If you do not attend a confirmed, paid booking without prior cancellation, no refund will be issued.
          </p>
        </div>

        {/* Security deposit */}
        <div style={S.section}>
          <h2 style={S.h2}>5. Security deposit</h2>
          <p style={S.p}>
            A refundable security deposit of <strong>₹1,200</strong> is collected per booking.
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {[
              'Released automatically within 2 hours after the booking ends (if no damage reported).',
              'If a damage claim is raised by the studio, the deposit is held pending dispute resolution — resolved within 48–72 hours.',
            ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
          </ul>
        </div>

        {/* Refund timeline */}
        <div style={S.section}>
          <h2 style={S.h2}>6. Refund timeline</h2>
          <p style={{ ...S.p, margin: 0 }}>
            All approved refunds are processed within <strong>5–7 business days</strong> to the original payment method via Razorpay.
          </p>
        </div>

        {/* How to cancel */}
        <div style={S.section}>
          <h2 style={S.h2}>7. How to cancel</h2>
          <p style={S.p}>
            <strong>Via app:</strong> Login → My Bookings → Select the booking → Cancel booking
          </p>
          <p style={{ ...S.p, margin: 0 }}>
            <strong>Via email:</strong> Send your booking reference to{' '}
            <a href="mailto:bookings@studiodistrict.in" style={{ color: '#65a30d', fontWeight: '600' }}>bookings@studiodistrict.in</a>
          </p>
        </div>

        {/* Contact */}
        <div style={{ padding: '40px 0 56px' }}>
          <h2 style={S.h2}>8. Disputes & contact</h2>
          <p style={S.p}>
            For booking disputes or refund queries, contact{' '}
            <a href="mailto:support@studiodistrict.in" style={{ color: '#65a30d', fontWeight: '600' }}>support@studiodistrict.in</a>
          </p>
          <PolicyLinks current="/refund-policy" />
        </div>

      </div>

      <SiteFooter />
    </div>
  )
}

function PolicyLinks({ current }: { current: string }) {
  const links = [
    { href: '/about', label: 'About Us' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/privacy', label: 'Privacy Policy' },
  ]
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
      {links.filter(l => l.href !== current).map(({ href, label }) => (
        <a key={href} href={href}
          style={{ padding: '6px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>
          {label}
        </a>
      ))}
    </div>
  )
}
