import FaqClient from './FaqClient'
import { FAQS } from './faq-data'

export const metadata = {
  title: 'FAQ | Mr. Rent',
  description:
    'Answers to common questions about finding, listing and renting property on Mr. Rent, plus how affiliate rewards work.',
  alternates: { canonical: 'https://rent.fasteraim.com/faq' },
  openGraph: {
    title: 'FAQ | Mr. Rent',
    description: 'Answers to common questions about renting and listing on Mr. Rent.',
    url: 'https://rent.fasteraim.com/faq',
    siteName: 'Mr. Rent',
    type: 'website',
  },
}

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${f.brief} ${String(f.detail).replace(/<[^>]+>/g, '')}`.trim(),
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqClient />
    </>
  )
}