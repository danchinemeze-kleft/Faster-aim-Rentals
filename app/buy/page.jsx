import BuyClient from './BuyClient';

export const metadata = {
  title: 'Buy Verified Properties & Land in Nigeria | Rent.FasterAim',
  description: 'Explore and buy verified houses, flats, commercial spaces, and land across Nigeria. Direct owner deals, clear titles, and AI-assisted property matching.',
  keywords: [
    'buy property in Nigeria',
    'houses for sale Anambra',
    'buy land Lagos',
    'verified property for sale',
    'real estate Nigeria',
    'buy house Nigeria',
    'FasterAim real estate',
  ],
  openGraph: {
    title: 'Explore & Buy Verified Properties & Land in Nigeria',
    description: 'Browse verified residential and commercial properties for sale across Nigeria with transparent pricing and verified ownership.',
    url: 'https://rent.fasteraim.com/buy',
    siteName: 'Rent.FasterAim',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-buy-properties.jpg', // Replace with your actual OG image path
        width: 1200,
        height: 630,
        alt: 'Buy Verified Properties & Land on Rent.FasterAim',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy Verified Properties & Land in Nigeria | Rent.FasterAim',
    description: 'Explore and buy verified houses, flats, commercial spaces, and land across Nigeria.',
    images: ['https://rent.fasteraim.com/og-buy-properties.jpg'],
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/buy',
  },
};

export default function BuyPage() {
  return <BuyClient />;
}