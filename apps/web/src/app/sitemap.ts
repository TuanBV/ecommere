import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    '',
    '/products',
    '/about',
    '/contact',
    '/news',
    '/policy/shipping',
    '/policy/payment',
    '/policy/warranty',
    '/policy/return-exchange',
    '/policy/general-regulations',
    '/policy/terms-of-use-and-privacy'
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/products' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/products' ? 0.9 : 0.7
  }));
}
