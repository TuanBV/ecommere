import { ProductCard } from '@/components/product-card';
import { Pagination } from '@/components/pagination';
import { Product, apiGet, apiGetWithMeta } from '@/lib/api';
import { ProductListControls } from './product-list-controls';

type CategoryBrand = {
  id: string;
  title: string;
  slug: string | null;
};

type Category = {
  id: string;
  title: string;
  slug: string | null;
  brands?: CategoryBrand[];
};

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const category = params['danh-muc'] ?? params.category ?? '';
  const brand = params['thuong-hieu'] ?? params.brand ?? '';
  const publicParams = {
    ...params,
    category: undefined,
    brand: undefined,
    'danh-muc': category || undefined,
    'thuong-hieu': brand || undefined
  };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value || ['danh-muc', 'thuong-hieu', 'category', 'brand'].includes(key)) continue;
    query.set(key, value);
  }
  if (category) query.set('category', category);
  if (brand) query.set('brand', brand);
  if (!query.has('limit')) query.set('limit', '12');

  const [productResult, categories] = await Promise.all([
    apiGetWithMeta<Product[]>(`/products?${query.toString()}`).catch(() => ({
      data: [],
      meta: { page: 1, limit: 12, total: 0, totalPages: 1 }
    })),
    apiGet<Category[]>('/categories').catch(() => [])
  ]);
  const products = productResult.data;

  return (
    <main className="container pb-8">
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-800 md:text-4xl">Sản phẩm</h1>
      </div>

      <ProductListControls
        categories={categories}
        values={{
          q: params.q ?? '',
          category,
          brand,
          minPrice: params.minPrice ?? '',
          maxPrice: params.maxPrice ?? '',
          sort: params.sort ?? 'newest',
          inStock: params.inStock ?? ''
        }}
      />

      <section>
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <span className="font-semibold text-gray-700">Danh sách sản phẩm</span>
          <span className="text-base text-gray-600">{products.length} sản phẩm</span>
        </div>

        {products.length ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-5 py-12 text-center text-sm font-semibold text-gray-500 shadow-sm">
            Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
          </div>
        )}

        <Pagination meta={productResult.meta} basePath="/san-pham" params={publicParams} />
      </section>
    </main>
  );
}
