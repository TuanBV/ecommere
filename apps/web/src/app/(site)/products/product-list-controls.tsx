'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

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
  values
}: {
  categories: Category[];
  values: FilterValues;
}) {
  const [formValues, setFormValues] = useState(values);
  const [selectedCategory, setSelectedCategory] = useState(values.category);
  const [selectedBrand, setSelectedBrand] = useState(values.brand);

  useEffect(() => {
    setFormValues(values);
    setSelectedCategory(values.category);
    setSelectedBrand(values.brand);
  }, [
    values.q,
    values.category,
    values.brand,
    values.minPrice,
    values.maxPrice,
    values.sort,
    values.inStock
  ]);
  const hasAnyFilter = useMemo(
    () =>
      Boolean(
        values.q ||
        values.category ||
        values.brand ||
        values.minPrice ||
        values.maxPrice ||
        (values.sort && values.sort !== 'newest') ||
        values.inStock
      ),
    [values]
  );

  const brandOptions = useMemo(() => {
    const source = selectedCategory
      ? (categories.find((category) => category.slug === selectedCategory)?.brands ?? [])
      : categories.flatMap((category) => category.brands ?? []);
    const unique = new Map<string, CategoryBrand>();

    for (const brand of source) {
      if (brand.slug) unique.set(brand.slug, brand);
    }

    return [...unique.values()].sort((a, b) => a.title.localeCompare(b.title, 'vi'));
  }, [categories, selectedCategory]);

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const key of ['q', 'danh-muc', 'thuong-hieu', 'minPrice', 'maxPrice', 'sort']) {
      const value = String(formData.get(key) ?? '').trim();
      if (!value) continue;
      if (key === 'sort' && value === 'newest') continue;
      params.set(key, value);
    }

    if (formData.get('inStock') === 'true') params.set('inStock', 'true');

    const query = params.toString();
    window.location.href = query ? `/san-pham?${query}` : '/san-pham';
  }

  return (
    <section className="mb-6">
      <form
        onSubmit={submitFilters}
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
      >
        <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_1fr_1.05fr_auto_auto] xl:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-gray-700">Tìm kiếm</span>
            <div className="relative">
              <input
                name="q"
                value={formValues.q}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, q: event.target.value }))
                }
                placeholder="Tên sản phẩm..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm font-semibold text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <Search
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-gray-700">Danh mục</span>
            <select
              name="danh-muc"
              value={selectedCategory}
              onChange={(event) => {
                const category = event.target.value;
                setFormValues((current) => ({ ...current, category, brand: '' }));
                setSelectedCategory(category);
                setSelectedBrand('');
              }}
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug ?? ''}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-gray-700">Thương hiệu</span>
            <select
              name="thuong-hieu"
              value={selectedBrand}
              onChange={(event) => {
                setFormValues((current) => ({ ...current, brand: event.target.value }));
                setSelectedBrand(event.target.value);
              }}
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Tất cả thương hiệu</option>
              {brandOptions.map((brand) => (
                <option key={brand.id} value={brand.slug ?? ''}>
                  {brand.title}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2">
            <span className="text-xs font-bold uppercase text-gray-700">Khoảng giá (VND)</span>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <input
                name="minPrice"
                type="number"
                min="0"
                value={formValues.minPrice}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, minPrice: event.target.value }))
                }
                placeholder="Từ"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <span className="text-gray-400">-</span>
              <input
                name="maxPrice"
                type="number"
                min="0"
                value={formValues.maxPrice}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, maxPrice: event.target.value }))
                }
                placeholder="Đến"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <button className="h-12 rounded-xl bg-blue-600 px-8 text-sm font-bold uppercase text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            Lọc giá
          </button>

          <Link
            href="/san-pham"
            className={[
              'grid h-12 min-w-32 place-items-center rounded-xl bg-rose-50 px-8 text-sm font-bold uppercase text-rose-400 transition hover:bg-rose-100',
              hasAnyFilter ? '' : 'pointer-events-none opacity-60'
            ].join(' ')}
          >
            Xóa
          </Link>
        </div>

        <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 md:grid-cols-[240px_1fr] md:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-gray-700">Sắp xếp</span>
            <select
              name="sort"
              value={formValues.sort || 'newest'}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, sort: event.target.value }))
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
              <option value="best_seller">Bán chạy</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              name="inStock"
              value="true"
              checked={formValues.inStock === 'true'}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  inStock: event.target.checked ? 'true' : ''
                }))
              }
              className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600"
            />
            <span>Chỉ hiển thị sản phẩm còn hàng</span>
          </label>
        </div>
      </form>
    </section>
  );
}
