import BuyClient from './BuyClient';

/** @type {import('next').Metadata} */
export const metadata = {
  title: 'Buy Land & Property - Mr. Rent',
  description:
    'Browse verified land and properties for sale across Nigeria. Verified listings show seller contact freely — no payment needed.',
  alternates: {
    canonical: 'https://rent.fasteraim.com/buy',
  },
  openGraph: {
    title: 'Buy Land & Property - Mr. Rent',
    description:
      'Browse verified land and properties for sale across Nigeria. Verified listings show seller contact freely — no payment needed.',
    url: 'https://rent.fasteraim.com/buy',
    siteName: 'Mr. Rent',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Buy Land & Property - Mr. Rent',
    description:
      'Browse verified land and properties for sale across Nigeria.',
  },
};

export default function Page() {
  return <BuyClient />;
}