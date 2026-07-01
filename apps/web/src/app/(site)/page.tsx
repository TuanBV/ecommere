import Link from 'next/link';
import {
  Gift,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
  Zap,
  CheckCircle2,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { ResponsiveImage } from '@/components/responsive-image';
import { Product, apiGet, mediaUrl } from '@/lib/api';

type Slider = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
};
type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
};
type Category = {
  id: string;
  title: string;
  slug: string | null;
  logo?: string | null;
};
type Brand = {
  id: string;
  title: string;
  slug?: string | null;
  logo?: string | null;
};

export default async function HomePage() {
  const [slidersRaw, bannersRaw, categoriesRaw, productsRaw, brandsRaw] = await Promise.all([
    apiGet<Slider[]>('/sliders').catch(() => []),
    apiGet<Banner[]>('/banners?position=HOME_TOP').catch(() => []),
    apiGet<Category[]>('/categories').catch(() => []),
    apiGet<Product[]>('/products?limit=20').catch(() => []),
    apiGet<Brand[]>('/brands').catch(() => [])
  ]);

  const sliders = slidersRaw.length ? slidersRaw : fallbackSlides;
  const banners = bannersRaw.length ? bannersRaw : fallbackBanners;
  const categories = categoriesRaw.length ? categoriesRaw : fallbackCategories;
  const products = productsRaw.length ? productsRaw : fallbackProducts;
  const brands = brandsRaw.length ? brandsRaw : fallbackBrands;
  const brandSlides = [...brands, ...brands];

  return (
    <main className="pb-12">
      <div className="container">
        <section className="grid gap-3 md:grid-cols-[1fr_1fr]">
          <Link
            href={sliders[0].linkUrl ?? '/san-pham'}
            className="relative block aspect-[568/320] overflow-hidden rounded-lg bg-white shadow-sm"
          >
            <ResponsiveImage
              src={sliders[0].imageUrl}
              alt={sliders[0].title}
              className="absolute inset-0"
              imgClassName="h-full w-full object-cover"
              priority
            />
          </Link>
          <div className="grid gap-3">
            {banners.slice(0, 2).map((b, i) => (
              <Link
                key={b.id}
                href={b.linkUrl ?? '/san-pham'}
                className="relative block aspect-[568/154] overflow-hidden rounded-lg bg-white shadow-sm"
              >
                <ResponsiveImage
                  src={b.imageUrl}
                  alt={b.title}
                  className="absolute inset-0"
                  imgClassName="h-full w-full object-cover"
                  priority={i === 0}
                />
              </Link>
            ))}
          </div>
        </section>

        <SectionTitle title="Danh mục sản phẩm" />
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
          {categories.slice(0, 7).map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-5">
          <PolicyItem icon={<Truck />} title="Miễn phí giao hàng" />
          <PolicyItem icon={<ClockIcon />} title="Giao hàng thành công" />
          <PolicyItem icon={<RotateCcw />} title="Hỗ trợ đổi mới 1:1" />
          <PolicyItem icon={<ShieldCheck />} title="Sản phẩm với nguồn gốc rõ ràng" />
          <PolicyItem icon={<Gift />} title="Voucher giảm giá" />
        </section>

        <ProductStrip
          title="Tivi thông minh"
          sideImage="/client/images/slider-1.jpg"
          products={products.slice(0, 4)}
        />
        <ProductStrip
          title="Robot hút bụi"
          sideImage="/client/images/banner-right.png"
          products={products.slice(4, 8).length ? products.slice(4, 8) : products.slice(0, 4)}
        />

        <section className="mt-16">
          <SectionTitle title="Sản phẩm mới nhất" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {products.slice(0, 10).map((p) => (
              <ProductCard key={`new-${p.id}`} product={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/san-pham"
              className="inline-flex items-center rounded-lg border border-[#0f4fbf] px-6 py-3 text-sm font-semibold uppercase text-[#0f4fbf] hover:bg-[#0f4fbf] hover:text-white"
            >
              Xem tất cả sản phẩm →
            </Link>
          </div>
        </section>

        <section className="mt-16 overflow-hidden">
          <SectionTitle title="Thương hiệu đồng hành" />
          <div className="relative overflow-hidden rounded-lg bg-white py-7 shadow-sm">
            <div className="flex w-max animate-infinite-scroll items-center gap-3 px-4 hover:[animation-play-state:paused]">
              {brandSlides.map((b, index) => (
                <Link
                  key={`${b.id}-${index}`}
                  href={`/san-pham?thuong-hieu=${b.slug ?? ''}`}
                  className="flex h-16 w-40 shrink-0 items-center justify-center rounded-lg px-4 text-center text-2xl font-semibold uppercase text-gray-500 transition hover:bg-blue-50 hover:text-[#0f4fbf] md:w-48"
                  aria-label={`Xem sản phẩm thương hiệu ${b.title}`}
                >
                  {b.logo ? (
                    <img
                      src={mediaUrl(b.logo)}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="line-clamp-2 break-words leading-tight">{b.title}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <AboutBlock />
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-800">{title}</h2>;
}
function ClockIcon() {
  return <Zap size={18} />;
}

function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/san-pham?danh-muc=${category.slug ?? ''}`}
      className="group flex flex-col items-center gap-3"
    >
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-white p-5 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md">
        {category.logo ? (
          <img
            src={mediaUrl(category.logo)}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-3xl font-bold text-gray-200">{category.title[0]}</span>
        )}
      </div>
      <span className="text-center text-sm font-semibold leading-snug text-gray-700">
        {category.title}
      </span>
    </Link>
  );
}

function PolicyItem({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex min-h-[54px] items-center gap-3 rounded-lg bg-white px-4 shadow-sm">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-[#0f4fbf] [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <span className="text-sm font-semibold leading-snug text-gray-700">{title}</span>
    </div>
  );
}

function ProductStrip({
  title,
  sideImage,
  products
}: {
  title: string;
  sideImage: string;
  products: Product[];
}) {
  return (
    <section className="mt-10 grid gap-5 md:grid-cols-[220px_1fr]">
      <Link
        href="/san-pham"
        className="relative hidden min-h-[280px] overflow-hidden rounded-lg bg-white shadow-sm md:block"
      >
        <img src={sideImage} alt="" className="h-full w-full object-cover" />
      </Link>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <Link href="/san-pham" className="text-sm font-semibold text-[#0f4fbf]">
            Xem thêm →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={`${title}-${p.id}`} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutBlock() {
  const items = [
    'Sản phẩm có nguồn gốc rõ ràng',
    'Giá cả minh bạch',
    'Dịch vụ tận tâm',
    'Hậu mãi uy tín'
  ];
  return (
    <section className="mt-10 overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="p-8">
        <h2 className="text-2xl font-semibold uppercase text-[#1953a8]">
          Giới thiệu về Green Home Shop
        </h2>
        <div className="mt-3 h-1 w-16 rounded-full bg-green-500" />
        <p className="mt-6 text-base leading-8 text-gray-700">
          Chào mừng bạn đến với <b>Green Home Shop</b> – Điểm đến tin cậy cho không gian sống hiện
          đại và tiện nghi. Chúng tôi cung cấp thiết bị gia dụng thông minh, sản phẩm chính hãng,
          thông tin minh bạch và dịch vụ hậu mãi chu đáo.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoBox
            title="Sứ mệnh"
            text="Đơn giản hóa cuộc sống với những sản phẩm thông minh, an toàn và bền vững."
          />
          <InfoBox
            title="Tầm nhìn"
            text="Trở thành hệ thống bán lẻ gia dụng thông minh hàng đầu, nơi khách hàng luôn tìm thấy sự an tâm."
          />
        </div>
        <h3 className="mt-8 text-lg font-semibold text-[#1953a8]">
          Tại sao nên chọn Green Home Shop?
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {items.map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-4 text-base font-semibold text-gray-700"
            >
              <CheckCircle2 className="text-[#0f4fbf]" size={18} />
              {i}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg border border-gray-200 p-5">
          <h3 className="mb-4 text-base font-semibold uppercase text-[#1953a8]">
            Thông tin liên hệ chính thức
          </h3>
          <div className="grid gap-3 text-base text-gray-700 md:grid-cols-3">
            <p>
              <b>Tên đơn vị:</b>
              <br />
              Công ty TNHH Thương mại và Công nghệ GHD
            </p>
            <p>
              <b>Hotline:</b>
              <br />
              <a className="text-[#0f4fbf]" href="tel:0852262666">
                0852262666
              </a>
            </p>
            <p>
              <b>Email:</b>
              <br />
              <a className="text-[#0f4fbf]" href="mailto:greenhome@gmail.com">
                greenhome@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-blue-50 p-5 text-base leading-7">
      <b className="text-[#1953a8]">{title}</b>
      <p className="mt-2 text-gray-600">{text}</p>
    </div>
  );
}

const fallbackSlides = [
  {
    id: 's1',
    title: 'Xiaomi TV A Series 2026',
    imageUrl: '/client/images/slider-1.jpg',
    linkUrl: '/san-pham'
  }
];
const fallbackBanners = [
  {
    id: 'b1',
    title: 'Robot hút bụi',
    imageUrl: '/client/images/banner-1.jpg',
    linkUrl: '/san-pham'
  },
  {
    id: 'b2',
    title: 'Máy lọc không khí',
    imageUrl: '/client/images/banner-2.jpg',
    linkUrl: '/san-pham'
  }
];
const fallbackCategories: Category[] = [
  {
    id: 'tivi',
    title: 'Tivi',
    slug: 'tivi',
    logo: '/client/images/tivi_xiaomi_2026.webp'
  },
  {
    id: 'may-hut-bui',
    title: 'Máy hút bụi cầm tay',
    slug: 'may-hut-bui-cam-tay',
    logo: '/client/images/anh_robot_lau_nha.webp'
  },
  { id: 'may-rua-bat', title: 'Máy rửa bát', slug: 'may-rua-bat' },
  { id: 'may-giat', title: 'Máy giặt', slug: 'may-giat' },
  {
    id: 'may-loc-khong-khi',
    title: 'Máy lọc không khí',
    slug: 'may-loc-khong-khi',
    logo: '/client/images/Máy lọc không khí LG AS10 , AS65.jpg'
  },
  { id: 'may-hut-am', title: 'Máy hút ẩm', slug: 'may-hut-am' },
  { id: 'tu-lanh', title: 'Tủ lạnh', slug: 'tu-lanh' }
];
const fallbackProducts: Product[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `p${i}`,
  title:
    i < 4
      ? 'Tivi thông minh Xiaomi 4K 55 inch Smart Display S MiniLED'
      : 'Robot hút bụi lau nhà Roborock Q Revo Edge 5V1 Max',
  slug: `san-pham-${i}`,
  sku: `SKU${i}`,
  price: i % 2 ? '34990000' : '19990000',
  salePrice: i % 2 ? '30990000' : '16700000',
  stockQty: 20,
  image: i < 4 ? '/client/images/tivi_xiaomi_2026.webp' : '/client/images/anh_robot_lau_nha.webp',
  brand: {
    title: i < 4 ? 'XIAOMI' : 'ROBOROCK',
    slug: i < 4 ? 'xiaomi' : 'roborock'
  }
}));
const fallbackBrands: Brand[] = [
  { id: 'xiaomi', title: 'xiaomi', slug: 'xiaomi' },
  { id: 'nwt', title: 'NWT', slug: 'nwt' },
  { id: 'toshiba', title: 'TOSHIBA', slug: 'toshiba' },
  { id: 'tineco', title: 'TINECO', slug: 'tineco' },
  { id: 'roborock', title: 'roborock', slug: 'roborock' }
];
