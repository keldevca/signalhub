import type { MetadataRoute } from 'next';
import { ALL_SLUGS } from './lib/categories';
import { SITE_URL } from './lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  const feeds: MetadataRoute.Sitemap = ALL_SLUGS.map((slug) => ({
    url: `${SITE_URL}/feed/${slug}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  return [...home, ...feeds];
}
