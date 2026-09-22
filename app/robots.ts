import { MetadataRoute } from 'next'

const BASE = 'https://studiodistrict.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/studio/dashboard',
          '/studio/onboard',
          '/studio/submitted',
          '/dashboard',
          '/bookings/',
          '/review/',
          '/login',
          '/auth/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
