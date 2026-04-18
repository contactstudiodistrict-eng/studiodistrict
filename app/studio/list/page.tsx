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

          {/* Mobile decorative layer */}
          <div aria-hidden className="sm:hidden absolute inset-0 pointer-events-none select-none overflow-hidden">
            {/* Centered aperture ring */}
            <svg className="absolute" style={{ top: '-30px', left: '50%', transform: 'translateX(-50%)' }}
              width="280" height="280" viewBox="0 0 280 280" fill="none">
              <circle cx="140" cy="140" r="130" stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.15"/>
              <circle cx="140" cy="140" r="114" stroke="#84cc16" strokeWidth="2"   strokeOpacity="0.24"/>
              <circle cx="140" cy="140" r="86"  stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.18"/>
              <circle cx="140" cy="140" r="54"  stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.16"/>
              <circle cx="140" cy="140" r="4"   fill="#84cc16"   fillOpacity="0.22"/>
              {[0,45,90,135,180,225,270,315].map((a: number) => (
                <line key={a}
                  x1={140 + 54  * Math.cos(a * Math.PI / 180)}
                  y1={140 + 54  * Math.sin(a * Math.PI / 180)}
                  x2={140 + 114 * Math.cos(a * Math.PI / 180)}
                  y2={140 + 114 * Math.sin(a * Math.PI / 180)}
                  stroke="#84cc16" strokeWidth="0.75" strokeOpacity="0.13"
                />
              ))}
              <line x1="140" y1="26"  x2="140" y2="254" stroke="#84cc16" strokeWidth="0.5" strokeOpacity="0.08"/>
              <line x1="26"  y1="140" x2="254" y2="140" stroke="#84cc16" strokeWidth="0.5" strokeOpacity="0.08"/>
            </svg>
            {/* Grid dots */}
            <svg className="absolute top-0 left-3" width="100" height="84" viewBox="0 0 100 84">
              {Array.from({ length: 4 }).map((_, row) =>
                Array.from({ length: 4 }).map((_, col) => (
                  <circle key={`${row}-${col}`}
                    cx={col * 28 + 8} cy={row * 25 + 8} r={row === 0 || col === 0 ? 1.6 : 1.1}
                    fill="#84cc16" fillOpacity={row === 0 && col === 0 ? 0.48 : 0.17}
                  />
                ))
              )}
            </svg>
            {/* Camera brackets */}
            <svg className="absolute top-4 left-4" width="36" height="36" viewBox="0 0 48 48" fill="none">
              <path d="M2 22 L2 2 L22 2" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.42" strokeLinecap="round"/>
            </svg>
            <svg className="absolute top-4 right-4" width="36" height="36" viewBox="0 0 48 48" fill="none">
              <path d="M46 22 L46 2 L26 2" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.42" strokeLinecap="round"/>
            </svg>
            {/* Film strip bottom */}
            <svg className="absolute bottom-6 left-4" width="156" height="38" viewBox="0 0 156 38" fill="none">
              <rect x="0" y="0" width="156" height="38" rx="4" fill="#84cc16" fillOpacity="0.10"/>
              <rect x="0" y="0" width="156" height="1"  fill="#84cc16" fillOpacity="0.36"/>
              <rect x="0" y="37" width="156" height="1" fill="#84cc16" fillOpacity="0.36"/>
              {[0,1,2,3,4,5].map((i: number) => (
                <rect key={`t${i}`} x={i * 24 + 4} y="3" width="12" height="7" rx="1.5" fill="#84cc16" fillOpacity="0.26"/>
              ))}
              {[0,1,2,3,4,5].map((i: number) => (
                <rect key={`b${i}`} x={i * 24 + 4} y="28" width="12" height="7" rx="1.5" fill="#84cc16" fillOpacity="0.26"/>
              ))}
            </svg>
            {/* Equalizer bars */}
            <svg className="absolute bottom-5 right-4" width="50" height="42" viewBox="0 0 50 42" fill="none">
              {[
                { x: 0,  h: 16, o: 0.30 }, { x: 8,  h: 28, o: 0.40 }, { x: 16, h: 22, o: 0.34 },
                { x: 24, h: 38, o: 0.50 }, { x: 32, h: 30, o: 0.43 }, { x: 40, h: 18, o: 0.32 },
              ].map(({ x, h, o }) => (
                <rect key={x} x={x} y={42 - h} width="5" height={h} rx="2.5" fill="#84cc16" fillOpacity={o}/>
              ))}
            </svg>
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 100% 65% at 50% 26%, rgba(132,204,22,0.08) 0%, transparent 68%)' }} />
          </div>

          {/* Desktop decorative layer */}
          <div aria-hidden className="hidden sm:block absolute inset-0 pointer-events-none select-none overflow-hidden">
            {/* Large aperture ring — top right */}
            <svg className="absolute -top-20 -right-20" width="500" height="500" viewBox="0 0 500 500" fill="none">
              <circle cx="250" cy="250" r="238" stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.14"/>
              <circle cx="250" cy="250" r="218" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.25"/>
              <circle cx="250" cy="250" r="168" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.18"/>
              <circle cx="250" cy="250" r="114" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.17"/>
              <circle cx="250" cy="250" r="62"  stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.26"/>
              <circle cx="250" cy="250" r="6"   fill="#84cc16"   fillOpacity="0.22"/>
              {[0,30,60,90,120,150,180,210,240,270,300,330].map((a: number) => (
                <line key={a}
                  x1={250 + 62  * Math.cos(a * Math.PI / 180)}
                  y1={250 + 62  * Math.sin(a * Math.PI / 180)}
                  x2={250 + 218 * Math.cos(a * Math.PI / 180)}
                  y2={250 + 218 * Math.sin(a * Math.PI / 180)}
                  stroke="#84cc16" strokeWidth="1" strokeOpacity="0.13"
                />
              ))}
              <line x1="250" y1="22"  x2="250" y2="478" stroke="#84cc16" strokeWidth="0.75" strokeOpacity="0.08"/>
              <line x1="22"  y1="250" x2="478" y2="250" stroke="#84cc16" strokeWidth="0.75" strokeOpacity="0.08"/>
            </svg>
            {/* Smaller aperture — bottom left */}
            <svg className="absolute -bottom-10 -left-10" width="260" height="260" viewBox="0 0 260 260" fill="none">
              <circle cx="130" cy="130" r="118" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.18"/>
              <circle cx="130" cy="130" r="84"  stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.16"/>
              <circle cx="130" cy="130" r="48"  stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.20"/>
              {[0,45,90,135,180,225,270,315].map((a: number) => (
                <line key={a}
                  x1={130 + 48  * Math.cos(a * Math.PI / 180)}
                  y1={130 + 48  * Math.sin(a * Math.PI / 180)}
                  x2={130 + 118 * Math.cos(a * Math.PI / 180)}
                  y2={130 + 118 * Math.sin(a * Math.PI / 180)}
                  stroke="#84cc16" strokeWidth="0.75" strokeOpacity="0.11"
                />
              ))}
            </svg>
            {/* Grid dots */}
            <svg className="absolute top-0 left-10" width="200" height="180" viewBox="0 0 200 180">
              {Array.from({ length: 6 }).map((_, row) =>
                Array.from({ length: 6 }).map((_, col) => (
                  <circle key={`${row}-${col}`}
                    cx={col * 34 + 10} cy={row * 30 + 10}
                    r={row === 0 || col === 0 ? 2 : 1.5}
                    fill="#84cc16" fillOpacity={row === 0 && col === 0 ? 0.52 : 0.20}
                  />
                ))
              )}
            </svg>
            {/* Camera brackets */}
            <svg className="absolute top-5 left-5" width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M2 22 L2 2 L22 2" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.44" strokeLinecap="round"/>
            </svg>
            <svg className="absolute top-5 right-5" width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M46 22 L46 2 L26 2" stroke="#84cc16" strokeWidth="2.5" strokeOpacity="0.44" strokeLinecap="round"/>
            </svg>
            {/* Film strip — bottom left */}
            <svg className="absolute bottom-8 left-8" width="260" height="48" viewBox="0 0 260 48" fill="none">
              <rect x="0" y="0" width="260" height="48" rx="4" fill="#84cc16" fillOpacity="0.10"/>
              <rect x="0" y="0" width="260" height="1"  fill="#84cc16" fillOpacity="0.38"/>
              <rect x="0" y="47" width="260" height="1" fill="#84cc16" fillOpacity="0.38"/>
              {[0,1,2,3,4,5,6,7,8,9,10].map((i: number) => (
                <rect key={`t${i}`} x={i * 24 + 4} y="4" width="14" height="9" rx="2" fill="#84cc16" fillOpacity="0.28"/>
              ))}
              {[0,1,2,3,4,5,6,7,8,9,10].map((i: number) => (
                <rect key={`b${i}`} x={i * 24 + 4} y="35" width="14" height="9" rx="2" fill="#84cc16" fillOpacity="0.28"/>
              ))}
              {[1,2,3,4,5].map((i: number) => (
                <rect key={`d${i}`} x={i * 44 + 4} y="15" width="1" height="18" fill="#84cc16" fillOpacity="0.22"/>
              ))}
            </svg>
            {/* Equalizer bars — bottom right */}
            <svg className="absolute bottom-6 right-16" width="72" height="60" viewBox="0 0 72 60" fill="none">
              {[
                { x: 0,  h: 24, o: 0.33 }, { x: 8,  h: 40, o: 0.43 }, { x: 16, h: 32, o: 0.36 },
                { x: 24, h: 52, o: 0.52 }, { x: 32, h: 44, o: 0.48 }, { x: 40, h: 32, o: 0.38 },
                { x: 48, h: 48, o: 0.45 }, { x: 56, h: 28, o: 0.33 }, { x: 64, h: 18, o: 0.26 },
              ].map(({ x, h, o }) => (
                <rect key={x} x={x} y={60 - h} width="5" height={h} rx="2.5" fill="#84cc16" fillOpacity={o}/>
              ))}
            </svg>
            {/* Building/studio icon — left mid */}
            <svg className="absolute left-12" style={{ top: '40%' }} width="40" height="52" viewBox="0 0 40 52" fill="none">
              <rect x="6" y="14" width="28" height="36" rx="2" stroke="#84cc16" strokeWidth="1.6" strokeOpacity="0.36"/>
              <path d="M2 14 L20 2 L38 14" stroke="#84cc16" strokeWidth="1.6" strokeOpacity="0.36" fill="none" strokeLinejoin="round"/>
              <rect x="14" y="32" width="12" height="18" rx="1" stroke="#84cc16" strokeWidth="1.2" strokeOpacity="0.28"/>
              {[12,20,28].map((x: number) => [20,28].map((y: number) => (
                <rect key={`${x}${y}`} x={x} y={y} width="6" height="6" rx="0.5" stroke="#84cc16" strokeWidth="1" strokeOpacity="0.24"/>
              )))}
            </svg>
            {/* Waveform — right mid */}
            <svg className="absolute right-14" style={{ top: '44%' }} width="80" height="40" viewBox="0 0 80 40" fill="none">
              {[
                { x: 0, h: 8 }, { x: 8, h: 16 }, { x: 16, h: 24 }, { x: 24, h: 34 },
                { x: 32, h: 40 }, { x: 40, h: 28 }, { x: 48, h: 18 }, { x: 56, h: 10 },
                { x: 64, h: 20 }, { x: 72, h: 6 },
              ].map(({ x, h }) => (
                <rect key={x} x={x} y={(40 - h) / 2} width="5" height={h} rx="2.5" fill="#84cc16" fillOpacity="0.30"/>
              ))}
            </svg>
            {/* Camera icon top area */}
            <svg className="absolute" style={{ top: '10%', left: '30%' }} width="36" height="28" viewBox="0 0 36 28" fill="none">
              <rect x="1" y="7" width="34" height="20" rx="3" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.30"/>
              <circle cx="18" cy="17" r="6" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.30"/>
              <circle cx="18" cy="17" r="3" stroke="#84cc16" strokeWidth="1"   strokeOpacity="0.22"/>
              <path d="M12 7 L15 2 L21 2 L24 7" stroke="#84cc16" strokeWidth="1.5" strokeOpacity="0.28" fill="none"/>
              <circle cx="28" cy="11" r="2" fill="#84cc16" fillOpacity="0.22"/>
            </svg>
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 38%, rgba(132,204,22,0.06) 0%, transparent 70%)' }} />
          </div>

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
