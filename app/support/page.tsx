import SupportClient from './supportClient';

export const metadata = {
  title: 'Contact & Support',
  description:
    'Need help with a listing, payment, account or verification? Contact the Mr. Rent support team. We reply within 24 hours. Call, email or send a message.',
  keywords: [
    'Mr Rent support',
    'contact Mr Rent',
    'Mr Rent customer care',
    'help with listing',
    'payment problem Mr Rent',
    'report scam Mr Rent',
    'Mr Rent phone number',
    'Mr Rent email',
  ],
  authors: [{ name: 'Faster Aim Technology Limited' }],
  creator: 'Faster Aim Technology Limited',
  publisher: 'Faster Aim Technology Limited',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Contact & Support | Mr. Rent',
    description:
      'Get help with listings, payments or your account. Mr. Rent support team replies within 24 hours.',
    url: 'https://rent.fasteraim.com/support',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Mr. Rent Support',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact & Support | Mr. Rent',
    description: 'Need help? Contact Mr. Rent support team anytime.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/support',
  },
};

export default function SupportPage() {
  return <SupportClient />;
}