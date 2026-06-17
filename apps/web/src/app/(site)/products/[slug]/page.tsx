import Link from 'next/link';
import {
  Award,
  ChevronRight,
  Clock3,
  CreditCard,
  Gift,
  List,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { ProductActions, ProductGallery } from './product-actions';
import { ProductCard } from '@/components/product-card';
import { Product, apiGet, mediaUrl, money } from '@/lib/api';

type ProductDetail = Product & {
  content?: string | null;
  description?: string | null;
  specification?: string | null;
  images: { id: string; imageUrl: string }[];
  policy?: {
    packageName?: string;
    policies?: unknown;
    afterSales?: unknown;
    gifts?: unknown;
  } | null;
  variants: {
    id: string;
    slug: string | null;
    title?: string | null;
    color?: string | null;
    size?: string | null;
    variantName?: string | null;
    price?: string | number | null;
    salePrice?: string | number | null;
  }[];
  related: Product[];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await apiGet<ProductDetail>(`/products/${slug}`).catch(() => null);

  return {
    title: product?.title ?? 'Sản phẩm',
    description: product?.description ?? product?.title ?? 'Chi tiết sản phẩm',
    openGraph: {
      title: product?.title ?? 'Sản phẩm',
      images: product?.image ? [product.image] : []
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await apiGet<ProductDetail>(`/products/${slug}`);

  const price = Number(product.salePrice) > 0 ? Number(product.salePrice) : Number(product.price);
  const oldPrice = Number(product.price);
  const images = product.images?.length
    ? product.images
    : [{ id: product.id, imageUrl: product.image ?? '' }];

  const policies = asStringList(product.policy?.policies);
  const afterSales = asStringList(product.policy?.afterSales);
  const gifts = asStringList(product.policy?.gifts);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const productUrl = `${siteUrl}/products/${product.slug ?? product.id}`;
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: images.map((image) => mediaUrl(image.imageUrl)),
    description: product.description ?? product.title,
    sku: product.sku,
    brand: product.brand?.title
      ? {
          '@type': 'Brand',
          name: product.brand.title
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'VND',
      price,
      availability:
        product.stockQty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  };

  return (
    <main className="bg-[#f1f5f9] py-8 text-gray-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="container">
        <nav className="overflow-x-auto whitespace-nowrap pb-2">
          <ol className="inline-flex items-center gap-2 text-base text-gray-900">
            <li>
              <Link href="/" className="transition-colors hover:text-blue-900">
                Trang chủ
              </Link>
            </li>
            <li>
              <ChevronRight size={16} className="text-gray-300" />
            </li>
            <li>
              <Link
                href={`/products?category=${product.category?.slug ?? ''}`}
                className="transition-colors hover:text-blue-900"
              >
                {product.category?.title ?? 'Sản phẩm'}
              </Link>
            </li>
            <li>
              <ChevronRight size={16} className="text-gray-300" />
            </li>
            <li className="max-w-[220px] truncate font-medium text-gray-900 md:max-w-none">
              {product.title}
            </li>
          </ol>
        </nav>

        <section className="overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full border-gray-50 p-5 lg:w-1/2 lg:border-r">
              <ProductGallery images={images} title={product.title} />
            </div>

            <div className="w-full bg-gray-50/30 p-5 lg:w-1/2">
              <div className="flex h-full flex-col">
                <div className="mb-auto">
                  <h1 className="mb-4 text-base font-semibold leading-tight text-gray-900 md:text-2xl">
                    {product.title}
                  </h1>

                  <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="text-xl font-semibold leading-none text-[#dd2f2c] md:text-[30px]">
                      {money(price)}
                    </span>

                    {oldPrice > price ? (
                      <span className="text-base font-medium leading-none text-[#191919] line-through md:text-[18px]">
                        {money(oldPrice)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <div className="flex items-baseline gap-3 md:gap-4">
                      Trạng thái:
                      {product.stockQty > 0 ? (
                        <span className="text-base font-semibold text-green-800">Còn hàng</span>
                      ) : (
                        <span className="text-base font-semibold text-red-800">Hết hàng</span>
                      )}
                    </div>
                  </div>

                  {policies.length || afterSales.length || gifts.length ? (
                    <PolicyBox policies={policies} afterSales={afterSales} gifts={gifts} />
                  ) : null}

                  {product.variants?.length > 1 ? (
                    <div className="mb-6">
                      <label className="mb-3 block text-sm font-semibold uppercase tracking-wide text-gray-700">
                        Phiên bản khác
                      </label>

                      <div className="flex flex-wrap gap-3">
                        {product.variants.map((variant) => {
                          const variantPrice =
                            Number(variant.salePrice) > 0
                              ? Number(variant.salePrice)
                              : Number(variant.price);

                          return (
                            <Link
                              key={variant.id}
                              href={`/products/${variant.slug ?? product.slug}`}
                              className={[
                                'flex min-h-[60px] min-w-[80px] flex-col items-center justify-center gap-0.5 rounded-[5px] border px-4 py-1 text-sm font-semibold transition-all duration-200',
                                variant.id === product.id
                                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 text-gray-600 hover:border-blue-400'
                              ].join(' ')}
                            >
                              <span className="line-clamp-2 max-w-[130px] text-center">
                                {variant.variantName ??
                                  variant.title ??
                                  variant.color ??
                                  variant.size ??
                                  variant.slug}
                              </span>

                              {variantPrice > 0 ? (
                                <span className="text-sm font-medium text-red-700">
                                  {money(variantPrice)}
                                </span>
                              ) : null}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <ProductActions product={product} price={price} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 items-center gap-4 py-5 md:grid-cols-2 lg:grid-cols-5">
          <ServiceItem icon={<Truck />} title="Miễn phí giao hàng" color="blue" />
          <ServiceItem icon={<Clock3 />} title="Giao hàng nhanh chóng" color="orange" />
          <ServiceItem icon={<RotateCcw />} title="Hỗ trợ đổi mới 1:1" color="green" />
          <ServiceItem icon={<ShieldCheck />} title="Sản phẩm có nguồn gốc rõ ràng" color="red" />
          <ServiceItem
            icon={<CreditCard />}
            title="Hỗ trợ trả góp theo điều kiện đối tác"
            color="purple"
          />
        </section>

        <section className="relative mt-4 overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-5 text-white">
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-base font-semibold uppercase md:text-xl">
                <Award size={22} />
                Cam kết dịch vụ vàng
              </h2>

              <p className="max-w-xl text-base leading-relaxed text-blue-100 md:text-base">
                Sự hài lòng của khách hàng là ưu tiên số 1. Nếu có bất kỳ vấn đề gì, hãy gọi cho
                chúng tôi để được hỗ trợ nhanh trong giờ làm việc.
              </p>
            </div>

            <a
              href="tel:0852262666"
              className="flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-700 shadow-lg shadow-blue-900/20 md:text-base"
            >
              <PhoneCall size={20} className="animate-bounce" />
              0852262666
            </a>
          </div>

          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 px-8 py-6">
                <div className="h-8 w-2 rounded-full bg-blue-600" />
                <h2 className="text-base font-semibold text-gray-900 md:text-xl">
                  Chi tiết sản phẩm
                </h2>
              </div>

              {product.content ? (
                <div
                  className="product-content sun-editor-editable p-5 pt-0 text-justify text-base leading-8 text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:border-l-4 [&_h2]:border-blue-600 [&_h2]:pl-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-3 [&_th]:border [&_th]:border-slate-200 [&_th]:p-3"
                  dangerouslySetInnerHTML={{ __html: product.content }}
                />
              ) : (
                <p className="p-5 pt-0 leading-7 text-gray-700">
                  Thông tin chi tiết sản phẩm đang được cập nhật.
                </p>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-[128px]">
              <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-5">
                  <List size={22} className="text-blue-600" />
                  <h2 className="text-base font-semibold text-gray-900 md:text-xl">
                    Thông số kỹ thuật
                  </h2>
                </div>

                {product.specification ? (
                  <div
                    className="spec-table max-w-full p-2 text-base [overflow-wrap:anywhere] [word-break:break-word] [&_*]:max-w-full [&_img]:h-auto [&_img]:max-w-full [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_td:first-child:not(:last-child)]:w-[40%] [&_td:first-child:not(:last-child)]:bg-slate-50 [&_td:first-child:not(:last-child)]:font-semibold [&_td]:whitespace-normal [&_td]:break-words [&_td]:border [&_td]:border-slate-100 [&_td]:bg-white [&_td]:p-3 [&_td]:text-base [&_td]:leading-5 [&_td]:text-slate-700 [&_th]:whitespace-normal [&_th]:break-words [&_th]:border [&_th]:border-slate-100 [&_th]:bg-slate-50 [&_th]:p-3"
                    dangerouslySetInnerHTML={{ __html: product.specification }}
                  />
                ) : (
                  <p className="p-5 text-base text-gray-600">
                    Thông số kỹ thuật đang được cập nhật.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className="mb-12 mt-12 overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-2 rounded-full bg-blue-600" />
              <h2 className="text-base font-semibold text-gray-900 md:text-xl">
                Đánh giá khách hàng
              </h2>
            </div>
          </div>

          <div className="grid gap-10 p-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="py-10 text-center italic text-gray-500">
                Chưa có đánh giá nào cho sản phẩm này.
              </div>
            </div>

            <div className="mx-auto w-full max-w-[600px] rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
              <h3 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
                Gửi nhận xét của bạn
              </h3>

              <form className="space-y-5">
                <div>
                  <label className="mb-2 block text-base font-medium text-gray-700">
                    Đánh giá của bạn *
                  </label>
                  <div className="flex flex-row-reverse justify-end gap-1 text-3xl text-gray-300">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <span key={star} className="cursor-pointer transition hover:text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  placeholder="Mời bạn chia sẻ thêm cảm nhận..."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Họ tên *"
                    className="rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    className="rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  />
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-700"
                >
                  Gửi đánh giá
                </button>
              </form>
            </div>
          </div>
        </section>

        {product.related?.length ? (
          <section className="mb-8 mt-12">
            <div className="mb-8 flex items-end justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-8 w-2 rounded-full bg-blue-600" />
                  <div className="absolute inset-0 h-8 w-2 rounded-full bg-blue-600 opacity-40 blur-[2px]" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
                  Sản phẩm liên quan
                </h2>
              </div>

              <Link
                href="/products"
                className="group flex items-center gap-1 text-base font-semibold text-blue-600 transition-all duration-300 hover:text-blue-700 md:text-base"
              >
                <span>Xem tất cả</span>
                <ChevronRight
                  size={22}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {product.related.slice(0, 8).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function PolicyBox({
  policies,
  afterSales,
  gifts
}: {
  policies: string[];
  afterSales: string[];
  gifts: string[];
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex w-full items-start gap-3 rounded-lg border border-dashed border-blue-300 bg-white p-4 text-base text-gray-700">
          <div className="w-full">
            <span className="mb-3 flex items-center text-sm font-semibold uppercase text-blue-700">
              <Gift size={24} fill="currentColor" className="mr-2 text-blue-600" />
              Dịch vụ hậu mãi chất lượng cao, an tâm mua sắm
            </span>

            <PolicyList title="I. Chính sách" items={policies} />

            <PolicyList
              title={policies.length ? 'II. Dịch vụ hậu mãi' : 'I. Dịch vụ hậu mãi'}
              items={afterSales}
            />

            <PolicyList
              title={
                policies.length && afterSales.length
                  ? 'III. Quà tặng kèm'
                  : policies.length || afterSales.length
                    ? 'II. Quà tặng kèm'
                    : 'I. Quà tặng kèm'
              }
              items={gifts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <div className="mt-4 first:mt-0">
      <p className="mb-2 font-semibold text-red-600">{title}</p>
      <ul className="space-y-1 text-base leading-7">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-0.5 text-sm font-semibold text-green-800">✔︎</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServiceItem({
  icon,
  title,
  color
}: {
  icon: React.ReactNode;
  title: string;
  color: 'blue' | 'orange' | 'green' | 'red' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600',
    orange: 'bg-orange-50 text-orange-500 group-hover:bg-orange-500',
    green: 'bg-green-50 text-green-800 group-hover:bg-green-500',
    red: 'bg-red-50 text-red-500 group-hover:bg-red-500',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600'
  };

  return (
    <div className="group flex items-center gap-4 rounded-xl bg-white p-3 transition-all duration-300 hover:bg-gray-50">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${colors[color]} [&_svg]:h-6 [&_svg]:w-6 group-hover:text-white`}
      >
        {icon}
      </div>
      <span className="text-base font-semibold leading-snug text-gray-800">{title}</span>
    </div>
  );
}

function asStringList(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0
        );
      }
    } catch {
      return value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}
