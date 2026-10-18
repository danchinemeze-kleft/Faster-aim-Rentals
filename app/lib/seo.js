export const SITE_URL = 'https://rent.fasteraim.com';
export const SITE_NAME = 'Mr. Rent';

export function pageMeta({ title, description, path, noindex = false }) {
  const url = `${SITE_URL}${path}`;
  const full = `${title} - ${SITE_NAME}`;
  return {
    title, // the root template adds " - Mr. Rent"
    description,
    alternates: { canonical: url },
    openGraph: {
      title: full,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_NG',
    },
    twitter: { card: 'summary_large_image', title: full, description },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function breadcrumbJsonLd(trail) {
  const items = [{ name: 'Home', path: '/' }, ...trail];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}