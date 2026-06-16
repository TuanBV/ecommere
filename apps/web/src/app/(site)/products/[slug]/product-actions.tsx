'use client';

import { ChevronLeft, ChevronRight, ShoppingCart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ResponsiveImage } from '@/components/responsive-image';
import { Product } from '@/lib/api';
import { useCart } from '@/store/cart';

type ProductImage = {
  id: string;
  imageUrl: string;
};

export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const galleryImages = useMemo(() => images.filter((image) => image.imageUrl), [images]);

  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  function prev() {
    setActiveIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  }

  function next() {
    setActiveIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  }

  if (!activeImage) {
    return <div className="aspect-square rounded-xl bg-gray-50" />;
  }

  return (
    <div className="sticky top-[132px] md:top-[176px] lg:top-[128px]">
      <div className="group relative mb-6 aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-white">
        <ResponsiveImage
          src={activeImage.imageUrl}
          alt={title}
          className="absolute inset-0 block"
          imgClassName="h-full w-full object-contain bg-white"
          priority
        />

        {galleryImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Ảnh trước"
              className="absolute left-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:scale-110 hover:bg-blue-600 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Ảnh sau"
              className="absolute right-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:scale-110 hover:bg-blue-600 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <div className="relative px-2">
          <div className="grid grid-cols-4 gap-2 md:grid-cols-5">
            {galleryImages.slice(0, 10).map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={[
                  'aspect-square overflow-hidden rounded-xl border-2 bg-gray-50 transition-all',
                  activeIndex === index
                    ? 'border-blue-500 opacity-100'
                    : 'border-transparent opacity-60 hover:border-blue-500 hover:opacity-100'
                ].join(' ')}
              >
                <ResponsiveImage
                  src={image.imageUrl}
                  alt={title}
                  className="relative block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProductActions({ product, price }: { product: Product; price: number }) {
  const router = useRouter();
  const add = useCart((state) => state.add);
  const buyNowProduct = useCart((state) => state.buyNow);
  const [quantity, setQuantity] = useState(1);

  const disabled = product.stockQty <= 0;

  function cartItem() {
    return {
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: product.image,
      price,
      quantity,
      stockQty: product.stockQty
    };
  }

  function addProduct() {
    if (disabled) return false;

    return add(cartItem());
  }

  function buyNow() {
    if (disabled) return;

    if (buyNowProduct(cartItem())) {
      router.push('/checkout');
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-semibold uppercase tracking-wide text-gray-700">
            Số lượng
          </label>
        </div>

        <div className="flex w-32 items-center overflow-hidden rounded-[5px] border border-gray-200 bg-white">
          <button
            type="button"
            aria-label="Giảm số lượng"
            disabled={disabled}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="flex h-10 w-10 items-center justify-center border-r border-gray-100 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            -
          </button>

          <input
            type="number"
            aria-label="Số lượng sản phẩm"
            value={quantity}
            min={1}
            max={product.stockQty || 99}
            disabled={disabled}
            onChange={(event) => {
              const value = Number(event.target.value);
              const max = product.stockQty || 99;
              setQuantity(Math.min(max, Math.max(1, value || 1)));
            }}
            className="w-12 bg-transparent text-center font-semibold text-gray-800 focus:outline-none"
          />

          <button
            type="button"
            aria-label="Tăng số lượng"
            disabled={disabled}
            onClick={() => setQuantity((current) => Math.min(product.stockQty || 99, current + 1))}
            className="flex h-10 w-10 items-center justify-center border-l border-gray-100 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          disabled={disabled}
          onClick={buyNow}
          className="flex-[1.5] rounded-xl bg-[#1c62e8] py-5 text-base font-semibold text-white transition hover:bg-blue-700 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
        >
          <span className="flex items-center justify-center gap-3">
            <Zap size={22} fill="currentColor" className="animate-pulse" />
            MUA NGAY
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={addProduct}
          className="flex-1 rounded-xl border-2 border-gray-900 bg-white py-5 text-base font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
        >
          <span className="flex items-center justify-center gap-2">
            <ShoppingCart size={22} />
            GIỎ HÀNG
          </span>
        </button>
      </div>
    </>
  );
}
