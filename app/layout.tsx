// app/layout.tsx
import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, Space_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
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
  title: { default: 'Framr — Book Studio Spaces in Chennai', template: '%s | Framr' },
  description: 'Book photography, podcast, video, and music studios in Chennai. Instant availability, transparent pricing.',
  keywords: ['studio rental', 'photography studio', 'podcast studio', 'Chennai', 'book studio'],
  openGraph: {
    title: 'Framr — Chennai Studio Booking',
    description: 'Book the perfect studio for your next shoot in Chennai',
    url: 'https://framr.in',
    siteName: 'Framr',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable} ${spaceMono.variable}`}>
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
