import Link from 'next/link'
import { SiteHeader } from '@/components/shared/SiteHeader'

export default function StudioSubmittedPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-56px)] bg-ink-950 flex items-center justify-center px-4"
        style={{ backgroundColor: '#0f172a' }}>
        <div className="max-w-lg w-full text-center py-16">

          {/* Icon */}
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#84cc1620', border: '2px solid #84cc16' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Studio submitted!</h1>
          <p className="text-slate-400 text-base leading-relaxed mb-2">
            We&apos;ve received your studio listing and our team will review it within <strong className="text-white">1–2 business days</strong>.
          </p>
          <p className="text-slate-500 text-sm mb-10">
            You&apos;ll get an email and WhatsApp notification once it&apos;s approved and live.
          </p>

          {/* Steps */}
          <div className="text-left rounded-2xl border border-slate-700 divide-y divide-slate-700 mb-10"
            style={{ backgroundColor: '#1e293b' }}>
            {[
              { step: '1', label: 'Review in progress', desc: 'Our team checks your studio details and photos', done: true },
              { step: '2', label: 'Studio goes live', desc: 'Creators in Chennai can discover and book your space', done: false },
              { step: '3', label: 'First booking arrives', desc: 'Confirm via WhatsApp or your dashboard', done: false },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4 px-5 py-4">
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5
                  ${item.done ? 'bg-brand-500 text-white' : 'bg-slate-700 text-slate-400'}`}
                  style={item.done ? { backgroundColor: '#84cc16', color: '#111827' } : {}}>
                  {item.done ? '✓' : item.step}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/studio/dashboard"
              className="px-6 py-3 rounded-xl font-semibold text-sm text-center transition-colors"
              style={{ backgroundColor: '#84cc16', color: '#111827' }}>
              Go to Studio Dashboard →
            </Link>
            <Link href="/"
              className="px-6 py-3 rounded-xl font-semibold text-sm text-center border border-slate-600 text-slate-300 hover:border-slate-500 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
