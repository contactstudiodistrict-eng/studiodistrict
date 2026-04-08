'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<{ full_name: string | null; role: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      if (data.user) fetchProfile(data.user.id)
      else setLoading(false)
    })

    // Listen for auth changes (login / logout / magic link redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('full_name, role')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  // First name or email prefix
  const displayName = profile?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Account'

  const initial = displayName.charAt(0).toUpperCase()
  const isOwner = profile?.role === 'studio_owner'
  const isAdmin = profile?.role === 'admin'

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <a href="/" style={{ fontFamily: 'Georgia,serif', fontSize: '24px', color: '#f07020', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          framr.
        </a>

        {/* Nav links — desktop */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', color: '#6b7280' }}>
          <a href="/" style={{ color: pathname === '/' ? '#f07020' : '#6b7280', textDecoration: 'none', fontWeight: pathname === '/' ? '500' : '400' }}>
            Discover
          </a>
          <a href="/studio/onboard" style={{ color: '#6b7280', textDecoration: 'none' }}>
            List your studio
          </a>
          {isAdmin && (
            <a href="/admin" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500' }}>
              Admin ⚡
            </a>
          )}
        </nav>

        {/* Right side — auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {loading ? (
            <div style={{ width: '80px', height: '34px', background: '#f9fafb', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : user ? (
            /* ── Logged in ── */
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px 6px 6px', border: '1px solid #e5e7eb', borderRadius: '99px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                {/* Avatar circle */}
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#f07020,#e05010)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                  {initial}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '10px' }}>▼</span>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />

                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>

                    {/* User info */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827', marginBottom: '2px' }}>{displayName}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || user.phone}</div>
                      {(isOwner || isAdmin) && (
                        <div style={{ marginTop: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '99px', background: isAdmin ? '#ede9fe' : '#fff3e0', color: isAdmin ? '#7c3aed' : '#f07020', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                            {isAdmin ? '⚡ Admin' : '🏠 Studio Owner'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '6px' }}>
                      <MenuItem href="/dashboard" icon="📅" label="My Bookings" onClick={() => setMenuOpen(false)} active={pathname === '/dashboard'} />
                      {isOwner && <MenuItem href="/studio/dashboard" icon="🏠" label="My Studio" onClick={() => setMenuOpen(false)} active={pathname === '/studio/dashboard'} />}
                      {!isOwner && <MenuItem href="/studio/onboard" icon="➕" label="List a Studio" onClick={() => setMenuOpen(false)} active={false} />}
                      {isAdmin && <MenuItem href="/admin" icon="⚙️" label="Admin Panel" onClick={() => setMenuOpen(false)} active={pathname.startsWith('/admin')} />}
                    </div>

                    <div style={{ padding: '6px', borderTop: '1px solid #f3f4f6' }}>
                      <button onClick={handleSignOut}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#ef4444', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>🚪</span> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ── Logged out ── */
            <a href={`/login?next=${encodeURIComponent(pathname)}`}
              style={{ padding: '8px 18px', borderRadius: '8px', background: '#f07020', color: '#fff', fontSize: '13px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Sign in
            </a>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </header>
  )
}

function MenuItem({ href, icon, label, onClick, active }: { href: string; icon: string; label: string; onClick: () => void; active: boolean }) {
  return (
    <a href={href} onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: active ? '500' : '400', color: active ? '#f07020' : '#374151', background: active ? '#fff5ee' : 'transparent', transition: 'background .12s' }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = '#f9fafb' }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      <span style={{ fontSize: '15px' }}>{icon}</span>
      {label}
    </a>
  )
}
