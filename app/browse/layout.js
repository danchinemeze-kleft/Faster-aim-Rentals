export const metadata = {
  title: 'Browse Properties for Rent in Nigeria | Mr. Rent',
  description:
    'Browse houses, apartments, self-contain, duplexes and commercial properties for rent across Nigeria. Filter by location, price and type, and contact landlords directly with no agent fees.',
  keywords: [
    'browse properties for rent Nigeria',
    'houses for rent Nigeria',
    'apartments for rent',
    'self contain for rent',
    'rent without agent Nigeria',
    'Mr Rent',
  ],
  authors: [{ name: 'Faster Aim Technology Limited' }],
  creator: 'Faster Aim Technology Limited',
  publisher: 'Faster Aim Technology Limited',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Browse Properties for Rent | Mr. Rent',
    description:
      'Find houses and apartments for rent across Nigeria and contact landlords directly. No agent fees.',
    url: 'https://rent.fasteraim.com/browse',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Browse properties on Mr. Rent',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Properties for Rent | Mr. Rent',
    description: 'Find houses and apartments for rent across Nigeria on Mr. Rent.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/browse',
  },
}

export default function BrowseLayout({ children }) {
  return children
}