import ListClient from './ListClient'; // change if needed

export const metadata = {
  title: 'List Your Property for Rent',
  description:
    'List your house, apartment, self-contain or commercial property for rent on Mr. Rent. Reach verified tenants directly. First 2 listings free every month. No agent needed.',
  keywords: [
    'list property for rent Nigeria',
    'post house for rent',
    'list apartment for rent',
    'landlord list property',
    'rent out my house Nigeria',
    'list self contain for rent',
    'free property listing Nigeria',
    'direct tenant contact',
    'list property without agent',
    'Mr Rent list property',
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
    title: 'List Your Property for Rent | Mr. Rent',
    description:
      'List your property and connect directly with verified tenants across Nigeria. First 2 listings free.',
    url: 'https://rent.fasteraim.com/list',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'List Your Property on Mr. Rent',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Property for Rent | Mr. Rent',
    description:
      'Reach verified tenants directly. List your house or apartment for free on Mr. Rent.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/list',
  },
  category: 'Real Estate',
};

export default function ListPage() {
  return <ListClient />;
}