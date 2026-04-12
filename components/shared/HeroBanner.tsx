// components/shared/HeroBanner.tsx
export function HeroBanner() {
  return (
    <div className="bg-ink-900 border-b border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold mb-5 border border-brand-500/30">
          🎬 Chennai&apos;s studio booking platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-sans font-bold text-white mb-4 leading-tight tracking-tight">
          Book the perfect studio<br />
          <span className="text-brand-400">for your next shoot</span>
        </h1>
        <p className="text-ink-400 text-lg max-w-xl mx-auto mb-8">
          Photography, podcast, video, and music studios across Chennai. Instant availability. No middlemen.
        </p>

        {/* Quick search */}
        <form action="/" method="GET" className="flex gap-2 max-w-lg mx-auto">
          <input
            name="q"
            type="text"
            placeholder="Search studios, areas, or type…"
            className="flex-1 border border-ink-700 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm bg-ink-800 text-white placeholder:text-ink-500"
          />
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-10 text-sm text-ink-400">
          <div className="flex items-center gap-1.5"><span className="text-lg">🏠</span> 40+ studios</div>
          <div className="flex items-center gap-1.5"><span className="text-lg">📍</span> Pan-Chennai</div>
          <div className="flex items-center gap-1.5"><span className="text-lg">⚡</span> Instant booking</div>
        </div>
      </div>
    </div>
  )
}
