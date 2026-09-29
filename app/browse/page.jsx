import BrowseClient from './BrowseClient';

import GoBackButton from '@/app/components/GoBackButton'
export const metadata = {
  title: 'Available Properties - Browse Rental Properties in Nigeria | ',
  description:
    'Explore verified apartments, flats, self-contains, duplexes, and commercial properties across Nigeria. Direct landlord connections with transparent verification.',
  keywords: [
    'rentals in Nigeria',
    'apartments for rent',
    'browse houses',
    'flat for rent',
    'Anambra rentals',
    'Lagos apartments',
    'direct landlord properties',
  ],
  openGraph: {
    title: 'Browse Verified Rental Properties | Rent.FasterAim',
    description:
      'Search and filter verified rental listings across Nigeria. Connect directly with landlords.',
    url: 'https://rent.fasteraim.com/browse',
    siteName: 'Rent.FasterAim',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg', // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: 'Browse Listings on Rent.FasterAim',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Verified Rental Properties | Rent.FasterAim',
    description:
      'Search verified rental properties across Nigeria and connect directly with verified landlords.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/browse',
  },
};

export default function BrowsePage() {
  return <BrowseClient />;
}