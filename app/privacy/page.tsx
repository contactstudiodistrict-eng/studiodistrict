// app/privacy/page.tsx
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteFooter } from '@/components/shared/SiteFooter'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Studio District collects, uses, and protects your personal data.',
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

export default function PrivacyPage() {
  return (
    <div style={S.page}>
      <SiteHeader />

      {/* Hero */}
      <div style={S.hero}>
        <span style={S.tag}>Legal</span>
        <h1 style={S.h1}>Privacy Policy</h1>
        <p style={S.meta}>Effective date: April 2025</p>
      </div>

      <div style={S.body}>

        <div style={S.section}>
          <h2 style={S.h2}>1. Introduction</h2>
          <p style={S.p}>
            Studio District (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your personal information.
            This policy explains what data we collect, how we use it, and your rights under Indian law.
          </p>
          <p style={{ ...S.p, margin: 0 }}>
            By using Studio District, you agree to the collection and use of information as described in this policy.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>2. What we collect</h2>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {[
              'Name, email address, and phone number (account creation / booking)',
              'Booking details: date, time, shoot type, notes',
              'Payment information (processed by Razorpay — we never store card details)',
              'WhatsApp communication logs for booking confirmations',
              'Usage data (pages visited, search queries) to improve the platform',
            ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>3. How we use it</h2>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {[
              'Process and confirm bookings',
              'Send confirmations and updates via WhatsApp and email',
              'Send payment links and GST receipts',
              'Resolve disputes between customers and studio owners',
              'Improve platform features and personalise experience',
              'Comply with Indian tax laws (GST invoicing and records)',
            ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>4. Who we share it with</h2>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            {[
              'Studio owners: receive your name, phone, and booking details on confirmation',
              'Razorpay: for secure payment processing',
              'Twilio: for WhatsApp message delivery',
            ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
          </ul>
          <div style={{ background: '#f0fdf4', border: '1px solid #84cc16', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ ...S.p, margin: 0, color: '#166534', fontWeight: '600' }}>
              We do not sell your data to any third party, ever.
            </p>
          </div>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>5. Data retention</h2>
          <p style={S.p}>
            Booking records are retained for 7 years as required by Indian GST regulations.
          </p>
          <p style={{ ...S.p, margin: 0 }}>
            Account data is retained until you request deletion.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>6. Your rights</h2>
          <p style={S.p}>
            You may request access to, correction of, or deletion of your personal data at any time.
          </p>
          <p style={{ ...S.p, margin: 0 }}>
            Email us at <a href="mailto:privacy@studiodistrict.in" style={{ color: '#65a30d', fontWeight: '600' }}>privacy@studiodistrict.in</a> — we respond within 30 days.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>7. Cookies</h2>
          <p style={{ ...S.p, margin: 0 }}>
            We use essential cookies only (authentication, session management). We do not use advertising
            or tracking cookies.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>8. Governing law</h2>
          <p style={{ ...S.p, margin: 0 }}>
            This policy is governed by the Information Technology Act, 2000 and the Digital Personal Data
            Protection Act, 2023 (India).
          </p>
        </div>

        <div style={{ padding: '40px 0 56px' }}>
          <h2 style={S.h2}>9. Contact</h2>
          <p style={S.p}>
            For privacy-related queries, contact us at{' '}
            <a href="mailto:privacy@studiodistrict.in" style={{ color: '#65a30d', fontWeight: '600' }}>privacy@studiodistrict.in</a>.
          </p>
          <PolicyLinks current="/privacy" />
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
