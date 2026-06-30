'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveImage } from '@/components/responsive-image';
import { Product, money } from '@/lib/api';
import { useCart } from '@/store/cart';

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((state) => state.add);
  const price = Number(product.price);
  const sale = Number(product.salePrice) > 0 ? Number(product.salePrice) : price;
  const discount = price > sale ? Math.round(((price - sale) / price) * 100) : 0;
  const disabled = product.stockQty <= 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {discount ? (
        <div className="absolute left-2 top-2 z-10 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
          -{discount}%
        </div>
      ) : null}

      <Link
        href={`/san-pham/${product.slug ?? product.id}`}
        className="relative block aspect-[1.12] bg-white p-3"
      >
        <ResponsiveImage
          src={product.image}
          alt={product.title}
          className="absolute inset-0"
          imgClassName="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3">
        <div className="mb-1 text-xs font-semibold uppercase text-[#1769ff]">
          {product.brand?.title ?? product.category?.title ?? 'GREENHOME'}
        </div>

        <Link
          href={`/san-pham/${product.slug ?? product.id}`}
          className="line-clamp-2 min-h-[44px] text-sm font-semibold leading-5 text-[#334155] hover:text-[#1769ff] md:text-[15px] md:leading-6"
        >
          {product.title}
        </Link>

        <div className="mt-3 min-h-[52px] text-center">
          <div className="text-lg font-semibold text-red-600 md:text-xl">{money(sale)}</div>
          {price > sale ? (
            <div className="text-sm text-gray-500 line-through">{money(price)}</div>
          ) : null}
        </div>

        <button
          type="button"
          disabled={disabled}
          className="mt-auto flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#263449] text-sm font-semibold text-white transition hover:bg-[#1769ff] disabled:cursor-not-allowed disabled:bg-gray-300"
          onClick={() =>
            add({
              productId: product.id,
              title: product.title,
              slug: product.slug,
              image: product.image,
              price: sale,
              quantity: 1,
              stockQty: product.stockQty
            })
          }
        >
          <ShoppingCart size={16} />
          {disabled ? 'Hết hàng' : 'Giỏ hàng'}
        </button>
      </div>
    </article>
  );
}
