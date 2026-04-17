'use client'
// components/banners/FeatureCard.tsx
import { useState, useEffect } from 'react'
import type { Banner } from '@/types/database.types'

export function FeatureCard({ banner }: { banner: Banner }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!banner.is_dismissable) return
    try {
      const dismissed: string[] = JSON.parse(localStorage.getItem('sd_dismissed_banners') || '[]')
      if (dismissed.includes(banner.id)) setVisible(false)
    } catch {}
  }, [banner.id, banner.is_dismissable])

  function dismiss(e: React.MouseEvent) {
    e.preventDefault()
    setVisible(false)
    try {
      const dismissed: string[] = JSON.parse(localStorage.getItem('sd_dismissed_banners') || '[]')
      if (!dismissed.includes(banner.id)) {
        localStorage.setItem('sd_dismissed_banners', JSON.stringify([...dismissed, banner.id]))
      }
    } catch {}
  }

  if (!visible) return null

  return (
    <div style={{
      backgroundColor: banner.bg_color,
      borderRadius: '16px',
      border: `1px solid ${banner.accent_color}66`,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '280px',
      position: 'relative',
    }}>
      {/* Dismiss */}
      {banner.is_dismissable && (
        <button
          onClick={dismiss}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: banner.text_color,
            opacity: 0.4,
            fontSize: '14px',
            lineHeight: 1,
            padding: '4px',
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}

      <div>
        {/* Type pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: banner.accent_color,
          color: '#111827',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          ✨ {banner.title}
        </div>

        {/* Body */}
        {banner.body && (
          <div style={{
            fontSize: '15px',
            color: banner.text_color,
            opacity: 0.85,
            lineHeight: '1.6',
          }}>
            {banner.body}
          </div>
        )}
      </div>

      {/* CTA */}
      {banner.cta_label && banner.cta_url && (
        <a
          href={banner.cta_url}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '20px',
            color: banner.accent_color,
            fontSize: '14px',
            fontWeight: '700',
            textDecoration: 'none',
          }}
        >
          {banner.cta_label} →
        </a>
      )}
    </div>
  )
}
