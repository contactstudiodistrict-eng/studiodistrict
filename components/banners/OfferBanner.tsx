'use client'
// components/banners/OfferBanner.tsx
import { useState, useEffect } from 'react'
import type { Banner } from '@/types/database.types'

export function OfferBanner({ banner }: { banner: Banner }) {
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
      backgroundColor: banner.bg_color,
      borderRadius: '14px',
      borderLeft: `4px solid ${banner.accent_color}`,
      padding: '20px 20px 20px 20px',
      marginBottom: '24px',
      position: 'relative',
    }}>
      {/* Dismiss */}
      {banner.is_dismissable && (
        <button
          onClick={dismiss}
          style={{
            position: 'absolute',
            top: '12px',
            right: '14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: banner.text_color,
            opacity: 0.5,
            fontSize: '16px',
            lineHeight: 1,
            padding: '4px',
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}

      <div className="offer-banner-inner">
        {/* Left: icon + text */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
          <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>🎁</span>
          <div>
            <div style={{
              fontWeight: '700',
              fontSize: '16px',
              color: banner.text_color,
              marginBottom: '4px',
            }}>
              {banner.title}
            </div>
            {banner.body && (
              <div style={{
                fontSize: '13px',
                color: banner.text_color,
                opacity: 0.75,
                lineHeight: '1.5',
              }}>
                {banner.body}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        {banner.cta_label && banner.cta_url && (
          <a
            href={banner.cta_url}
            className="offer-banner-cta"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: banner.accent_color,
              color: '#111827',
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textAlign: 'center',
            }}
          >
            {banner.cta_label}
          </a>
        )}
      </div>
      <style>{`
        .offer-banner-inner {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .offer-banner-inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .offer-banner-cta {
            display: block;
          }
        }
      `}</style>
    </div>
  )
}
