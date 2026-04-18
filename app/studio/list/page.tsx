import Link from 'next/link'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteFooter } from '@/components/shared/SiteFooter'

const BENEFITS = [
  {
    icon: '📅',
    title: 'Instant Booking Requests',
    body: 'Receive real-time booking requests directly on WhatsApp. Confirm or decline in one tap — no calls, no back-and-forth.',
  },
  {
    icon: '💰',
    title: 'Guaranteed Payouts',
    body: 'Customers pay online before they arrive. Your payout is locked in before every shoot — zero risk of no-shows.',
  },
  {
    icon: '🔍',
    title: 'Be Discovered by Creators',
    body: "Chennai's photographers, filmmakers, brands, and podcasters actively search Studio District. Your listing reaches them all.",
  },
  {
    icon: '🛡️',
    title: 'You Stay in Control',
    body: 'Set your own pricing, availability, and rules. Confirm every booking manually — your studio, your terms.',
  },
  {
    icon: '📊',
    title: 'Dashboard & Analytics',
    body: 'Track bookings, earnings, and reviews from a single dashboard. Know exactly how your studio is performing.',
  },
  {
    icon: '🆓',
    title: 'Free to List',
    body: 'No upfront costs. We charge a small platform fee only when you earn — completely risk-free to get started.',
  },
]

const STEPS = [
  { step: '01', title: 'Create your listing', body: 'Add your studio photos, pricing, amenities, and availability. Takes about 10 minutes.' },
  { step: '02', title: 'Get reviewed', body: 'Our team reviews and approves your listing within 1–2 business days.' },
  { step: '03', title: 'Go live & earn', body: 'Your studio appears in search results. Bookings start coming in directly to your WhatsApp.' },
]

const STATS = [
  { value: '40+', label: 'Studios listed' },
  { value: '500+', label: 'Bookings facilitated' },
  { value: '₹0', label: 'Cost to list' },
  { value: '24h', label: 'Avg. review time' },
]

export default function StudioListPage() {
  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
          {/* Decorative aperture ring */}
          <svg aria-hidden className="absolute right-0 top-0 opacity-[0.06] pointer-events-none" width="500" height="500" viewBox="0 0 500 500" fill="none">
            <circle cx="400" cy="100" r="280" stroke="#84cc16" strokeWidth="2"/>
            <circle cx="400" cy="100" r="200" stroke="#84cc16" strokeWidth="1.5"/>
            <circle cx="400" cy="100" r="120" stroke="#84cc16" strokeWidth="1"/>
            {[0,45,90,135,180,225,270,315].map(a => (
              <line key={a}
                x1={400 + 120 * Math.cos(a * Math.PI / 180)}
                y1={100 + 120 * Math.sin(a * Math.PI / 180)}
                x2={400 + 280 * Math.cos(a * Math.PI / 180)}
                y2={100 + 280 * Math.sin(a * Math.PI / 180)}
                stroke="#84cc16" strokeWidth="1"/>
            ))}
          </svg>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
              style={{ backgroundColor: 'rgba(132,204,22,0.12)', color: '#a3e635', borderColor: 'rgba(132,204,22,0.25)' }}>
              🏠 For Studio Owners
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
              Turn your Studio space<br />
              <span style={{ color: '#a3e635' }}>into steady income</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: '#94a3b8' }}>
              Join Chennai&apos;s fastest-growing Studio Booking marketplace. List for free — pay only when you earn.
            </p>
            <Link href="/studio/onboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-colors"
              style={{ backgroundColor: '#84cc16', color: '#111827' }}>
              Start Listing Your Studio →
            </Link>
            <p className="mt-4 text-xs" style={{ color: '#475569' }}>Free to list · No credit card required · Live in 24h</p>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#111827', borderBottom: '1px solid #1e293b' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#84cc16' }}>{s.value}</div>
                <div className="text-xs mt-1" style={{ color: '#64748b' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why list with us ─────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Why list with Studio District?</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Everything you need to fill your calendar and grow your studio business.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{b.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#f8fafc' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">How it works</h2>
              <p className="text-gray-500">Three simple steps to start earning from your studio.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {STEPS.map((s, i) => (
                <div key={s.step} className="relative text-center">
                  {i < STEPS.length - 1 && (
                    <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-px" style={{ backgroundColor: '#84cc16', opacity: 0.3 }} />
                  )}
                  <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-lg font-black"
                    style={{ backgroundColor: '#84cc16', color: '#111827' }}>
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What you earn ─────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: dark */}
              <div className="p-8 sm:p-10" style={{ backgroundColor: '#0f172a' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#84cc16' }}>Transparent Pricing</div>
                <h2 className="text-2xl font-bold text-white mb-4">Keep most of what you earn</h2>
                <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>
                  We charge a small platform fee only on the platform commission — your hourly rate goes straight to your payout.
                </p>
                <div className="space-y-3">
                  {[
                    ['Your hourly rate', '100%', true],
                    ['Platform fee (10%)', 'on subtotal', false],
                    ['GST on fee (18%)', 'on fee only', false],
                  ].map(([label, val, highlight]) => (
                    <div key={String(label)} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #1e293b' }}>
                      <span className="text-sm" style={{ color: highlight ? '#a3e635' : '#94a3b8' }}>{label}</span>
                      <span className="text-sm font-bold" style={{ color: highlight ? '#a3e635' : '#64748b' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right: example */}
              <div className="p-8 sm:p-10 bg-white flex flex-col justify-center">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Example — ₹1,200/hr × 3 hrs</div>
                <div className="space-y-3">
                  {[
                    ['Customer pays', '₹3,600', false],
                    ['Platform fee (10%)', '− ₹360', false],
                    ['Your payout', '₹3,240', true],
                  ].map(([label, val, highlight]) => (
                    <div key={String(label)} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className={`text-sm ${highlight ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{label}</span>
                      <span className={`text-sm font-bold ${highlight ? 'text-brand-600' : 'text-gray-400'}`}
                        style={highlight ? { color: '#65a30d' } : {}}>{val}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4">Security deposit collected and returned to the customer separately.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <section className="border-t border-gray-100" style={{ backgroundColor: '#f0fdf4' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to start earning?</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              List your studio in 10 minutes. Our team reviews it within 24 hours and you&apos;re live — for free.
            </p>
            <Link href="/studio/onboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-colors"
              style={{ backgroundColor: '#84cc16', color: '#111827' }}>
              List My Studio — It&apos;s Free →
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
