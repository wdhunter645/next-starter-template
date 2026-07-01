import type { MetadataRoute } from 'next';

import { PUBLIC_SITEMAP_ROUTES, SITE_URL } from '@/lib/publicSiteMetadata';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-07-01');

  return PUBLIC_SITEMAP_ROUTES.map((route) => ({
    url: `${SITE_URL}${route === '/' ? '/' : route}`,
    lastModified,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
