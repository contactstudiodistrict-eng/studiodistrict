// app/terms/page.tsx
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteFooter } from '@/components/shared/SiteFooter'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Studio District — Chennai\'s studio booking marketplace.',
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

export default function TermsPage() {
  return (
    <div style={S.page}>
      <SiteHeader />

      {/* Hero */}
      <div style={S.hero}>
        <span style={S.tag}>Legal</span>
        <h1 style={S.h1}>Terms of Service</h1>
        <p style={S.meta}>Effective date: April 2025</p>
      </div>

      <div style={S.body}>

        <div style={S.section}>
          <h2 style={S.h2}>1. About Studio District</h2>
          <p style={S.p}>
            Studio District is an online marketplace platform that connects studio owners with creators.
            We are a technology intermediary — we do not own, operate, or control any studios listed on the platform.
          </p>
          <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ ...S.p, margin: '0 0 4px', fontSize: '13px' }}>
              <strong>Business category:</strong> E-commerce / Online Marketplace — Rental Services
            </p>
            <p style={{ ...S.p, margin: 0, fontSize: '13px' }}>
              <strong>Governing jurisdiction:</strong> Chennai, Tamil Nadu, India
            </p>
          </div>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>2. Eligibility</h2>
          <p style={S.p}>
            You must be 18 years or older to use Studio District.
          </p>
          <p style={{ ...S.p, margin: 0 }}>
            By using the platform, you confirm you are legally capable of entering into binding contracts
            under Indian law.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>3. User responsibilities</h2>
          <p style={S.p}><strong>Customers must:</strong></p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            {[
              'Provide accurate booking details (name, phone, shoot type)',
              'Arrive on time and vacate by the booked end time',
              'Follow each studio\'s stated rules and policies',
            ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
          </ul>
          <p style={S.p}><strong>Studio owners must:</strong></p>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {[
              'Maintain accurate and up-to-date listings',
              'Respond to booking requests within 60 minutes during operating hours',
              'Honour all confirmed and paid bookings',
            ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>4. Platform role</h2>
          <p style={{ ...S.p, margin: 0 }}>
            Studio District acts as an intermediary marketplace. We are not a party to the rental agreement
            between studio owner and customer. Disputes must first be attempted to be resolved between both
            parties before escalating to Studio District support.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>5. Payments</h2>
          <p style={{ ...S.p, margin: 0 }}>
            All payments are processed via Razorpay. Studio District collects payment on behalf of studio
            owners and transfers earnings after deducting the 10% platform fee and applicable GST on the fee.
            Studio payouts are processed within 1 business day after payment is received.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>6. GST</h2>
          <p style={{ ...S.p, margin: 0 }}>
            18% GST applies to the Studio District platform fee. Studio owners are independently responsible
            for their own GST registration and compliance obligations under Indian tax law.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>7. Prohibited conduct</h2>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {[
              'Booking studios with no genuine intent to use them',
              'Providing false or misleading information during registration or booking',
              'Damaging studio property or equipment',
              'Circumventing the platform to book directly with studios after initial contact',
              'Harassment of studio owners, customers, or Studio District staff',
            ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>8. Limitation of liability</h2>
          <p style={S.p}>
            Studio District is not liable for any loss, damage, or injury occurring at studio premises.
            Studio District&apos;s maximum liability to any user is limited to the amount paid for the
            specific booking in question.
          </p>
          <p style={{ ...S.p, margin: 0 }}>
            We are not responsible for studio cancellations, technical failures outside our control,
            or disputes between users.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.h2}>9. Governing law</h2>
          <p style={{ ...S.p, margin: 0 }}>
            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive
            jurisdiction of courts in Chennai, Tamil Nadu.
          </p>
        </div>

        <div style={{ padding: '40px 0 56px' }}>
          <h2 style={S.h2}>10. Contact</h2>
          <p style={S.p}>
            For questions about these terms, contact{' '}
            <a href="mailto:hello@studiodistrict.in" style={{ color: '#65a30d', fontWeight: '600' }}>hello@studiodistrict.in</a>
          </p>
          <PolicyLinks current="/terms" />
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
