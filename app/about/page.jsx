import AboutClient from './AboutClient';

export const metadata = {
  title: 'About Us',
  description:
    'Learn about Mr. Rent — the AI-powered property platform built by Faster Aim Technology to help Nigerians find verified houses and apartments for rent without scams or agent fees.',
  keywords: [
    'about Mr Rent',
    'Mr Rent Nigeria',
    'Faster Aim Technology',
    'AI property platform Nigeria',
    'verified rentals Nigeria',
    'no agent fee rentals',
    'property tech Nigeria',
    'Awka property platform',
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
    title: 'About Us | Mr. Rent',
    description:
      'Mr. Rent is an AI-powered platform helping Nigerians find verified rentals and connect directly with landlords.',
    url: 'https://rent.fasteraim.com/about',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'About Mr. Rent',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Mr. Rent',
    description:
      'Learn how Mr. Rent is making property rental safer and easier in Nigeria.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/about',
  },
  category: 'Real Estate',
};

export default function AboutPage() {
  return <AboutClient />;
}