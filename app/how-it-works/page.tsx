'use client'
import { useState } from 'react'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteFooter } from '@/components/shared/SiteFooter'

// ─── Data ─────────────────────────────────────────────────────────────────

const CREATOR_STEPS = [
  {
    num: '01',
    icon: '🔍',
    title: 'Search & Discover',
    body: 'Browse 40+ verified studios across Chennai. Use filters to find exactly what you need.',
    bullets: [
      'Studio type — Photography, Podcast, Video, Music',
      'Location — OMR, Velachery, T.Nagar, Anna Nagar and more',
      'Price range — filter by hourly budget',
    ],
    details: [
      { icon: '⭐', text: 'Verified ratings from past customers' },
      { icon: '🖼️', text: 'Real photos of the space' },
      { icon: '💰', text: 'Transparent pricing — no hidden fees' },
      { icon: '⏰', text: 'Live availability calendar' },
    ],
  },
  {
    num: '02',
    icon: '📅',
    title: 'Select a Date & Book',
    body: 'Pick your shoot date, time, and duration. We send an instant booking request to the studio owner via WhatsApp.',
    bullets: [
      'Choose your slot from the live calendar',
      'Describe your shoot type and team size',
      'Owner confirms within 30–60 minutes',
    ],
    details: [
      { icon: '✅', text: 'Secure payment link sent after confirmation' },
      { icon: '💳', text: 'Pay after confirmation — not before' },
      { icon: '📍', text: 'Studio address & contact sent on payment' },
      { icon: '🔒', text: 'Booking locked once paid' },
    ],
  },
  {
    num: '03',
    icon: '🎬',
    title: 'Shoot & Review',
    body: 'Arrive at the studio. Create your masterpiece. Your security deposit is auto-refunded within 2 hours after the booking ends.',
    bullets: [
      'Access full studio details after payment',
      'Leave a review to help other creators',
      'Earn wallet credits through referrals',
    ],
    details: [
      { icon: '📚', text: 'Full booking history in your dashboard' },
      { icon: '🎁', text: 'Referral credits & loyalty rewards' },
      { icon: '💵', text: 'Security deposit refunded automatically' },
      { icon: '🔄', text: 'Re-book favourite studios in one tap' },
    ],
  },
]

const OWNER_STEPS = [
  {
    num: '01',
    icon: '📝',
    title: 'List Your Studio — Free',
    body: 'Sign up and complete a simple 10-step onboarding form. Takes about 15 minutes. No credit card required.',
    bullets: [
      'Studio name, type & description',
      'Upload 5+ high-quality photos',
      'Set location, pricing & amenities',
    ],
    details: [
      { icon: '⚡', text: 'Go live in as little as 24 hours' },
      { icon: '🆓', text: 'Completely free to list' },
      { icon: '🔧', text: 'Edit your listing anytime' },
      { icon: '📸', text: 'Multiple studio types supported' },
    ],
  },
  {
    num: '02',
    icon: '🔎',
    title: 'We Review Your Studio',
    body: 'Studio District manually reviews every listing to maintain quality across the platform.',
    bullets: [
      'Studio details & photos checked',
      'Pricing reasonableness verified',
      'Amenities accuracy confirmed',
    ],
    details: [
      { icon: '⏱️', text: 'Review takes 24–48 hours' },
      { icon: '📲', text: 'WhatsApp notification when approved' },
      { icon: '🛡️', text: 'Quality badge added to your listing' },
      { icon: '✏️', text: 'Feedback given if changes needed' },
    ],
  },
  {
    num: '03',
    icon: '🚀',
    title: 'Go Live & Get Bookings',
    body: 'Your studio appears in searches across Chennai. Creators send booking requests directly through Studio District.',
    bullets: [
      'Reply YES on WhatsApp to confirm',
      'Reply NO to decline — creator books elsewhere',
      'Set your own availability & pricing anytime',
    ],
    details: [
      { icon: '💬', text: 'All requests arrive via WhatsApp' },
      { icon: '📆', text: 'You control your calendar' },
      { icon: '🔔', text: 'Instant notifications per booking' },
      { icon: '🏆', text: 'Featured placement for top-rated studios' },
    ],
  },
  {
    num: '04',
    icon: '💰',
    title: 'Earn & Manage from Dashboard',
    body: 'Track every rupee from a single dashboard. Payouts are settled automatically the day after each completed booking.',
    bullets: [
      'Monthly earnings & revenue trends',
      'Booking calendar & confirmations',
      'Customer reviews & ratings',
    ],
    details: [
      { icon: '🏦', text: 'Direct bank transfer — next day' },
      { icon: '📊', text: 'Performance analytics' },
      { icon: '🧾', text: 'Auto-generated payout reports' },
      { icon: '🤝', text: 'Dedicated support team' },
    ],
  },
]

const CREATOR_TRUST = [
  'Verified studios only — every listing is reviewed',
  'Transparent pricing · No hidden fees',
  'Instant confirmation (30 min avg response)',
  'Secure payment via Razorpay',
  'Full booking history in your dashboard',
  'Referral credits · Loyalty rewards',
]

const FAQS = [
  {
    q: 'How are bookings confirmed?',
    a: 'Studio owners receive booking requests via WhatsApp. They reply "Yes" to confirm or "No" to decline within 30–60 minutes. You pay only after confirmation.',
  },
  {
    q: 'Is there a commission?',
    a: 'Yes, Studio District charges 10% of the studio booking subtotal. You keep 90% of your base rate. GST of 18% applies on the platform fee only.',
  },
  {
    q: 'What if a customer cancels?',
    a: 'Creators can cancel up to 48 hours before a booking for a full refund. Cancellations within 24 hours forfeit 50% of the booking amount.',
  },
  {
    q: 'How do studio owners get paid?',
    a: 'Payouts are automatic the day after each booking completes. Bank transfer directly to your registered account — no manual requests needed.',
  },
  {
    q: 'Can I set my own prices?',
    a: 'Absolutely. You set your hourly rate, minimum booking hours, and optional half/full-day packages during studio setup. Update anytime from your dashboard.',
  },
  {
    q: 'What if a customer damages my studio?',
    a: 'A refundable security deposit (₹1,200) is collected from every booking. We hold the deposit for 72 hours while disputes are resolved and mediated by our team.',
  },
  {
    q: 'Do I have to be available all the time?',
    a: 'No. You set your own availability calendar. Only slots you mark as "available" can be booked. Block out personal time whenever you need.',
  },
  {
    q: 'Are there any upfront costs?',
    a: 'None. Listing is completely free. You only pay the 10% platform fee when you earn — completely risk-free to get started.',
  },
  {
    q: 'What support does Studio District provide?',
    a: 'Our team is available via email and WhatsApp. We help with listing optimisation, booking disputes, technical issues, and growth tips.',
  },
]

// ─── Sub-components ────────────────────────────────────────────────────────

function StepCard({ step, index, total }: {
  step: typeof CREATOR_STEPS[0]
  index: number
  total: number
}) {
  return (
    <div className="relative">
      {/* Connector line */}
      {index < total - 1 && (
        <div className="hidden lg:block absolute left-[52px] top-[72px] w-px"
          style={{ height: 'calc(100% - 40px)', backgroundColor: '#84cc16', opacity: 0.20 }} />
      )}

      <div className="flex gap-5 sm:gap-6">
        {/* Number badge */}
        <div className="flex-shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-lg font-black z-10"
          style={{ backgroundColor: '#111827', color: '#84cc16', border: '2px solid rgba(132,204,22,0.30)' }}>
          {step.num}
        </div>

        {/* Content card */}
        <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{step.icon}</span>
            <h3 className="text-base sm:text-lg font-bold" style={{ color: '#111827', fontFamily: 'var(--font-space-grotesk)' }}>
              {step.title}
            </h3>
          </div>
          <p className="text-sm mb-4" style={{ color: '#6b7280' }}>{step.body}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bullets */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#9ca3af' }}>What you do</p>
              <ul className="space-y-1.5">
                {step.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                    <span style={{ color: '#84cc16', marginTop: 2, flexShrink: 0 }}>›</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            {/* Details */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#9ca3af' }}>What you get</p>
              <ul className="space-y-1.5">
                {step.details.map(d => (
                  <li key={d.text} className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                    <span>{d.icon}</span>
                    {d.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EarningsBox() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 sm:p-8" style={{ backgroundColor: '#111827' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#84cc16' }}>Earnings Example</p>
          <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
            800 sq ft photography studio · ₹1,200/hr · 5 bookings/week (20 hrs/month)
          </p>
          <div className="space-y-2 text-sm">
            {[
              ['Monthly gross',    '₹24,000', false],
              ['Platform fee (10%)', '−₹2,400', false],
              ['GST on fee (18%)',   '−₹432',   false],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex justify-between py-1.5" style={{ borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8' }}>{label}</span>
                <span style={{ color: '#64748b' }}>{val}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <span className="font-semibold" style={{ color: '#a3e635' }}>Your monthly payout</span>
              <span className="font-bold" style={{ color: '#a3e635' }}>₹21,168</span>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8 bg-white flex flex-col justify-center">
          <p className="text-sm font-bold mb-4" style={{ color: '#111827' }}>Per single booking — ₹1,200 × 3 hrs</p>
          <div className="space-y-2 text-sm">
            {[
              ['Customer pays',        '₹3,600', false],
              ['Platform fee (10%)',   '−₹360',  false],
              ['Studio payout',        '₹3,240', true],
            ].map(([label, val, highlight]) => (
              <div key={String(label)} className="flex justify-between py-1.5 border-b border-gray-50">
                <span className={String(highlight) === 'true' ? 'font-semibold text-gray-900' : 'text-gray-500'}>{label}</span>
                <span className="font-bold" style={{ color: String(highlight) === 'true' ? '#65a30d' : '#9ca3af' }}>{val}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: '#9ca3af' }}>
            Security deposit collected & returned separately. Zero risk of no-shows — payment before arrival.
          </p>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left gap-3 cursor-pointer"
        style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}
      >
        <span className="text-sm font-medium" style={{ color: '#111827' }}>{q}</span>
        <span
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold transition-transform"
          style={{
            backgroundColor: open ? '#84cc16' : '#f3f4f6',
            color: open ? '#111827' : '#6b7280',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          ↓
        </span>
      </button>
      {open && (
        <p className="text-sm pb-4" style={{ color: '#6b7280', lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  const [tab, setTab]     = useState<'creator' | 'owner'>('creator')
  const [openFaq, setFaq] = useState<number | null>(null)

  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#111827' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
              style={{ backgroundColor: 'rgba(132,204,22,0.12)', color: '#a3e635', borderColor: 'rgba(132,204,22,0.25)' }}>
              💡 Platform Guide
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              How Studio District Works
            </h1>
            <p className="text-sm sm:text-base mb-8" style={{ color: '#9ca3af' }}>
              Choose your path — discover how to book or list studios in Chennai.
            </p>

            {/* Tab switcher */}
            <div className="inline-flex rounded-xl p-1 gap-1" style={{ backgroundColor: '#1e293b' }}>
              {[
                { key: 'creator', label: 'For Creators',      sub: 'Browse & Book Studios' },
                { key: 'owner',   label: 'For Studio Owners', sub: 'List & Earn Income'    },
              ].map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key as 'creator' | 'owner')}
                  className="px-5 sm:px-8 py-3 rounded-lg text-left sm:text-center transition-all cursor-pointer"
                  style={{
                    background: tab === t.key ? '#fff' : 'none',
                    border: 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: tab === t.key ? '#111827' : '#94a3b8' }}>
                    {t.label}
                  </div>
                  <div className="text-xs hidden sm:block mt-0.5" style={{ color: tab === t.key ? '#6b7280' : '#475569' }}>
                    {t.sub}
                  </div>
                  {tab === t.key && (
                    <div className="h-0.5 mt-2 rounded-full hidden sm:block" style={{ backgroundColor: '#84cc16' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Steps ─────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          {tab === 'creator' ? (
            <>
              {CREATOR_STEPS.map((step, i) => (
                <StepCard key={step.num} step={step} index={i} total={CREATOR_STEPS.length} />
              ))}

              {/* Trust box */}
              <div className="rounded-2xl border p-6 sm:p-8 mb-4"
                style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <h3 className="text-base font-bold mb-4" style={{ color: '#14532d' }}>
                  Why book through Studio District?
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CREATOR_TRUST.map(t => (
                    <li key={t} className="flex items-start gap-2 text-sm" style={{ color: '#166534' }}>
                      <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center mt-6">
                <a href="/"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-colors"
                  style={{ backgroundColor: '#84cc16', color: '#111827', textDecoration: 'none' }}>
                  Browse Studios Now →
                </a>
              </div>
            </>
          ) : (
            <>
              {OWNER_STEPS.map((step, i) => (
                <StepCard key={step.num} step={step} index={i} total={OWNER_STEPS.length} />
              ))}

              <EarningsBox />

              <div className="text-center mt-2">
                <a href="/studio/onboard"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-colors"
                  style={{ backgroundColor: '#84cc16', color: '#111827', textDecoration: 'none' }}>
                  Start Listing Your Studio →
                </a>
                <p className="text-xs mt-3" style={{ color: '#9ca3af' }}>Free to list · No credit card · Live in 24h</p>
              </div>
            </>
          )}
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#f8fafc' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#84cc16' }}>
                FAQ
              </p>
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#111827', fontFamily: 'var(--font-space-grotesk)' }}>
                Common questions
              </h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 px-5 sm:px-7 shadow-sm">
              {FAQS.map((faq, i) => (
                <FaqItem
                  key={i}
                  q={faq.q}
                  a={faq.a}
                  open={openFaq === i}
                  onToggle={() => setFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────── */}
        <section>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Creator CTA */}
              <div className="rounded-2xl p-6 sm:p-8 flex flex-col" style={{ backgroundColor: '#111827' }}>
                <div className="text-2xl mb-3">🎬</div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Ready to book a studio?
                </h3>
                <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>
                  Browse 40+ verified studios across Chennai. Book in minutes.
                </p>
                <a href="/"
                  className="mt-auto block text-center py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ backgroundColor: '#84cc16', color: '#111827', textDecoration: 'none' }}>
                  Browse Studios →
                </a>
              </div>

              {/* Owner CTA */}
              <div className="rounded-2xl p-6 sm:p-8 flex flex-col" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div className="text-2xl mb-3">🏠</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#111827', fontFamily: 'var(--font-space-grotesk)' }}>
                  Ready to earn from your studio?
                </h3>
                <p className="text-sm mb-6" style={{ color: '#4b5563' }}>
                  List your studio free. Go live in 24 hours. No upfront costs.
                </p>
                <a href="/studio/onboard"
                  className="mt-auto block text-center py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ backgroundColor: '#84cc16', color: '#111827', textDecoration: 'none' }}>
                  List Your Studio →
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
