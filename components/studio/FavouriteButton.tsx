'use client'
// components/studio/FavouriteButton.tsx
import { useState } from 'react'

interface Props {
  studioId: string
  initialFavourited: boolean
  size?: number
}

export function FavouriteButton({ studioId, initialFavourited, size = 36 }: Props) {
  const [isFavourited, setIsFavourited] = useState(initialFavourited)
  const [loading, setLoading] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    const next = !isFavourited
    setIsFavourited(next) // optimistic

    setLoading(true)
    try {
      const res = next
        ? await fetch('/api/favourites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studio_id: studioId }),
          })
        : await fetch(`/api/favourites/${studioId}`, { method: 'DELETE' })

      if (!res.ok) {
        setIsFavourited(!next) // revert
      }
    } catch {
      setIsFavourited(!next) // revert on network error
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFavourited ? 'Remove from saved' : 'Save studio'}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: loading ? 'default' : 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        padding: 0,
        outline: 'none',
      }}
      onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.1)' }}
      onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {isFavourited ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#84cc16" stroke="#65a30d" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  )
}
