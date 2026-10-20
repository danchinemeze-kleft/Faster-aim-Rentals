import { Suspense } from 'react'
import ListingDetailClient from './ListingDetailClient'

export const metadata = {
  title: 'Property for Rent | Mr. Rent',
  description:
    'View property details, photos, price and location on Mr. Rent. Contact the landlord directly, with no agent fees. Houses, apartments, self-contain and more across Nigeria.',
  authors: [{ name: 'Faster Aim Technology Limited' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Property for Rent | Mr. Rent',
    description: 'View this property and contact the landlord directly on Mr. Rent. No agent fees.',
    siteName: 'Mr. Rent',
    images: [{ url: 'https://rent.fasteraim.com/og-image.jpg', width: 1200, height: 630, alt: 'Property for rent on Mr. Rent' }],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Property for Rent | Mr. Rent',
    description: 'View this property and contact the landlord directly on Mr. Rent.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
}

export default function ListingPage() {
  return (
    <Suspense fallback={null}>
      <ListingDetailClient />
    </Suspense>
  )
}