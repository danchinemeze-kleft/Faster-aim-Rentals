/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-eval' now only in development (Next.js dev mode needs it)
              `script-src 'self' ${isDev ? "'unsafe-eval' " : ''}'unsafe-inline' https://js.paystack.co https://accounts.google.com https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // images: only the hosts you use, not all of https:
              "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://img.youtube.com https://i.ytimg.com https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.google.com.ng https://stats.g.doubleclick.net",
              // added Supabase so uploaded listing videos can play
              "media-src 'self' blob: https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://generativelanguage.googleapis.com https://accounts.google.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://www.google.com https://www.google.com.ng",
              // added YouTube so listing video embeds work
              "frame-src 'self' https://js.paystack.co https://checkout.paystack.com https://accounts.google.com https://www.youtube.com https://www.youtube-nocookie.com",
              "object-src 'none'",
              "base-uri 'self'",
              // new: blocks other sites from framing yours, and limits where forms can post
              "frame-ancestors 'none'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      // Cache static assets
      {
        source: '/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects for common auth path aliases
  async redirects() {
    return [
      { source: '/login', destination: '/account', permanent: true },
      { source: '/signup', destination: '/account', permanent: true },
    ]
  },

  // Show our own address instead of the Supabase project ID
  async rewrites() {
    return [
      {
        source: '/sb/:path*',
        destination: 'https://ojkhpishuqyeiwaopaty.supabase.co/:path*',
      },
    ]
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'rent.fasteraim.com',
        pathname: '/sb/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Power by header removal
  poweredByHeader: false,
}

export default nextConfig