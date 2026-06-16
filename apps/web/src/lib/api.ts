export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const serverApiBaseUrl = process.env.API_INTERNAL_URL ?? apiBaseUrl;
export const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? 'http://localhost:3001';

export type Product = {
  id: string;
  title: string;
  slug: string | null;
  sku: string;
  price: string;
  salePrice: string;
  stockQty: number;
  image: string | null;
  description?: string | null;
  category?: { title: string; slug: string | null };
  brand?: { title: string; slug: string | null };
};

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${serverApiBaseUrl}${path}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

export function mediaUrl(path?: string | null) {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  return `${mediaBaseUrl}${path}`;
}

export function mediaVariantUrl(
  path: string | null | undefined,
  variant: 'mobile' | 'tablet' | 'pc'
) {
  if (!path) return '/placeholder.png';
  if (/\.(avif|webp|png|jpe?g|gif|svg)$/i.test(path)) return mediaUrl(path);
  if (path.startsWith('http')) return `${path}_${variant}.webp`;
  return `${mediaBaseUrl}${path}_${variant}.webp`;
}

export function money(value: string | number) {
  return Number(value).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
}
