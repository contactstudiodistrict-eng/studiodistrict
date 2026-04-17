'use client'
// components/banners/AnnouncementBanner.tsx
import { useState, useEffect } from 'react'
import type { Banner } from '@/types/database.types'

const TYPE_ICON: Record<string, string> = {
  announcement: '📢',
  offer: '🎁',
  feature: '✨',
}

export function AnnouncementBanner({ banner }: { banner: Banner }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!banner.is_dismissable) return
    try {
      const dismissed: string[] = JSON.parse(localStorage.getItem('sd_dismissed_banners') || '[]')
      if (dismissed.includes(banner.id)) setVisible(false)
    } catch {}
  }, [banner.id, banner.is_dismissable])

  function dismiss() {
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
      width: '100%',
      backgroundColor: banner.bg_color,
      color: banner.text_color,
      padding: '0 16px',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        minHeight: '52px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 0',
      }}>
        {/* Icon */}
        <span style={{ fontSize: '18px', flexShrink: 0 }}>
          {TYPE_ICON[banner.type] || '📢'}
        </span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: '700', fontSize: '14px' }}>{banner.title}</span>
          {banner.body && (
            <span style={{ fontSize: '13px', opacity: 0.8, marginLeft: '6px' }}>
              {banner.body}
            </span>
          )}
        </div>

        {/* CTA */}
        {banner.cta_label && banner.cta_url && (
          <a
            href={banner.cta_url}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: banner.accent_color,
              color: '#111827',
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {banner.cta_label}
          </a>
        )}

        {/* Dismiss */}
        {banner.is_dismissable && (
          <button
            onClick={dismiss}
            style={{
              flexShrink: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: banner.text_color,
              opacity: 0.6,
              fontSize: '18px',
              lineHeight: 1,
              padding: '4px',
              marginLeft: '4px',
            }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
