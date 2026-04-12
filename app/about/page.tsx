// app/about/page.tsx
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteFooter } from '@/components/shared/SiteFooter'

export const metadata: Metadata = {
  title: 'About Us',
  description: "Chennai's first dedicated studio booking marketplace — connecting creators with professional studio spaces.",
}

const S = {
  page:    { background: '#f9fafb', minHeight: '100vh', fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif' } as React.CSSProperties,
  hero:    { background: '#0f172a', padding: '56px 20px 52px', textAlign: 'center' as const },
  body:    { maxWidth: '720px', margin: '0 auto', padding: '0 20px' },
  section: { padding: '48px 0', borderBottom: '1px solid #e2e8f0' } as React.CSSProperties,
  h1:      { fontSize: 'clamp(26px,5vw,36px)', fontWeight: '700', color: '#fff', letterSpacing: '-0.03em', margin: '0 0 14px' } as React.CSSProperties,
  sub:     { fontSize: '16px', color: '#94a3b8', lineHeight: '1.7', margin: 0, maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' } as React.CSSProperties,
  h2:      { fontSize: '20px', fontWeight: '600', color: '#111827', letterSpacing: '-0.02em', margin: '0 0 16px', paddingLeft: '12px', borderLeft: '3px solid #84cc16' } as React.CSSProperties,
  p:       { fontSize: '15px', color: '#374151', lineHeight: '1.8', margin: '0 0 14px' } as React.CSSProperties,
  tag:     { display: 'inline-block', fontSize: '12px', fontWeight: '600', color: '#84cc16', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '12px' },
}

export default function AboutPage() {
  return (
    <div style={S.page}>
      <SiteHeader />

      {/* Hero */}
      <div style={S.hero}>
        <span style={S.tag}>About Studio District</span>
        <h1 style={S.h1}>The studio you need.<br />The city you know.</h1>
        <p style={S.sub}>
          Studio District connects Chennai&apos;s creators with professional studio spaces — instantly.
        </p>
      </div>

      <div style={S.body}>

        {/* Who we are */}
        <div style={S.section}>
          <h2 style={S.h2}>Who we are</h2>
          <p style={S.p}>
            Studio District is Chennai&apos;s first dedicated studio booking marketplace — connecting
            photographers, filmmakers, podcasters, musicians, and content creators with professional
            studio spaces across the city.
          </p>
          <p style={S.p}>
            We started Studio District because finding a great studio in Chennai was harder than it
            should be. WhatsApp groups, cold calls, word of mouth — no transparency on pricing, no
            instant availability, no easy way to compare spaces. We built the platform we wished existed.
          </p>
          <p style={{ ...S.p, margin: 0 }}>
            Today, Studio District lists photography studios, video production spaces, podcast booths,
            music recording studios, and multi-use creative spaces across Velachery, OMR, Anna Nagar,
            T.Nagar, Adyar, and beyond.
          </p>
        </div>

        {/* How it works */}
        <div style={S.section}>
          <h2 style={S.h2}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '8px' }}>
            {[
              { step: '01', title: 'Browse', body: 'Discover verified studios with real photos, amenities, and transparent pricing.' },
              { step: '02', title: 'Book', body: 'Select your date and time. Studio confirms within 30 minutes via WhatsApp.' },
              { step: '03', title: 'Create', body: 'Pay securely after confirmation. Your slot is locked. Studio contact shared instantly.' },
            ].map(({ step, title, body }) => (
              <div key={step} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#84cc16', letterSpacing: '0.1em', marginBottom: '8px' }}>STEP {step}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>{title}</div>
                <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Business info */}
        <div style={S.section}>
          <h2 style={S.h2}>Business information</h2>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
            {[
              { label: 'Business type',   value: 'Online marketplace for studio space rental services' },
              { label: 'Location',        value: 'Chennai, Tamil Nadu, India' },
              { label: 'Platform fee',    value: '10% per booking (deducted from studio payout)' },
              { label: 'Payment',         value: 'Secured via Razorpay' },
              { label: 'Notifications',   value: 'Via WhatsApp (Twilio)' },
              { label: 'Contact',         value: 'hello@studiodistrict.in' },
            ].map(({ label, value }, i) => (
              <div key={label} style={{ display: 'flex', padding: '13px 18px', borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none', gap: '16px', flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', minWidth: '140px', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: '13px', color: '#111827' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '48px 0 56px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Ready to book your studio?
          </div>
          <a href="/"
            style={{ display: 'inline-block', padding: '14px 32px', background: '#84cc16', color: '#fff', fontWeight: '700', fontSize: '15px', borderRadius: '12px', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Browse Studios →
          </a>
        </div>

      </div>

      <SiteFooter />
    </div>
  )
}
