'use client';

import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { type FormEvent, useMemo } from 'react';

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

type FilterValues = {
  q: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  inStock: string;
};

export function ProductListControls({
  categories,
  values,
}: {
  categories: Category[];
  values: FilterValues;
}) {
  const hasAnyFilter = useMemo(
    () =>
      Boolean(
        values.q ||
        values.category ||
        values.brand ||
        values.minPrice ||
        values.maxPrice ||
        values.sort ||
        values.inStock
      ),
    [values]
  );

  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === values.category),
    [categories, values.category]
  );

  const activeBrand = useMemo(() => {
    if (!values.brand) return null;

    return (
      categories
        .flatMap((category) => category.brands ?? [])
        .find((brand) => brand.slug === values.brand) ?? null
    );
  }, [categories, values.brand]);

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const key of ['q', 'minPrice', 'maxPrice', 'sort', 'category', 'brand']) {
      const value = String(formData.get(key) ?? '').trim();

      if (!value) continue;
      if (key === 'sort' && value === 'newest') continue;

      params.set(key, value);
    }

    if (formData.get('inStock') === 'true') {
      params.set('inStock', 'true');
    }

    const query = params.toString();
    window.location.href = query ? `/products?${query}` : '/products';
  }

  return (
    <aside className="w-full min-w-0">
      <div className="grid min-w-0 gap-4">
        <form
          onSubmit={submitFilters}
          className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex min-w-0 items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold uppercase text-white">
            <SlidersHorizontal size={18} className="shrink-0" />
            <span className="truncate text-sm">Bộ lọc sản phẩm</span>
          </div>

          <div className="grid min-w-0 gap-4">
            {(activeCategory || activeBrand) && (
              <div className="min-w-0 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <div className="text-xs font-semibold uppercase text-blue-700">Đang lọc</div>

                <div className="mt-2 flex min-w-0 flex-wrap gap-2">
                  {activeCategory ? (
                    <span className="max-w-full truncate rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm">
                      {activeCategory.title}
                    </span>
                  ) : null}

                  {activeBrand ? (
                    <span className="max-w-full truncate rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm">
                      {activeBrand.title}
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            <label className="grid min-w-0 gap-2">
              <span className="text-sm font-semibold uppercase text-gray-600">Tìm kiếm</span>

              <div className="relative min-w-0">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 shrink-0 -translate-y-1/2 text-gray-400"
                />

                <input
                  name="q"
                  defaultValue={values.q}
                  placeholder="Tên sản phẩm, SKU..."
                  className="h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-base font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </label>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold uppercase text-gray-600">Giá từ</span>

                <input
                  name="minPrice"
                  type="number"
                  min="0"
                  defaultValue={values.minPrice}
                  placeholder="0"
                  className="h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-base font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold uppercase text-gray-600">Đến</span>

                <input
                  name="maxPrice"
                  type="number"
                  min="0"
                  defaultValue={values.maxPrice}
                  placeholder="50000000"
                  className="h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-base font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>

            <label className="grid min-w-0 gap-2">
              <span className="text-sm font-semibold uppercase text-gray-600">Sắp xếp</span>

              <select
                name="sort"
                defaultValue={values.sort || 'newest'}
                className="h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-base font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
                <option value="best_seller">Bán chạy</option>
              </select>
            </label>

            <label className="flex min-w-0 items-start gap-3 rounded-xl border border-gray-200 px-3 py-3 text-base font-medium text-gray-700">
              <input
                type="checkbox"
                name="inStock"
                value="true"
                defaultChecked={values.inStock === 'true'}
                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600"
              />

              <span className="min-w-0 leading-6">Chỉ hiển thị sản phẩm còn hàng</span>
            </label>

            {values.category ? <input type="hidden" name="category" value={values.category} /> : null}
            {values.brand ? <input type="hidden" name="brand" value={values.brand} /> : null}

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
              <button className="h-12 min-w-0 rounded-xl bg-blue-600 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700">
                Áp dụng
              </button>

              {hasAnyFilter ? (
                <Link
                  href="/products"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                  aria-label="Xóa bộ lọc"
                >
                  <X size={18} />
                </Link>
              ) : null}
            </div>
          </div>
        </form>

        <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
          <div className="rounded-2xl bg-blue-50 p-4 text-base leading-7 text-gray-700">
            <div className="font-semibold text-blue-800">Cần tư vấn?</div>

            <p className="mt-1">Gọi hotline để được hỗ trợ chọn sản phẩm phù hợp.</p>

            <a href="tel:0852262666" className="mt-3 inline-block font-bold text-blue-700">
              0852 262 666
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
