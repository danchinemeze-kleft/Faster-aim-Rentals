export const metadata = {
  title: {
    default: 'Professional account | Mr. Rent',
    template: '%s | Mr. Rent Professionals',
  },
  description:
    'Join Mr. Rent as a verified lawyer or surveyor. Create your professional profile, submit documents for verification, and get found by people buying or renting property in Nigeria.',
  keywords: [
    'Mr. Rent',
    'professional account',
    'verified lawyer',
    'verified surveyor',
    'property lawyer Nigeria',
    'SURCON surveyor',
    'real estate professional',
    'Nigeria',
  ],
  openGraph: {
    title: 'Professional account | Mr. Rent',
    description:
      'Create a professional profile on Mr. Rent, get verified, and connect with people who need lawyers and surveyors for property deals.',
    type: 'website',
    siteName: 'Mr. Rent',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional account | Mr. Rent',
    description:
      'Create a professional profile on Mr. Rent, get verified, and connect with people who need lawyers and surveyors for property deals.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ProLayout({ children }) {
  return children
}