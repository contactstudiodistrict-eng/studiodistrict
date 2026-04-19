'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const [user, setUser]             = useState<User | null>(null)
  const [profile, setProfile]       = useState<{ full_name: string | null; role: string } | null>(null)
  const [walletBalance, setWallet]  = useState(0)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [mobileNavOpen, setMobileNav] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [studioStatus, setStudioStatus]   = useState<string | null>(null)
  const [pendingBookings, setPendingBookings] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      if (data.user) fetchProfile(data.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('users').select('full_name, role, wallet_balance').eq('id', userId).single()
    setProfile(data)
    if (data?.wallet_balance) setWallet(data.wallet_balance)

    if (data?.role === 'studio_owner' || data?.role === 'admin') {
      // Fetch studio status + pending bookings count in parallel
      const [studiosRes, bookingsRes] = await Promise.all([
        supabase.from('studios').select('id, status').eq('owner_id', userId).order('created_at', { ascending: false }).limit(1),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending')
          .in('studio_id',
            (await supabase.from('studios').select('id').eq('owner_id', userId)).data?.map(s => s.id) ?? []
          ),
      ])
      if (studiosRes.data?.[0]) setStudioStatus(studiosRes.data[0].status)
      if (bookingsRes.count) setPendingBookings(bookingsRes.count)
    }

    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setMenuOpen(false)
    router.push('/'); router.refresh()
  }

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Account'
  const initial     = displayName.charAt(0).toUpperCase()
  const isOwner     = profile?.role === 'studio_owner'
  const isAdmin     = profile?.role === 'admin'

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

        {/* Logo */}
        <a href="/" className="flex-shrink-0 font-sans font-bold text-xl tracking-tight no-underline"
          style={{ letterSpacing: '-0.03em', textDecoration: 'none' }}>
          <span className="text-ink-900">Studio</span><span className="text-brand-500">District</span>
        </a>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-500">
          <a href="/" className={`no-underline font-medium transition-colors hover:text-brand-600 ${pathname === '/' ? 'text-brand-600' : 'text-slate-500'}`}
            style={{ textDecoration: 'none' }}>
            Discover
          </a>
          <a href="/how-it-works" className={`no-underline font-medium transition-colors hover:text-brand-600 ${pathname === '/how-it-works' ? 'text-brand-600' : 'text-slate-500'}`}
            style={{ textDecoration: 'none' }}>
            How it works
          </a>
          <a href="/studio/list" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-brand-600 transition-colors"
            style={{ textDecoration: 'none' }}>
            List your studio
          </a>
          {isAdmin && (
            <a href="/admin" className="text-violet-600 font-semibold hover:text-violet-700 transition-colors"
              style={{ textDecoration: 'none' }}>
              Admin ⚡
            </a>
          )}
        </nav>

        {/* Right: auth */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 border border-slate-200 rounded-full bg-white hover:border-slate-300 transition-colors cursor-pointer"
                style={{ fontFamily: 'inherit' }}>
                {/* Avatar with notification dot */}
                <div className="relative">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#84cc16,#65a30d)' }}>
                    {initial}
                  </div>
                  {pendingBookings > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </div>
                {/* Name — hidden on very small screens */}
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[90px] truncate">
                  {displayName}
                </span>
                <span className="text-slate-400 text-[10px]">▼</span>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40" />
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">

                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="font-semibold text-sm text-ink-900">{displayName}</div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">{user.email || user.phone}</div>
                      {walletBalance > 0 && (
                        <div className="text-xs font-semibold text-green-700 mt-1">
                          💰 Wallet: ₹{walletBalance.toLocaleString('en-IN')}
                        </div>
                      )}
                      {(isOwner || isAdmin) && (
                        <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                          ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-brand-100 text-brand-700'}`}>
                          {isAdmin ? '⚡ Admin' : '🏠 Studio Owner'}
                        </span>
                      )}
                    </div>

                    {/* Nav links on mobile — shown here */}
                    <div className="md:hidden border-b border-slate-100">
                      <DropItem href="/" icon="🔍" label="Discover" onClick={() => setMenuOpen(false)} active={pathname === '/'} />
                      <DropItem href="/how-it-works" icon="💡" label="How it works" onClick={() => setMenuOpen(false)} active={pathname === '/how-it-works'} />
                      <DropItem href="/studio/list" icon="➕" label="List a Studio" onClick={() => setMenuOpen(false)} active={false} />
                      {isAdmin && <DropItem href="/admin" icon="⚡" label="Admin Panel" onClick={() => setMenuOpen(false)} active={pathname.startsWith('/admin')} />}
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                      <DropItem href="/dashboard" icon="📅" label="My Bookings" onClick={() => setMenuOpen(false)} active={pathname === '/dashboard'} />
                      {isOwner && (
                        <DropItem
                          href="/studio/dashboard"
                          icon="🏠"
                          label="My Studio"
                          onClick={() => setMenuOpen(false)}
                          active={pathname === '/studio/dashboard'}
                          badge={
                            pendingBookings > 0
                              ? { text: `${pendingBookings} pending`, color: 'bg-amber-100 text-amber-700' }
                              : studioStatus === 'pending'
                                ? { text: 'under review', color: 'bg-amber-100 text-amber-700' }
                                : studioStatus === 'live'
                                  ? { text: 'live', color: 'bg-green-100 text-green-700' }
                                  : undefined
                          }
                        />
                      )}
                      {!isOwner && <DropItem href="/studio/list" icon="➕" label="List a Studio" onClick={() => setMenuOpen(false)} active={false} />}
                      {isAdmin && <DropItem href="/admin" icon="⚙️" label="Admin Panel" onClick={() => setMenuOpen(false)} active={pathname.startsWith('/admin')} />}
                    </div>

                    <div className="p-1.5 border-t border-slate-100">
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        style={{ border: 'none', background: 'none', fontFamily: 'inherit', textAlign: 'left' }}>
                        🚪 Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Hamburger — mobile only, logged-out */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setMobileNav(o => !o)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors cursor-pointer"
                  style={{ fontFamily: 'inherit' }}
                  aria-label="Menu"
                >
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path d="M0 1h16M0 6h16M0 11h16" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>

                {mobileNavOpen && (
                  <>
                    <div onClick={() => setMobileNav(false)} className="fixed inset-0 z-40" />
                    <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden p-1.5">
                      <DropItem href="/" icon="🔍" label="Discover" onClick={() => setMobileNav(false)} active={pathname === '/'} />
                      <DropItem href="/how-it-works" icon="💡" label="How it works" onClick={() => setMobileNav(false)} active={pathname === '/how-it-works'} />
                      <DropItem href="/studio/list" icon="➕" label="List a Studio" onClick={() => setMobileNav(false)} active={pathname === '/studio/list'} />
                    </div>
                  </>
                )}
              </div>

              <a href={`/login?next=${encodeURIComponent(pathname)}`}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors whitespace-nowrap"
                style={{ textDecoration: 'none' }}>
                Sign in
              </a>
            </>

          )}
        </div>
      </div>
    </header>
  )
}

function DropItem({ href, icon, label, onClick, active, badge }: {
  href: string; icon: string; label: string; onClick: () => void; active: boolean
  badge?: { text: string; color: string }
}) {
  return (
    <a href={href} onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
        ${active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
      style={{ textDecoration: 'none' }}>
      <span className="text-base">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.color}`}>
          {badge.text}
        </span>
      )}
    </a>
  )
}
