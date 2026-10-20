import FAQClient from './FaqClient';

export const metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about finding rentals, listing properties, payments, verification, contact reveal and how Mr. Rent works in Nigeria.',
  keywords: [
    'Mr Rent FAQ',
    'how Mr Rent works',
    'contact reveal fee',
    'how to list property',
    'is Mr Rent safe',
    'property verification Nigeria',
    'Mr Rent questions',
    'rental FAQ Nigeria',
  ],
  authors: [{ name: 'Faster Aim Technology Limited' }],
  creator: 'Faster Aim Technology Limited',
  publisher: 'Faster Aim Technology Limited',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Frequently Asked Questions | Mr. Rent',
    description:
      'Get clear answers about listings, payments, verification and how to use Mr. Rent.',
    url: 'https://rent.fasteraim.com/faq',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mr. Rent FAQ',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Mr. Rent',
    description: 'Common questions about using Mr. Rent answered clearly.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/faq',
  },
};

export default function FAQPage() {
  return <FAQClient />;
}