import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    '',
    '/san-pham',
    '/ve-chung-toi',
    '/lien-he',
    '/tin-tuc',
    '/chinh-sach/quy-dinh-chung',
    '/chinh-sach/dieu-khoan-su-dung-va-bao-mat',
    '/chinh-sach/bao-hanh',
    '/chinh-sach/thanh-toan',
    '/chinh-sach/van-chuyen',
    '/chinh-sach/doi-tra'
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/san-pham' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/san-pham' ? 0.9 : 0.7
  }));
}
