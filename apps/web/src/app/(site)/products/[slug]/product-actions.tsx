'use client';

import { Calculator, ChevronLeft, ChevronRight, ShoppingCart, X, Zap } from 'lucide-react';
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

  function finishThumbnailDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function cancelThumbnailDrag(event: React.PointerEvent<HTMLDivElement>) {
    finishThumbnailDrag(event);
    dragState.current.moved = false;
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
            onPointerUp={finishThumbnailDrag}
            onPointerCancel={cancelThumbnailDrag}
            onClickCapture={(event) => {
              if (!dragState.current.moved) return;

              event.preventDefault();
              event.stopPropagation();
              dragState.current.moved = false;
            }}
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
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
  const [showInstallment, setShowInstallment] = useState(false);
  const [installmentTerm, setInstallmentTerm] = useState(6);
  const [downPayment, setDownPayment] = useState(0);

  const disabled = product.stockQty <= 0;
  const installmentTotal = price * quantity;
  const installmentEligible = !disabled && installmentTotal >= 3_000_000;
  const minimumDownPayment = Math.ceil(installmentTotal * 0.2);
  const validDownPayment =
    Number.isInteger(downPayment) &&
    downPayment >= minimumDownPayment &&
    downPayment <= installmentTotal;
  const monthlyAmount = Math.max(0, installmentTotal - downPayment) / installmentTerm;

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

  function openInstallment() {
    if (!installmentEligible) return;
    setDownPayment(minimumDownPayment);
    setShowInstallment(true);
  }

  function startInstallmentCheckout() {
    if (!validDownPayment) return;

    if (buyNowProduct(cartItem())) {
      const params = new URLSearchParams({
        payment: 'installment',
        term: String(installmentTerm),
        downPayment: String(downPayment)
      });
      router.push(`/checkout?${params.toString()}`);
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

        {installmentEligible ? (
          <button
            type="button"
            onClick={openInstallment}
            className="flex-1 rounded-xl border-2 border-blue-600 bg-white py-5 text-base font-semibold text-blue-700 transition hover:bg-blue-50 active:scale-[0.96]"
          >
            <span className="flex items-center justify-center gap-2">
              <Calculator size={22} />
              MUA TRẢ GÓP
            </span>
          </button>
        ) : null}
      </div>

      {showInstallment ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="installment-title"
          className="fixed inset-0 z-[1000] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm"
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="installment-title" className="text-2xl font-semibold text-gray-900">
                  Chọn phương án trả góp
                </h2>
                <p className="mt-1 text-base text-gray-600">Lãi suất và phí: 0%</p>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallment(false)}
                aria-label="Đóng"
                className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl bg-blue-50 p-4 text-base text-gray-700">
                <div className="flex justify-between gap-4">
                  <span>Giá sản phẩm</span>
                  <strong>{installmentTotal.toLocaleString('vi-VN')}₫</strong>
                </div>
              </div>

              <fieldset>
                <legend className="mb-2 text-base font-semibold text-gray-800">Kỳ hạn</legend>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 9, 12].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setInstallmentTerm(term)}
                      className={[
                        'h-11 rounded-xl border text-base font-semibold',
                        installmentTerm === term
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 bg-white text-gray-700'
                      ].join(' ')}
                    >
                      {term} tháng
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block text-base font-semibold text-gray-800">
                Khoản trả trước
                <input
                  type="number"
                  min={minimumDownPayment}
                  max={installmentTotal}
                  step={1000}
                  value={downPayment}
                  onChange={(event) => setDownPayment(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-base outline-none focus:border-blue-600"
                />
                <span className="mt-1 block text-sm font-medium text-gray-600">
                  Tối thiểu {minimumDownPayment.toLocaleString('vi-VN')}₫ (20%)
                </span>
              </label>

              <div className="space-y-2 rounded-xl border border-gray-200 p-4 text-base">
                <div className="flex justify-between gap-4 text-gray-700">
                  <span>Trả mỗi tháng</span>
                  <strong>{Math.ceil(monthlyAmount).toLocaleString('vi-VN')}₫</strong>
                </div>
                <div className="flex justify-between gap-4 text-gray-700">
                  <span>Tổng dự kiến</span>
                  <strong>{installmentTotal.toLocaleString('vi-VN')}₫</strong>
                </div>
                <p className="border-t border-gray-100 pt-2 text-sm font-medium text-gray-600">
                  Số tiền chỉ là ước tính. Nhân viên sẽ liên hệ xác nhận yêu cầu trả góp.
                </p>
              </div>

              <button
                type="button"
                onClick={startInstallmentCheckout}
                disabled={!validDownPayment}
                className="h-13 w-full rounded-xl bg-blue-600 px-5 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                TIẾP TỤC CHECKOUT
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
