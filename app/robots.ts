import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/account',
          '/my-account',
          '/dashboard',
          '/login',
          '/signup',
          '/reveal-success',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://rent.fasteraim.com/sitemap.xml',
  }
}