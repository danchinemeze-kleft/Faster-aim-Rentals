import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE_URL = 'https://rent.fasteraim.com';

// Public pages only. Private pages (dashboard, wallet, my-account,
// payment success pages, admin) are left out on purpose.
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
  { path: '/connected', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/veryland', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/list', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/affiliate', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/account', changeFrequency: 'monthly', priority: 0.5 },
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, created_at')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error || !listings) {
    console.error('Error fetching listings for sitemap:', error);
    return staticRoutes;
  }

  const dynamicRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${BASE_URL}/listing/${listing.id}`,
    lastModified: listing.created_at ? new Date(listing.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}