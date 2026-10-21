export const metadata = {
  title: 'Ask Mr. Rent AI | Find Properties for Rent in Nigeria',
  description:
    'Chat with Mr. Rent AI to find houses, apartments and self-contain for rent in Nigeria. Ask about areas, prices and property types and get instant guidance. No agent fees.',
  authors: [{ name: 'Faster Aim Technology Limited' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Ask Mr. Rent AI | Find Properties in Nigeria',
    description: 'Ask about properties, areas and prices anywhere in Nigeria.',
    url: 'https://rent.fasteraim.com/search',
    siteName: 'Mr. Rent',
    images: [{ url: 'https://rent.fasteraim.com/og-image.jpg', width: 1200, height: 630, alt: 'Ask Mr. Rent AI' }],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask Mr. Rent AI | Find Properties in Nigeria',
    description: 'Chat with Mr. Rent AI to find your next home across Nigeria.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: { canonical: 'https://rent.fasteraim.com/search' },
}

export default function SearchLayout({ children }) {
  return children
}