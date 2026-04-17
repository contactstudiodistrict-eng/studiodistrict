'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { SiteFooter } from '@/components/shared/SiteFooter'

type Step = 'input' | 'email_sent'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const refCode = searchParams.get('ref')
  const supabase = createClient()

  const [step,    setStep]    = useState<Step>('input')
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)

  // Store referral code in localStorage when visiting /login?ref=CODE
  useEffect(() => {
    if (refCode) {
      localStorage.setItem('referralCode', refCode.toUpperCase())
    }
  }, [refCode])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next)
    })
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Auto-apply referral code if stored
        const storedCode = localStorage.getItem('referralCode')
        if (storedCode) {
          fetch('/api/referral/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: storedCode }),
          }).then(r => r.json()).then(d => {
            if (d.success) {
              toast.success(`Referral code ${storedCode} applied! ₹200 credit after your first booking.`)
            }
            localStorage.removeItem('referralCode')
          }).catch(() => localStorage.removeItem('referralCode'))
        }
        router.replace(next)
        router.refresh()
      }
    })
  }, [])

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail) { toast.error('Enter a valid email address'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        }
      })
      if (error) throw error
      setStep('email_sent')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send login link')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (error) throw error
      toast.success('Signed in!')
      router.replace(next)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Invalid code — try again')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` }
    })
    if (error) { toast.error('Google sign-in not configured yet'); setLoading(false) }
  }

  const card: React.CSSProperties = { background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }
  const inp: React.CSSProperties  = { width:'100%', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'12px 14px', fontSize:'16px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }
  const btn: React.CSSProperties  = { width:'100%', padding:'13px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:'600', fontFamily:'inherit', background:'#84cc16', color:'#fff' }
  const btnOff: React.CSSProperties = { ...btn, background:'#d9f99d', cursor:'not-allowed' }
  const lbl: React.CSSProperties  = { display:'block', fontSize:'11px', fontWeight:'600', color:'#9ca3af', textTransform:'uppercase' as const, letterSpacing:'.06em', marginBottom:'6px' }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0fdf4,#fff,#f7fee7)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'380px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <a href="/" style={{ fontFamily:'var(--font-space-grotesk),system-ui,sans-serif', fontSize:'28px', fontWeight:'700', letterSpacing:'-0.03em', textDecoration:'none', display:'inline-flex', gap:'0' }}>
            <span style={{ color:'#0f172a' }}>Studio</span><span style={{ color:'#84cc16' }}>District</span>
          </a>
          <p style={{ color:'#64748b', fontSize:'14px', margin:'6px 0 0' }}>Chennai&apos;s studio booking platform</p>
        </div>

        <div style={card}>

          {/* ── STEP: Input ── */}
          {step === 'input' && (
            <>
              <h1 style={{ fontSize:'20px', fontWeight:'600', color:'#111827', margin:'0 0 4px' }}>Sign in</h1>
              <p style={{ color:'#6b7280', fontSize:'13px', margin:'0 0 20px' }}>Book studios across Chennai</p>

              <form onSubmit={handleSend} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div>
                  <label style={lbl}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com" autoFocus style={inp} />
                </div>
                <button type="submit" disabled={loading || !isValidEmail} style={loading || !isValidEmail ? btnOff : btn}>
                  {loading ? 'Sending…' : 'Send Login Link →'}
                </button>
              </form>

              <div style={{ display:'flex', alignItems:'center', margin:'18px 0' }}>
                <div style={{ flex:1, height:'1px', background:'#f3f4f6' }} />
                <span style={{ padding:'0 12px', fontSize:'12px', color:'#9ca3af' }}>or</span>
                <div style={{ flex:1, height:'1px', background:'#f3f4f6' }} />
              </div>

              <button onClick={handleGoogle} disabled={loading}
                style={{ width:'100%', padding:'11px', borderRadius:'10px', border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', fontSize:'13px', fontWeight:'500', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* ── STEP: Email sent ── */}
          {step === 'email_sent' && (
            <>
              <div style={{ textAlign:'center', marginBottom:'20px' }}>
                <div style={{ fontSize:'48px', marginBottom:'12px' }}>📧</div>
                <h1 style={{ fontSize:'20px', fontWeight:'600', color:'#111827', margin:'0 0 8px' }}>Check your email</h1>
                <p style={{ color:'#6b7280', fontSize:'14px', lineHeight:'1.6', margin:0 }}>
                  We sent a login link to<br />
                  <strong style={{ color:'#374151' }}>{email}</strong>
                </p>
              </div>

              <div style={{ background:'#f0fdf4', borderRadius:'12px', border:'1px solid #bbf7d0', padding:'16px', marginBottom:'20px' }}>
                <div style={{ fontWeight:'600', color:'#15803d', fontSize:'13px', marginBottom:'6px' }}>✅ Option 1 — Click the link (easiest)</div>
                <div style={{ color:'#166534', fontSize:'13px', lineHeight:'1.5' }}>
                  Open the email from Supabase and click <strong>&quot;Confirm your email&quot;</strong> or <strong>&quot;Sign in&quot;</strong>. You&apos;ll be logged in automatically.
                </div>
              </div>

              <div style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                  <div style={{ flex:1, height:'1px', background:'#e5e7eb' }} />
                  <span style={{ fontSize:'12px', color:'#9ca3af' }}>or enter the code from the email</span>
                  <div style={{ flex:1, height:'1px', background:'#e5e7eb' }} />
                </div>

                <form onSubmit={handleVerifyOtp} style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  <div>
                    <label style={lbl}>6-digit code from email</label>
                    <input type="text" inputMode="numeric" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                      placeholder="000000" maxLength={6}
                      style={{ ...inp, fontSize:'24px', letterSpacing:'0.5em', textAlign:'center', padding:'14px' }} />
                  </div>
                  <button type="submit" disabled={loading || otp.length !== 6} style={loading || otp.length !== 6 ? btnOff : btn}>
                    {loading ? 'Verifying…' : 'Verify Code →'}
                  </button>
                </form>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'12px', borderTop:'1px solid #f3f4f6' }}>
                <button type="button" onClick={() => { setStep('input'); setOtp(''); setEmail('') }}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontSize:'13px', fontFamily:'inherit', padding:0 }}>
                  ← Use different email
                </button>
                <button type="button" onClick={handleSend} disabled={loading}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#84cc16', fontSize:'13px', fontFamily:'inherit', padding:0 }}>
                  Resend email
                </button>
              </div>
            </>
          )}

        </div>

        <p style={{ textAlign:'center', fontSize:'11px', color:'#9ca3af', marginTop:'16px' }}>
          By signing in, you agree to our{' '}
          <a href="/terms" style={{ color:'#65a30d', textDecoration:'none' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color:'#65a30d', textDecoration:'none' }}>Privacy Policy</a>
        </p>
      </div>
      <SiteFooter />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
