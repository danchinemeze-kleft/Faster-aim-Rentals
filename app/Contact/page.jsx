import ContactClient from './ContactClient';

/** @type {import('next').Metadata} */
export const metadata = {
  title: 'Contact Us - Mr. Rent',
  description: 'Get in touch with Mr. Rent. Have questions, complaints, or partnership proposals? We would love to hear from you.',
  alternates: {
    canonical: 'https://rent.fasteraim.com/contact',
  },
  openGraph: {
    title: 'Contact Us - Mr. Rent',
    description: 'Get in touch with Mr. Rent. Have questions, complaints, or partnership proposals? We would love to hear from you.',
    url: 'https://rent.fasteraim.com/contact',
    siteName: 'Mr. Rent',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us - Mr. Rent',
    description: 'Get in touch with Mr. Rent.',
  },
};

export default function Page() {
  return <ContactClient />;
}
