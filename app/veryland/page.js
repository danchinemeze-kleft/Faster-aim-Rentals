import VerylandClient from './verylandClient';

export const metadata = {
  title: 'Veryland – Verified Properties',
  description:
    'Veryland is Mr. Rent’s document verification system. See properties that have passed ownership and document checks for safer rentals across Nigeria.',
  keywords: [
    'Veryland',
    'verified properties Nigeria',
    'document verification property',
    'verified landlords Nigeria',
    'safe rentals Nigeria',
    'property verification',
    'C of O verification',
    'Mr Rent Veryland',
    'avoid property scam Nigeria',
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
    title: 'Veryland – Verified Properties | Mr. Rent',
    description:
      'Properties that have passed document and ownership verification on Mr. Rent. Rent with more confidence.',
    url: 'https://rent.fasteraim.com/veryland',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Veryland Verified Properties',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veryland – Verified Properties | Mr. Rent',
    description:
      'See properties verified through Mr. Rent’s Veryland system for safer renting in Nigeria.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/veryland',
  },
  category: 'Real Estate',
};

export default function VerylandPage() {
  return <VerylandClient />;
}