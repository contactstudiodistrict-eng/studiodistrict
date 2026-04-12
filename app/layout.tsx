// app/layout.tsx
import type { Metadata } from 'next'
import { Space_Grotesk, DM_Serif_Display, Space_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Studio District — Book Studio Spaces in Chennai', template: '%s | Studio District' },
  description: 'Book photography, podcast, video, and music studios in Chennai. Instant availability, transparent pricing.',
  keywords: ['studio rental', 'photography studio', 'podcast studio', 'Chennai', 'book studio'],
  openGraph: {
    title: 'Studio District — Chennai Studio Booking',
    description: 'Book the perfect studio for your next shoot in Chennai',
    url: 'https://studiodistrict.vercel.app',
    siteName: 'Studio District',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSerif.variable} ${spaceMono.variable}`}>
      <body className="font-sans bg-white text-ink-900 antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
