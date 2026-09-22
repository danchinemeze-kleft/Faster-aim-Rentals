import { MetadataRoute } from 'next';

const BASE_URL = 'https://rent.fasteraim.com';
const PER_SITEMAP = 1000; // Adjust chunk size based on your database size

// 1. Next.js calls this first to determine how many sitemaps to create
export async function generateSitemaps() {
  // Fetch total count of properties from your database/API
  // const totalProperties = await getPropertyCount();
  const totalProperties = 5000; // Example count
  
  const totalSitemaps = Math.ceil(totalProperties / PER_SITEMAP);

  // Returns array of IDs: [{ id: 0 }, { id: 1 }, { id: 2 }, ...]
  return Array.from({ length: totalSitemaps }, (_, id) => ({ id }));
}

// 2. Next.js calls this function for each ID generated above
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  // On the first sitemap (id = 0), include your core static routes
  const staticRoutes: MetadataRoute.Sitemap = id === 0 ? [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ] : [];

  // Fetch the specific slice of rental properties for this sitemap ID
  const offset = id * PER_SITEMAP;
  
  // Replace this with your actual database query/API call:
  // const properties = await getProperties({ limit: PER_SITEMAP, offset });
  const properties = []; // Fetch properties for this chunk

  const dynamicRoutes: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${BASE_URL}/rentals/${property.slug}`,
    lastModified: new Date(property.updatedAt),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}