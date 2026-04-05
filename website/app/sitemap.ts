import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.avdheshanandg.org';

  const staticPages = [
    '',
    '/about',
    '/schedule',
    '/donate',
    '/volunteer',
    '/articles',
    '/books',
    '/podcasts',
    '/videos',
    '/gallery',
    '/live',
    '/panchang',
    '/privacy',
    '/terms',
  ];

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : route === '/donate' ? 0.9 : 0.7,
  }));
}
