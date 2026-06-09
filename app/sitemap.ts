export default function sitemap() {
  const baseUrl = 'https://rent.fasteraim.com'
  const lastModified = new Date()

  return [
    // Core pages
    { url: baseUrl, lastModified, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${baseUrl}/browse`, lastModified, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/search`, lastModified, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/list`, lastModified, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/contact`, lastModified, priority: 0.6, changeFrequency: 'monthly' },

    // Legal
    { url: `${baseUrl}/privacy-policy`, lastModified, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/terms-of-service`, lastModified, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/refund-policy`, lastModified, priority: 0.3, changeFrequency: 'yearly' },

    // NOT included (private/noindex):
    // /account, /my-account, /dashboard, /login, /signup, /reveal-success, /api/*
  ]
}