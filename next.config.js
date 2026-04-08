/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — production image CDN
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Supabase Storage — fallback
      { protocol: 'https', hostname: 'khtzyxyqurkakdzsvhza.supabase.co' },
      // Unsplash — seed/placeholder images
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Common placeholder services
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['twilio'],
  },
  // Fix webpack big string serialization warning
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.cache = {
        ...config.cache,
        compression: 'gzip',
      }
    }
    return config
  },
}

module.exports = nextConfig