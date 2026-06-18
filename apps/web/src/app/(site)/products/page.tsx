import { ProductCard } from '@/components/product-card';
import { Product, apiGet } from '@/lib/api';
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
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);

  const [products, categories] = await Promise.all([
    apiGet<Product[]>(`/products?${query.toString()}`).catch(() => []),
    apiGet<Category[]>('/categories').catch(() => [])
  ]);

  return (
    <main className="container py-8">
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="mt-2 text-3xl font-semibold text-gray-800 md:text-4xl">Sản phẩm</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <ProductListControls
          categories={categories}
          values={{
            q: params.q ?? '',
            category: params.category ?? '',
            brand: params.brand ?? '',
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white px-5 py-12 text-center text-sm font-semibold text-gray-500 shadow-sm">
              Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
