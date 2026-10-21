import { Suspense } from 'react'
import SearchClient from './SearchClient'

export const metadata = {
  title: 'Ask Mr. Rent AI | Find Properties for Rent in Nigeria',
  description:
    'Chat with Mr. Rent AI to find houses, apartments and self-contain for rent in Nigeria. Ask about areas, prices and property types and get instant guidance. No agent fees.',
  keywords: [
    'Mr Rent AI',
    'find house for rent Nigeria',
    'AI property search Nigeria',
    'apartment for rent near me',
    'rent prices in Nigeria',
    'property search assistant',
    'rent without agent Nigeria',
  ],
  authors: [{ name: 'Faster Aim Technology Limited' }],
  creator: 'Faster Aim Technology Limited',
  publisher: 'Faster Aim Technology Limited',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Ask Mr. Rent AI | Find Properties in Nigeria',
    description:
      'Ask about properties, areas and prices anywhere in Nigeria and get instant answers from Mr. Rent AI.',
    url: 'https://rent.fasteraim.com/search',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ask Mr. Rent AI',
      },
    ],
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
  alternates: {
    canonical: 'https://rent.fasteraim.com/search',
  },
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchClient />
    </Suspense>
  )
}