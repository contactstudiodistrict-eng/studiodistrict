'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const ref  = searchParams.get('ref')  || ''

  const supabase = createClient()
  const otpInputRef = useRef<HTMLInputElement>(null)

  const [step,           setStep]           = useState<'email' | 'otp'>('email')
  const [email,          setEmail]          = useState('')
  const [otp,            setOtp]            = useState('')
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !loading) {
      handleVerifyOtp({ preventDefault: () => {} } as React.FormEvent)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail) { setError('Enter a valid email address'); return }
    setLoading(true)
    setError('')

    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined,
        },
      })
      if (otpErr) { setError(otpErr.message); return }
      setStep('otp')
      setResendCooldown(30)
      setTimeout(() => otpInputRef.current?.focus(), 100)
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) { setError('Enter the 6-digit code from your email'); return }
    setLoading(true)
    setError('')

    try {
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (verifyErr) {
        setError('Invalid or expired code. Please try again.')
        setOtp('')
        setTimeout(() => otpInputRef.current?.focus(), 50)
        return
      }

      // Apply referral code
      const pendingRef = ref || localStorage.getItem('sd_referral_code') || ''
      if (pendingRef && data.user) {
        fetch('/api/referral/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: pendingRef }),
        })
          .then(() => localStorage.removeItem('sd_referral_code'))
          .catch(() => {})
      }
      if (ref) localStorage.setItem('sd_referral_code', ref)

      router.replace(next)
      router.refresh()
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setOtp('')
    setError('')
    await handleSendCode({ preventDefault: () => {} } as React.FormEvent)
  }

  async function handleGoogle() {
    setLoading(true)
    const { error: gErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (gErr) { setError('Google sign-in failed. Try email instead.'); setLoading(false) }
  }

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px',
    padding: '12px 14px', fontSize: '15px', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s',
  }
  const primaryBtn: React.CSSProperties = {
    width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
    backgroundColor: '#84cc16', color: '#111827', transition: 'background .15s',
  }
  const disabledBtn: React.CSSProperties = {
    ...primaryBtn, backgroundColor: '#d9f99d', cursor: 'not-allowed', opacity: 0.7,
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '16px', fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <span style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.03em' }}>
              <span style={{ color: '#111827' }}>Studio</span>
              <span style={{ color: '#84cc16' }}>District</span>
            </span>
          </a>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '5px 0 0' }}>
            Chennai&apos;s studio booking platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
          padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <>
              <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', margin: '0 0 4px' }}>
                Sign in or create account
              </h1>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 20px' }}>
                We&apos;ll send a 6-digit code to your email
              </p>

              <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="you@email.com"
                  autoFocus
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#84cc16')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />

                {error && <ErrorBox message={error} />}

                <button
                  type="submit"
                  disabled={loading || !isValidEmail}
                  style={loading || !isValidEmail ? disabledBtn : primaryBtn}
                >
                  {loading ? 'Sending…' : 'Send code →'}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }} />
                <span style={{ padding: '0 12px', fontSize: '12px', color: '#9ca3af' }}>or</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }} />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: '10px',
                  border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '500', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
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

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <>
              {/* Back */}
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setError('') }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#6b7280', fontSize: '13px', fontFamily: 'inherit',
                  padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                ← Back
              </button>

              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 6px' }}>
                Check your email
              </h1>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px' }}>
                We sent a 6-digit code to
              </p>
              <p style={{ color: '#111827', fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>
                {email}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 24px' }}>
                The code expires in 10 minutes.
              </p>

              {/* 6-box OTP input */}
              <form onSubmit={handleVerifyOtp}>
                <div style={{ position: 'relative', height: '56px', marginBottom: '12px' }}>
                  {/* Hidden real input */}
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                    style={{
                      position: 'absolute', inset: 0, opacity: 0,
                      width: '100%', height: '100%', cursor: 'default', zIndex: 1,
                    }}
                  />
                  {/* Visual boxes */}
                  <div style={{ display: 'flex', gap: '8px', height: '56px' }}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        onClick={() => otpInputRef.current?.focus()}
                        style={{
                          flex: 1, height: '56px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '24px', fontWeight: 700, fontFamily: 'monospace',
                          border: otp.length === i
                            ? '2px solid #84cc16'
                            : otp[i]
                              ? '1px solid #84cc16'
                              : '1px solid #e5e7eb',
                          borderRadius: '10px',
                          backgroundColor: otp[i] ? '#f0fdf4' : '#fff',
                          color: '#111827',
                          cursor: 'text',
                          transition: 'all .1s',
                          userSelect: 'none',
                        }}
                      >
                        {otp[i] || ''}
                      </div>
                    ))}
                  </div>
                </div>

                {error && <ErrorBox message={error} />}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  style={{
                    ...(loading || otp.length < 6 ? disabledBtn : primaryBtn),
                    marginTop: '4px',
                  }}
                >
                  {loading ? 'Verifying…' : 'Verify code →'}
                </button>
              </form>

              {/* Resend */}
              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
                Didn&apos;t receive a code?{' '}
                {resendCooldown > 0 ? (
                  <span style={{ color: '#9ca3af' }}>Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#84cc16', fontWeight: '600', fontSize: '13px',
                      fontFamily: 'inherit', padding: 0,
                    }}
                  >
                    Resend code
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '16px' }}>
          By signing in, you agree to our{' '}
          <a href="/terms" style={{ color: '#65a30d', textDecoration: 'none' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: '#65a30d', textDecoration: 'none' }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
      padding: '10px 14px', fontSize: '12px', color: '#dc2626',
      display: 'flex', alignItems: 'center', gap: '6px',
    }}>
      ⚠️ {message}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
        Loading…
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
