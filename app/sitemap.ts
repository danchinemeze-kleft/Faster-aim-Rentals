import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE_URL = 'https://rent.fasteraim.com';
const PER_SITEMAP = 1000;

export async function generateSitemaps() {
  const { count, error } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true);

  if (error) {
    console.error('Error fetching listing count for sitemap:', error);
  }

  const totalListings = count || 0;
  const totalSitemaps = Math.max(1, Math.ceil(totalListings / PER_SITEMAP));

  return Array.from({ length: totalSitemaps }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const offset = id * PER_SITEMAP;

  // Primary static routes included in the main index (id = 0)
  const staticRoutes: MetadataRoute.Sitemap = id === 0 ? [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ] : [];

  // Query available listings from public.listings table
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, created_at, price_period')
    .eq('is_available', true)
    .range(offset, offset + PER_SITEMAP - 1);

  if (error || !listings) {
    console.error('Error fetching listings for sitemap chunk:', error);
    return staticRoutes;
  }

  // Map listings to dynamic property URLs
  const dynamicRoutes: MetadataRoute.Sitemap = listings.map((listing) => {
    // ⚠️ UPDATE HERE: Change '/listings/' to match your Next.js route path (e.g. /rentals/ or /properties/)
    return {
      url: `${BASE_URL}/listings/${listing.id}`, 
      lastModified: listing.created_at ? new Date(listing.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...dynamicRoutes];
}