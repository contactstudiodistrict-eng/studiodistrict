// app/layout.tsx
import type { Metadata } from 'next'
import { Space_Grotesk, DM_Serif_Display, Space_Mono, Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { ClientLayout } from '@/components/shared/ClientLayout'
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

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bricolage',
  display: 'swap',
})

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const BASE = 'https://studiodistrict.in'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: { default: 'Studio District — Book Studio Spaces in Chennai', template: '%s | Studio District' },
  description: 'Book photography, podcast, video, and music studios in Chennai. See real photos, check availability, and book in under 2 minutes.',
  keywords: ['studio rental Chennai', 'photography studio Chennai', 'podcast studio Chennai', 'music studio Chennai', 'video studio Chennai', 'book studio space'],
  alternates: {
    canonical: BASE,
  },
  openGraph: {
    title: 'Studio District — Chennai Studio Booking',
    description: 'Book photography, podcast, video, and music studios in Chennai. Instant availability, transparent pricing.',
    url: BASE,
    siteName: 'Studio District',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio District — Chennai Studio Booking',
    description: 'Book photography, podcast, video, and music studios in Chennai.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSerif.variable} ${spaceMono.variable} ${bricolage.variable} ${hanken.variable} ${jetbrains.variable}`}>
      <head>
        {/* Preconnect to image origins used for hero and studio thumbnails */}
        <link rel="preconnect" href="https://khtzyxyqurkakdzsvhza.supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans bg-white text-ink-900 antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
