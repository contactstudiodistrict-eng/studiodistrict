'use client'
// components/studio/ImageGallery.tsx
import { useState } from 'react'
import Image from 'next/image'

export function ImageGallery({ images, studioName }: { images: string[]; studioName: string }) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="w-full h-72 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <span className="text-6xl">📸</span>
      </div>
    )
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100" style={{ height: '384px' }}>
        <Image
          src={images[current]}
          alt={`${studioName} - photo ${current + 1}`}
          fill
          className="object-cover"
          priority={current === 0}
          sizes="(max-width: 768px) 100vw, 66vw"
        />
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent(i => Math.max(0, i - 1))}
              disabled={current === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/70 transition-colors"
            >‹</button>
            <button
              onClick={() => setCurrent(i => Math.min(images.length - 1, i + 1))}
              disabled={current === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/70 transition-colors"
            >›</button>
          </>
        )}
        {/* Image counter */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
              ${i === current ? 'border-brand-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-80'}`}>
              <Image src={img} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
