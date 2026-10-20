import BrowseClient from './BrowseClient';
import GoBackButton from '../components/GoBackButton';

export const metadata = {
  title: 'Browse Verified Properties for Rent in Nigeria',
  description:
    'Browse hundreds of verified houses, apartments, self-contains, duplexes and commercial properties for rent across Nigeria. Direct contact with verified landlords. No agent fees. Available in Lagos, Abuja, Awka, Onitsha, Enugu and more.',
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
    'commercial property for rent',
    'Anambra rentals',
    'Lagos apartments for rent',
    'Abuja houses for rent',
    'Enugu properties for rent',
    'Mr Rent',
    'Mr. Rent Nigeria',
    'verified landlords Nigeria',
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
    title: 'Browse Verified Properties for Rent in Nigeria | Mr. Rent',
    description:
      'Find verified houses, apartments and commercial properties for rent across Nigeria. Connect directly with landlords. No agent fees.',
    url: 'https://rent.fasteraim.com/browse',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Browse Verified Rental Properties on Mr. Rent',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Verified Properties for Rent in Nigeria | Mr. Rent',
    description:
      'Search verified houses and apartments for rent across Nigeria. Direct landlord contact. No agent fees.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow', // replace with your real Twitter handle if different
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/browse',
  },
  category: 'Real Estate',
};

export default function BrowsePage() {
  return <BrowseClient />;
}