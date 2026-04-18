'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const NAME_RE = /^[a-zA-Z\s\-']{2,50}$/

interface Props {
  onComplete: () => void
}

export function ProfileCompletionModal({ onComplete }: Props) {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const f = firstName.trim()
    const l = lastName.trim()

    if (!NAME_RE.test(f) || !NAME_RE.test(l)) {
      setError('First and last name required (letters only, 2–50 chars)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: f, last_name: l }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      onComplete()
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div
        className="relative w-full bg-white rounded-2xl shadow-2xl"
        style={{ maxWidth: 400, padding: '32px 28px 28px' }}
      >
        {/* Skip */}
        <button
          type="button"
          onClick={onComplete}
          className="absolute top-4 right-4 text-xs text-slate-400 hover:text-slate-600 hover:underline transition-colors cursor-pointer"
          style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}
        >
          Skip for now
        </button>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-1" style={{ color: '#111827', fontFamily: 'var(--font-space-grotesk)' }}>
            Welcome! Let&apos;s complete your profile 🎬
          </h2>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            Your name helps studios personalise your booking experience.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 mb-4 sm:flex-row flex-col">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Arjun"
                maxLength={50}
                autoFocus
                className="w-full text-sm focus:outline-none transition-colors"
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: '12px 14px',
                  color: '#111827',
                  backgroundColor: '#fff',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#84cc16')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Kumar"
                maxLength={50}
                className="w-full text-sm focus:outline-none transition-colors"
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: '12px 14px',
                  color: '#111827',
                  backgroundColor: '#fff',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#84cc16')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl text-sm font-semibold transition-colors"
            style={{
              backgroundColor: loading ? '#a3e635' : '#84cc16',
              color: '#111827',
              padding: '13px',
              border: 'none',
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Saving…' : 'Continue →'}
          </button>
        </form>
      </div>
    </div>
  )
}
