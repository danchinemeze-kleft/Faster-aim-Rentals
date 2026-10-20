import HomeClient from './HomeClient'; // change this if your client component has a different name

export const metadata = {
  title: 'Home',
  description:
    'Find verified houses, apartments, self-contains and land for rent across Nigeria. AI-powered search, direct landlord contact, no agent fees. Available in Lagos, Abuja, Awka, Onitsha, Enugu and more on Mr. Rent.',
  keywords: [
    'houses for rent in Nigeria',
    'apartments for rent Nigeria',
    'self contain for rent',
    'flat for rent Lagos',
    'duplex for rent Abuja',
    'properties for rent Awka',
    'houses for rent Onitsha',
    'verified rental properties Nigeria',
    'direct landlord rentals',
    'no agent fee rentals',
    'cheap apartments for rent Nigeria',
    '2 bedroom flat for rent',
    '3 bedroom house for rent',
    'rent house Nigeria',
    'AI property search Nigeria',
    'Mr Rent',
    'Mr. Rent Nigeria',
    'verified landlords Nigeria',
    'rent apartment without agent',
    'find house for rent online Nigeria',
  ],
  authors: [{ name: 'Faster Aim Technology Limited' }],
  creator: 'Faster Aim Technology Limited',
  publisher: 'Faster Aim Technology Limited',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Mr. Rent – Find Verified Rentals in Nigeria',
    description:
      'AI-powered platform to find verified houses and apartments for rent across Nigeria. Connect directly with landlords. No agent fees.',
    url: 'https://rent.fasteraim.com',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mr. Rent - Verified Properties for Rent in Nigeria',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mr. Rent – Find Verified Rentals in Nigeria',
    description:
      'Find verified houses and apartments for rent across Nigeria. Direct landlord contact. No agent fees. Powered by AI.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com',
  },
  category: 'Real Estate',
};

export default function HomePage() {
  return <HomeClient />;
}