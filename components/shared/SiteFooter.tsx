// components/shared/SiteFooter.tsx
'use client'

export function SiteFooter() {
  const year = 2025

  return (
    <footer style={{ background: '#0f172a', borderTop: '1px solid #1e293b', fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px 32px' }}>

        {/* Top row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between', marginBottom: '32px' }}>

          {/* Brand */}
          <div style={{ minWidth: '180px' }}>
            <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-0.03em', color: '#f8fafc' }}>Studio</span>
              <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-0.03em', color: '#84cc16' }}>District</span>
            </a>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
              Chennai&apos;s studio booking marketplace
            </p>
          </div>

          {/* Links */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', alignItems: 'flex-start' }}>
            {[
              { href: '/about',         label: 'About Us' },
              { href: '/privacy',       label: 'Privacy Policy' },
              { href: '/refund-policy', label: 'Refund Policy' },
              { href: '/terms',         label: 'Terms of Service' },
            ].map(({ href, label }) => (
              <a key={href} href={href}
                style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none', whiteSpace: 'nowrap' as const, transition: 'color 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.color = '#84cc16')}
                onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
                {label}
              </a>
            ))}
          </nav>

        </div>

        {/* Bottom row */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
            © {year} Studio District. All rights reserved.
          </p>
          <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
            Chennai, Tamil Nadu, India
          </p>
        </div>

      </div>
    </footer>
  )
}
