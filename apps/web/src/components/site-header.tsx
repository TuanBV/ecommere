'use client';

import Link from 'next/link';
import {
  ChevronRight,
  Menu,
  Search,
  ShoppingCart,
  X,
  Home,
  Package,
  Newspaper,
  Phone,
  Plus,
  Minus
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { money } from '@/lib/api';
import { useCart } from '@/store/cart';

type Category = {
  id: string;
  title: string;
  slug: string | null;
  logo?: string | null;
  brands?: {
    id: string;
    title: string;
    slug: string | null;
    logo?: string | null;
  }[];
};

export function SiteHeader({ categories = [] }: { categories?: Category[] }) {
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [mobileExpandedCategoryIds, setMobileExpandedCategoryIds] = useState<string[]>([]);
  const [desktopExpandedCategoryIds, setDesktopExpandedCategoryIds] = useState<string[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState('');
  const [activeBrandSlug, setActiveBrandSlug] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const items = useCart((state) => state.items);

  const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const menuCategories = categories.length ? categories : defaultCategories;

  const activeCategoryIds = useMemo(
    () =>
      menuCategories
        .filter(
          (category) =>
            category.slug === activeCategorySlug ||
            Boolean(
              activeBrandSlug && category.brands?.some((brand) => brand.slug === activeBrandSlug)
            )
        )
        .map((category) => category.id),
    [activeBrandSlug, activeCategorySlug, menuCategories]
  );

  function toggleMobileCategory(categoryId: string) {
    setMobileExpandedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((item) => item !== categoryId)
        : [...current, categoryId]
    );
  }

  function toggleDesktopCategory(categoryId: string) {
    setDesktopExpandedCategoryIds((current) => (current.includes(categoryId) ? [] : [categoryId]));
  }

  function syncActiveFiltersFromLocation() {
    const params = new URLSearchParams(window.location.search);
    setActiveCategorySlug(params.get('category') ?? '');
    setActiveBrandSlug(params.get('brand') ?? '');
  }

  useEffect(() => {
    syncActiveFiltersFromLocation();
  }, []);

  useEffect(() => {
    if (open) {
      syncActiveFiltersFromLocation();
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = scrollbarWidth ? `${scrollbarWidth}px` : '';
      closeButtonRef.current?.focus();
      if (activeCategoryIds.length) {
        setMobileExpandedCategoryIds((current) => [...new Set([...current, ...activeCategoryIds])]);
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [activeCategoryIds, open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    const openSidebar = () => setOpen(true);
    const closeSidebar = () => setOpen(false);
    const toggleSidebar = () => setOpen((current) => !current);

    window.addEventListener('sidebar:open', openSidebar);
    window.addEventListener('sidebar:close', closeSidebar);
    window.addEventListener('toggle-sidebar', toggleSidebar);

    return () => {
      window.removeEventListener('sidebar:open', openSidebar);
      window.removeEventListener('sidebar:close', closeSidebar);
      window.removeEventListener('toggle-sidebar', toggleSidebar);
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 300);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Lên đầu trang"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={[
          'fixed bottom-20 right-10 z-[40] flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white p-3 shadow-xl transition-all duration-300 hover:bg-gray-50 lg:bottom-10',
          showTop ? 'opacity-100' : 'pointer-events-none opacity-0'
        ].join(' ')}
      >
        <ChevronRight size={24} className="-rotate-90 text-gray-700" />
      </button>

      <div
        id="mobileSidebarLayer"
        aria-label="Đóng menu"
        onClick={() => setOpen(false)}
        className={[
          'fixed inset-0 z-[80] bg-black/60 transition-opacity duration-300 ease-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        ].join(' ')}
      >
        <aside
          id="mobileSidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Menu dieu huong"
          onClick={(event) => event.stopPropagation()}
          className={[
            'fixed left-0 top-0 z-[90] flex h-screen w-[310px] max-w-[86vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out will-change-transform',
            open ? 'translate-x-0' : '-translate-x-full'
          ].join(' ')}
        >
          <div className="flex items-center justify-between border-b border-gray-50 p-4">
            <Link href="/" aria-label="GreenHome" className="flex h-10 items-center">
              <picture>
                <source
                  type="image/webp"
                  srcSet="/client/images/greenhome-logo-500.lossless.webp"
                />
                <img
                  src="/client/images/logo.png"
                  alt="Logo Green Home Shop"
                  className="h-auto w-[180px] object-contain md:w-[200px]"
                  width={200}
                  height={43}
                />
              </picture>
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              className="cursor-pointer p-2 text-gray-700"
              onClick={() => setOpen(false)}
              aria-label="Đóng menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            <MobileMenuLink href="/" icon={<Home size={22} />} onClick={() => setOpen(false)}>
              Trang chủ
            </MobileMenuLink>

            <MobileMenuLink
              href="/products"
              icon={<Package size={22} fill="currentColor" />}
              onClick={() => setOpen(false)}
            >
              Sản phẩm
            </MobileMenuLink>

            <MobileMenuLink
              href="/news"
              icon={<Newspaper size={22} />}
              onClick={() => setOpen(false)}
            >
              Tin tức
            </MobileMenuLink>

            <div className="my-2 px-3">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-600">
                Danh mục sản phẩm
              </p>
            </div>

            <div className="grid gap-1">
              {menuCategories.map((cat) => (
                <div key={cat.id} className="rounded-xl">
                  <div className="flex items-center rounded-xl transition-all hover:bg-blue-50">
                    <Link
                      href={`/products?category=${cat.slug ?? ''}`}
                      onClick={() => setOpen(false)}
                      className="flex min-w-0 flex-1 items-center p-3"
                    >
                      <ChevronRight size={18} className="w-7 shrink-0 text-gray-600" />
                      <span className="truncate text-base font-semibold text-gray-700">
                        {cat.title}
                      </span>
                    </Link>
                    {cat.brands?.length ? (
                      <button
                        type="button"
                        onClick={() => toggleMobileCategory(cat.id)}
                        className="mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-blue-600 hover:bg-white"
                        aria-label={
                          mobileExpandedCategoryIds.includes(cat.id)
                            ? 'Đóng danh sách thương hiệu'
                            : 'Mở danh sách thương hiệu'
                        }
                      >
                        {mobileExpandedCategoryIds.includes(cat.id) ? (
                          <Minus size={18} />
                        ) : (
                          <Plus size={18} />
                        )}
                      </button>
                    ) : null}
                  </div>
                  {cat.brands?.length && mobileExpandedCategoryIds.includes(cat.id) ? (
                    <div className="ml-10 grid gap-1 pb-1">
                      {cat.brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/products?category=${cat.slug ?? ''}&brand=${brand.slug ?? ''}`}
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {brand.title}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <a
              href="tel:0852262666"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-base font-semibold text-white"
            >
              <Phone size={18} />
              0852 262 666
            </a>
          </div>
        </aside>
      </div>

      <section
        id="header"
        className="sticky left-0 right-0 top-0 z-[50] h-[118px] w-full md:h-[160px] lg:h-[122px]"
      >
        <header className="bg-white shadow-sm">
          <div className="container flex flex-wrap items-center justify-between gap-y-3 py-3">
            <button
              type="button"
              className="flex cursor-pointer items-center md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={30} className="text-gray-700" />
            </button>

            <div className="flex items-center">
              <Link href="/" className="flex items-center" aria-label="Green Home Shop">
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/client/images/greenhome-logo-500.lossless.webp"
                  />
                  <img
                    src="/client/images/logo.png"
                    alt="Logo Green Home Shop"
                    className="h-auto w-[180px] object-contain md:w-[200px]"
                    width={200}
                    height={43}
                    loading="eager"
                  />
                </picture>
              </Link>
            </div>

            <form
              action="/products"
              className="order-3 w-full lg:order-2 lg:mx-10 lg:max-w-2xl lg:flex-1"
            >
              <div className="relative h-[46px] min-h-[46px]">
                <input
                  name="q"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  autoComplete="off"
                  className="h-[46px] min-h-[46px] w-full rounded-full border border-gray-200 bg-gray-50 px-6 pr-12 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-base"
                />

                <button
                  type="submit"
                  aria-label="Tìm kiếm sản phẩm"
                  className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 p-2 text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            <div className="order-2 flex items-center space-x-4 lg:order-3">
              <Link
                href="/checkout"
                aria-label="Xem giỏ hàng của bạn"
                className="group flex items-center gap-2 rounded-full border border-gray-100 bg-white p-1 shadow-sm transition-all active:scale-95 md:gap-3 md:bg-blue-600 md:pl-1 md:pr-4 md:text-white md:shadow-md md:hover:bg-blue-700"
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 p-2.5 text-white shadow-sm">
                  <ShoppingCart size={20} />

                  {cartCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </div>

                <div className="hidden flex-col items-start pr-1 leading-tight md:flex">
                  <span className="text-[12px] font-semibold uppercase tracking-tight text-white">
                    Giỏ hàng
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="hidden h-[48px] min-h-[48px] items-center overflow-visible border-t border-gray-100 bg-[#e6effd] text-gray-700 md:flex">
            <div className="container flex h-[48px] items-center">
              <button
                type="button"
                className="flex h-[48px] cursor-pointer items-center px-5 transition-colors hover:bg-blue-100"
                onClick={() => setOpen(true)}
              >
                <Menu size={24} className="mr-3 text-gray-700" />
                <span className="text-sm font-semibold uppercase leading-none tracking-wide">
                  Danh mục sản phẩm
                </span>
              </button>

              <nav
                aria-label="Danh muc san pham"
                className="ml-4 flex h-full flex-1 items-center overflow-visible whitespace-nowrap text-[15px] font-medium"
              >
                {menuCategories.map((cat) => (
                  <div key={cat.id} className="relative flex h-full items-center">
                    <Link
                      href={`/products?category=${cat.slug ?? ''}`}
                      className="flex h-[48px] items-center px-4 pr-2 leading-none text-gray-600 hover:text-blue-900"
                    >
                      {cat.title}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </header>
      </section>
    </>
  );
}

function MobileMenuLink({
  href,
  icon,
  children,
  onClick
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="mb-1 flex items-center rounded-xl p-3 text-base font-medium text-gray-700 transition-all hover:bg-blue-50"
    >
      <span className="w-8">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

const defaultCategories: Category[] = [
  { id: 'robot-hut-bui', title: 'Robot hút bụi', slug: 'robot-hut-bui' },
  { id: 'robot-lau-kinh', title: 'Robot lau kính', slug: 'robot-lau-kinh' },
  {
    id: 'may-hut-bui-cam-tay',
    title: 'Máy hút bụi cầm tay',
    slug: 'may-hut-bui-cam-tay'
  },
  {
    id: 'may-loc-khong-khi',
    title: 'Máy lọc không khí',
    slug: 'may-loc-khong-khi'
  },
  { id: 'may-hut-am', title: 'Máy hút ẩm', slug: 'may-hut-am' },
  { id: 'may-giat', title: 'Máy giặt', slug: 'may-giat' },
  { id: 'tu-lanh', title: 'Tủ lạnh', slug: 'tu-lanh' },
  { id: 'tivi', title: 'Tivi', slug: 'tivi' },
  { id: 'may-rua-bat', title: 'Máy rửa bát', slug: 'may-rua-bat' }
];
