'use client';

import { ChevronLeft, ChevronRight, ShoppingCart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveImage } from '@/components/responsive-image';
import { Product } from '@/lib/api';
import { useCart } from '@/store/cart';

type ProductImage = {
  id: string;
  imageUrl: string;
};

export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailTrackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ startX: 0, scrollLeft: 0, moved: false });
  const slideSwipeState = useRef({ startX: 0, startY: 0 });

  const galleryImages = useMemo(() => images.filter((image) => image.imageUrl), [images]);

  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  useEffect(() => {
    const track = thumbnailTrackRef.current;
    const thumbnail = track?.children[activeIndex] as HTMLElement | undefined;
    if (!track || !thumbnail) return;

    const left = thumbnail.offsetLeft;
    const right = left + thumbnail.offsetWidth;
    if (left < track.scrollLeft) track.scrollTo({ left, behavior: 'smooth' });
    if (right > track.scrollLeft + track.clientWidth) {
      track.scrollTo({ left: right - track.clientWidth, behavior: 'smooth' });
    }
  }, [activeIndex]);

  function startThumbnailDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') return;
    const track = thumbnailTrackRef.current;
    if (!track) return;

    dragState.current = {
      startX: event.clientX,
      scrollLeft: track.scrollLeft,
      moved: false
    };
    track.setPointerCapture(event.pointerId);
  }

  function dragThumbnails(event: React.PointerEvent<HTMLDivElement>) {
    const track = thumbnailTrackRef.current;
    if (!track || !track.hasPointerCapture(event.pointerId)) return;

    const distance = event.clientX - dragState.current.startX;
    if (Math.abs(distance) > 4) dragState.current.moved = true;
    track.scrollLeft = dragState.current.scrollLeft - distance;
  }

  function prev() {
    setActiveIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  }

  function next() {
    setActiveIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  }

  function startSlideSwipe(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) return;

    slideSwipeState.current = { startX: event.clientX, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function finishSlideSwipe(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const distanceX = event.clientX - slideSwipeState.current.startX;
    const distanceY = event.clientY - slideSwipeState.current.startY;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (Math.abs(distanceX) < 50 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
    if (distanceX < 0) next();
    else prev();
  }

  if (!activeImage) {
    return <div className="aspect-square rounded-xl bg-gray-50" />;
  }

  return (
    <div className="sticky top-[132px] md:top-[176px] lg:top-[128px]">
      <div
        onPointerDown={startSlideSwipe}
        onPointerUp={finishSlideSwipe}
        onPointerCancel={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        className="group relative mb-6 aspect-square touch-pan-y cursor-grab overflow-hidden rounded-xl bg-white active:cursor-grabbing"
      >
        <ResponsiveImage
          src={activeImage.imageUrl}
          alt={`Ảnh sản phẩm ${title}`}
          className="absolute inset-0 block"
          imgClassName="h-full w-full object-contain bg-white"
          priority
          fetchPriority="high"
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
        <div className="relative">
          <div
            ref={thumbnailTrackRef}
            role="list"
            aria-label="Danh sach anh san pham"
            onPointerDown={startThumbnailDrag}
            onPointerMove={dragThumbnails}
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => {
                  if (!dragState.current.moved) setActiveIndex(index);
                  dragState.current.moved = false;
                }}
                aria-label={`Xem ảnh sản phẩm ${index + 1}`}
                className={[
                  'aspect-square w-[calc((100%_-_2rem)/5)] shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-gray-50 transition-all',
                  activeIndex === index
                    ? 'border-blue-500 opacity-100'
                    : 'border-transparent opacity-60 hover:border-blue-500 hover:opacity-100'
                ].join(' ')}
              >
                <ResponsiveImage
                  src={image.imageUrl}
                  alt=""
                  className="relative block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  loading={index === activeIndex ? 'eager' : 'lazy'}
                  fetchPriority={index === activeIndex ? 'low' : 'auto'}
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
