import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Product, apiGet } from '@/lib/api';

type Category = { id: string; title: string; slug: string | null };

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
        <div className="text-base text-gray-600">Trang chủ / Sản phẩm</div>
        <h1 className="mt-2 text-3xl font-semibold text-gray-800 md:text-4xl">Sản phẩm</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 rounded-xl bg-blue-700 px-4 py-3 font-semibold uppercase text-white">
            Danh mục sản phẩm
          </div>
          <nav className="grid gap-1 text-base font-medium text-gray-700">
            <Link
              href="/products"
              className="rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700"
            >
              Tất cả sản phẩm
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug ?? ''}`}
                className="rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700"
              >
                {category.title}
              </Link>
            ))}
          </nav>
          <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-base leading-7 text-gray-700">
            <div className="font-semibold text-blue-800">Cần tư vấn?</div>
            <p className="mt-1">Gọi hotline để được hỗ trợ chọn sản phẩm phù hợp.</p>
            <a href="tel:0852262666" className="mt-3 inline-block font-bold text-blue-700">
              0852 262 666
            </a>
          </div>
        </aside>
        <section>
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
            <span className="font-semibold text-gray-700">Danh sách sản phẩm</span>
            <span className="text-base text-gray-600">{products.length} sản phẩm</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
