export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account',
        '/dashboard',
        '/my-account',
        '/reveal-success',  // ← add this
        '/api/',
      ],
    },
    sitemap: 'https://rent.fasteraim.com/sitemap.xml',
  }
}