import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://rent.fasteraim.com'

export async function generateMetadata({ params }) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: l } = await supabase
    .from('listings_public')
    .select('title, location, city, state, images, property_type')
    .eq('id', id)
    .maybeSingle()

  if (!l) {
    return { title: 'Property | Mr. Rent' }
  }

  const title = `${l.title} | Mr. Rent`
  const where = [l.location, l.city, l.state].filter(Boolean).join(', ')
  const description = `${where}. See photos and details on Mr. Rent.`
  const image = (Array.isArray(l.images) && l.images[0]) || `${BASE_URL}/icon.png`
  const url = `${BASE_URL}/listing/${id}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'Mr. Rent', images: [image], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default function ListingLayout({ children }) {
  return children
}