import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE_URL = 'https://rent.fasteraim.com';
const PER_SITEMAP = 1000;

// Public pages only. Private or transactional pages (account, dashboard,
// wallet, my-account, payment success pages, admin) are left out on purpose.
const STATIC_PAGES: {
  path: string;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
}[] = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/browse', changeFrequency: 'daily', priority: 0.9 },
  { path: '/download', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/search', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/veryland', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/list', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/affiliate', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/tenant-subscribe', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/subscribe', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/reviews', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/support', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/all-pages', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/refund-policy', changeFrequency: 'yearly', priority: 0.3 },
];

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

// In Next.js 16 the id can arrive as a promise or a string, so normalise it.
export default async function sitemap(props: {
  id: Promise<string | number> | string | number;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id) || 0;
  const offset = id * PER_SITEMAP;

  // Static pages go in the first sitemap only (id = 0)
  const staticRoutes: MetadataRoute.Sitemap =
    id === 0
      ? STATIC_PAGES.map((p) => ({
          url: `${BASE_URL}${p.path}`,
          lastModified: new Date(),
          changeFrequency: p.changeFrequency,
          priority: p.priority,
        }))
      : [];

  // Query available listings from public.listings table
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, created_at')
    .eq('is_available', true)
    .range(offset, offset + PER_SITEMAP - 1);

  if (error || !listings) {
    console.error('Error fetching listings for sitemap chunk:', error);
    return staticRoutes;
  }

  // The listing page route is /listing/[id] (singular)
  const dynamicRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${BASE_URL}/listing/${listing.id}`,
    lastModified: listing.created_at ? new Date(listing.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}