'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Method = 'phone' | 'email'
type Step   = 'input' | 'otp' | 'email_sent'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const supabase = createClient()

  const [method,  setMethod]  = useState<Method>('phone')
  const [step,    setStep]    = useState<Step>('input')
  const [value,   setValue]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next)
    })
    // Handle magic link redirect (hash fragment from Supabase)
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace(next)
        router.refresh()
      }
    })
  }, [])

  function isValid() {
    if (method === 'phone') return /^[6-9]\d{9}$/.test(value)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid()) {
      toast.error(method === 'phone' ? 'Enter a valid 10-digit mobile number' : 'Enter a valid email')
      return
    }
    setLoading(true)
    try {
      if (method === 'phone') {
        const { error } = await supabase.auth.signInWithOtp({ phone: `+91${value}` })
        if (error) throw error
        setStep('otp')
        toast.success(`OTP sent to +91 ${value}`)
      } else {
        // Email: sends magic link + 6-digit code in same email
        const { error } = await supabase.auth.signInWithOtp({
          email: value,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
          }
        })
        if (error) throw error
        // Show the email_sent step — not the OTP entry step
        setStep('email_sent')
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('sms') || err.message?.toLowerCase().includes('phone')) {
        toast.error('Phone OTP not configured — use Email instead')
        setMethod('email'); setValue(''); setStep('input')
      } else {
        toast.error(err.message || 'Failed to send')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      // Email OTP verification (the code from the email)
      const { error } = await supabase.auth.verifyOtp({ email: value, token: otp, type: 'email' })
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

  async function handleVerifyPhone(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: `+91${value}`, token: otp, type: 'sms' })
      if (error) throw error
      toast.success('Signed in!')
      router.replace(next)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP — try again')
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

  // ── Styles ───────────────────────────────────────────────────────────────
  const card: React.CSSProperties = { background:'#fff', borderRadius:'16px', border:'1px solid #e5e7eb', padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }
  const inp: React.CSSProperties  = { width:'100%', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }
  const btn: React.CSSProperties  = { width:'100%', padding:'13px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:'600', fontFamily:'inherit', background:'#f07020', color:'#fff' }
  const btnOff: React.CSSProperties = { ...btn, background:'#fed7aa', cursor:'not-allowed' }
  const lbl: React.CSSProperties  = { display:'block', fontSize:'11px', fontWeight:'600', color:'#9ca3af', textTransform:'uppercase' as const, letterSpacing:'.06em', marginBottom:'6px' }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#fff5ee,#fff,#fffbeb)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'380px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <a href="/" style={{ fontFamily:'Georgia,serif', fontSize:'30px', color:'#f07020', textDecoration:'none' }}>framr.</a>
          <p style={{ color:'#6b7280', fontSize:'14px', margin:'6px 0 0' }}>Chennai&apos;s studio booking platform</p>
        </div>

        <div style={card}>

          {/* ── STEP: Input ── */}
          {step === 'input' && (
            <>
              <h1 style={{ fontSize:'20px', fontWeight:'600', color:'#111827', margin:'0 0 4px' }}>Sign in</h1>
              <p style={{ color:'#6b7280', fontSize:'13px', margin:'0 0 20px' }}>Book studios across Chennai</p>

              {/* Method tabs */}
              <div style={{ display:'flex', gap:'4px', background:'#f9fafb', borderRadius:'10px', padding:'3px', marginBottom:'18px' }}>
                {(['phone','email'] as Method[]).map(m => (
                  <button key={m} type="button" onClick={() => { setMethod(m); setValue('') }}
                    style={{ flex:1, padding:'8px 0', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'500', fontFamily:'inherit',
                      background: method===m ? '#fff' : 'transparent',
                      color: method===m ? '#f07020' : '#6b7280',
                      boxShadow: method===m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                    {m === 'phone' ? '📱 Mobile OTP' : '✉️ Email link'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSend} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div>
                  <label style={lbl}>{method === 'phone' ? 'Mobile number' : 'Email address'}</label>
                  {method === 'phone' ? (
                    <div style={{ display:'flex' }}>
                      <span style={{ display:'flex', alignItems:'center', padding:'0 12px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRight:'none', borderRadius:'10px 0 0 10px', fontSize:'13px', color:'#374151', whiteSpace:'nowrap' }}>🇮🇳 +91</span>
                      <input type="tel" inputMode="numeric" value={value} onChange={e => setValue(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="9876543210" autoFocus
                        style={{ ...inp, borderRadius:'0 10px 10px 0', borderLeft:'none', flex:1, width:'auto' }} />
                    </div>
                  ) : (
                    <input type="email" value={value} onChange={e => setValue(e.target.value)} placeholder="you@email.com" autoFocus style={inp} />
                  )}
                </div>
                <button type="submit" disabled={loading || !isValid()} style={loading || !isValid() ? btnOff : btn}>
                  {loading ? 'Sending…' : method === 'phone' ? 'Send OTP →' : 'Send Login Link →'}
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

              {/* Testing hint */}
              <div style={{ marginTop:'16px', padding:'11px 13px', background:'#f0fdf4', borderRadius:'8px', border:'1px solid #bbf7d0', fontSize:'12px', color:'#15803d', lineHeight:'1.5' }}>
                💡 <strong>Testing:</strong> Use <strong>Email link</strong> → click the link in your email → you&apos;re in. No code needed.
              </div>
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
                  <strong style={{ color:'#374151' }}>{value}</strong>
                </p>
              </div>

              {/* Primary action */}
              <div style={{ background:'#f0fdf4', borderRadius:'12px', border:'1px solid #bbf7d0', padding:'16px', marginBottom:'20px' }}>
                <div style={{ fontWeight:'600', color:'#15803d', fontSize:'13px', marginBottom:'6px' }}>✅ Option 1 — Click the link (easiest)</div>
                <div style={{ color:'#166534', fontSize:'13px', lineHeight:'1.5' }}>
                  Open the email from Supabase and click <strong>"Confirm your email"</strong> or <strong>"Sign in"</strong>. You&apos;ll be logged in automatically.
                </div>
              </div>

              {/* Secondary action — 6 digit code */}
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
                <button type="button" onClick={() => { setStep('input'); setOtp(''); setValue('') }}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontSize:'13px', fontFamily:'inherit', padding:0 }}>
                  ← Use different email
                </button>
                <button type="button" onClick={handleSend} disabled={loading}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#f07020', fontSize:'13px', fontFamily:'inherit', padding:0 }}>
                  Resend email
                </button>
              </div>
            </>
          )}

          {/* ── STEP: Phone OTP ── */}
          {step === 'otp' && method === 'phone' && (
            <>
              <button onClick={() => { setStep('input'); setOtp('') }} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:'13px', padding:'0 0 14px', fontFamily:'inherit' }}>
                ← Back
              </button>
              <h1 style={{ fontSize:'20px', fontWeight:'600', color:'#111827', margin:'0 0 6px' }}>Enter OTP</h1>
              <p style={{ color:'#6b7280', fontSize:'13px', margin:'0 0 20px' }}>
                Sent to <strong style={{ color:'#374151' }}>+91 {value}</strong>
              </p>
              <form onSubmit={handleVerifyPhone} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div>
                  <label style={lbl}>6-digit OTP</label>
                  <input type="text" inputMode="numeric" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="000000" autoFocus maxLength={6}
                    style={{ ...inp, fontSize:'24px', letterSpacing:'0.5em', textAlign:'center', padding:'14px' }} />
                </div>
                <button type="submit" disabled={loading || otp.length !== 6} style={loading || otp.length !== 6 ? btnOff : btn}>
                  {loading ? 'Verifying…' : 'Verify & Sign in →'}
                </button>
                <button type="button" onClick={handleSend} disabled={loading}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#f07020', fontSize:'13px', fontFamily:'inherit', padding:'4px 0' }}>
                  Resend OTP
                </button>
              </form>
            </>
          )}

        </div>

        <p style={{ textAlign:'center', fontSize:'11px', color:'#9ca3af', marginTop:'16px' }}>
          By signing in, you agree to our Terms and Privacy Policy
        </p>
      </div>
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
