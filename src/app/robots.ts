import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/publicSiteMetadata';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/fanclub/', '/api/', '/_ai-review/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
