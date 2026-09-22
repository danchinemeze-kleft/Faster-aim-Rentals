import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account',
        '/dashboard',
        '/my-account',
        '/reveal-success',
        '/api/',
      ],
    },
    sitemap: 'https://rent.fasteraim.com/sitemap.xml',
  }
}