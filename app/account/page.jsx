import AccountClient from './AccountClient';

export const metadata = {
  title: 'Login or Create Account',
  description:
    'Login or create a free Mr. Rent account to list properties, save listings, reveal landlord contacts, and manage your rentals across Nigeria. Fast and secure.',
  keywords: [
    'login Mr Rent',
    'sign up Mr Rent',
    'create account Mr Rent',
    'register on Mr Rent',
    'Mr Rent login',
    'Mr Rent sign up',
    'landlord account Nigeria',
    'tenant account Nigeria',
    'property account Nigeria',
    'join Mr Rent',
    'create landlord account',
    'rent account Nigeria',
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
    title: 'Login or Create Account | Mr. Rent',
    description:
      'Login or create a free account on Mr. Rent to list properties or find verified rentals across Nigeria.',
    url: 'https://rent.fasteraim.com/account',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Login or Create Account on Mr. Rent',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login or Create Account | Mr. Rent',
    description:
      'Sign in or create a free account to list properties and find verified rentals in Nigeria.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/account',
  },
  category: 'Real Estate',
};

export default function AccountPage() {
  return <AccountClient />;
}