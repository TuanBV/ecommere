export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const serverApiBaseUrl =
  process.env.API_INTERNAL_URL ??
  (typeof window === 'undefined' ? 'http://localhost:3001/api' : apiBaseUrl);
export const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '';

const internalMediaOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3010',
  'http://127.0.0.1:3010',
  'http://api:3001'
];

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

export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${serverApiBaseUrl}${path}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

export async function apiGetWithMeta<T>(
  path: string
): Promise<{ data: T; meta?: Partial<ApiMeta> }> {
  const res = await fetch(`${serverApiBaseUrl}${path}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = (await res.json()) as { data: T; meta?: Partial<ApiMeta> };
  return { data: json.data, meta: json.meta };
}

export function mediaUrl(path?: string | null) {
  if (!path) return '/placeholder.png';
  for (const origin of internalMediaOrigins) {
    if (path.startsWith(origin)) return path.replace(origin, '');
  }
  if (path.startsWith('http')) return path;
  return `${mediaBaseUrl}${path}`;
}

export function mediaVariantUrl(
  path: string | null | undefined,
  variant: 'mobile' | 'tablet' | 'pc'
) {
  if (!path) return '/placeholder.png';
  const normalizedPath = internalMediaOrigins.reduce(
    (current, origin) => (current.startsWith(origin) ? current.replace(origin, '') : current),
    path
  );

  const variantPath = normalizedPath.replace(
    /_(pc|mobile|tablet)(\.(avif|webp|png|jpe?g))$/i,
    `_${variant}$2`
  );

  if (variantPath !== normalizedPath) return mediaUrl(variantPath);
  if (/\.(avif|webp|png|jpe?g|gif|svg)$/i.test(normalizedPath)) return mediaUrl(normalizedPath);
  if (normalizedPath.startsWith('http')) return `${normalizedPath}_${variant}.webp`;
  if (path.startsWith('http')) return `${path}_${variant}.webp`;
  return `${mediaBaseUrl}${normalizedPath}_${variant}.webp`;
}

export function money(value: string | number) {
  return Number(value).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
}
