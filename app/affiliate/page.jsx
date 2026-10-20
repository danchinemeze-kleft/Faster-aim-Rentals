import AffiliateClient from './AffiliateClient'

export const metadata = {
  title: 'Affiliate Program | Mr. Rent',
  description:
    'Join the Mr. Rent affiliate program. Share your referral link, bring landlords and tenants to Mr. Rent, and earn rewards for every successful referral across Nigeria.',
  keywords: [
    'Mr Rent affiliate',
    'affiliate program Nigeria',
    'earn money referring tenants',
    'property rental referral Nigeria',
    'refer landlords Nigeria',
    'make money online Nigeria',
    'rent affiliate marketing',
  ],
  authors: [{ name: 'Faster Aim Technology Limited' }],
  creator: 'Faster Aim Technology Limited',
  publisher: 'Faster Aim Technology Limited',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Affiliate Program | Mr. Rent',
    description:
      'Share your referral link and earn rewards when people list or rent properties on Mr. Rent.',
    url: 'https://rent.fasteraim.com/affiliate',
    siteName: 'Mr. Rent',
    images: [
      {
        url: 'https://rent.fasteraim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mr. Rent Affiliate Program',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affiliate Program | Mr. Rent',
    description: 'Earn rewards by referring landlords and tenants to Mr. Rent.',
    images: ['https://rent.fasteraim.com/og-image.jpg'],
    creator: '@B_B_Rembow',
  },
  alternates: {
    canonical: 'https://rent.fasteraim.com/affiliate',
  },
}

export default function AffiliatePage() {
  return <AffiliateClient />
}