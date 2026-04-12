// components/shared/HeroBanner.tsx
export function HeroBanner() {
  return (
    <div className="bg-ink-900 border-b border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 text-center">

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold mb-4 sm:mb-5 border border-brand-500/30">
          🎬 Chennai&apos;s studio booking platform
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-white mb-3 sm:mb-4 leading-tight tracking-tight">
          Book the perfect studio<br />
          <span className="text-brand-400">for your next shoot</span>
        </h1>

        <p className="text-ink-400 text-base sm:text-lg max-w-lg mx-auto mb-6 sm:mb-8 px-2">
          Photography, podcast, video, and music studios across Chennai.
          <span className="hidden sm:inline"> Instant availability. No middlemen.</span>
        </p>

        {/* Quick search */}
        <form action="/" method="GET" className="flex gap-2 max-w-lg mx-auto px-1 sm:px-0">
          <input
            name="q"
            type="search"
            placeholder="Search studios or areas…"
            className="flex-1 min-w-0 border border-ink-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-ink-800 text-white placeholder:text-ink-500"
          />
          <button
            type="submit"
            className="flex-shrink-0 px-5 py-3 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Stats */}
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-8 mt-8 text-sm text-ink-400">
          <div className="flex items-center gap-1.5"><span>🏠</span> 40+ studios</div>
          <div className="flex items-center gap-1.5"><span>📍</span> Pan-Chennai</div>
          <div className="flex items-center gap-1.5"><span>⚡</span> Instant booking</div>
        </div>
      </div>
    </div>
  )
}
