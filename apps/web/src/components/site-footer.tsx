'use client';

import Link from 'next/link';
import { ChevronRight, Menu, Phone } from 'lucide-react';

const phone = '0852262666';

function openMobileSidebar() {
  window.dispatchEvent(new CustomEvent('sidebar:open'));
}

export function SiteFooter() {
  return (
    <footer id="footer" className="mt-auto bg-white pb-8 pt-12 text-base text-gray-600">
      <div className="container">
        {/* Showroom + Map */}
        <div className="mb-10 grid grid-cols-1 items-start gap-6 border-b border-gray-100 pb-8 md:grid-cols-2 md:gap-10">
          <div className="cursor-pointer">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-lg font-semibold uppercase tracking-wide text-gray-700">
                Showroom Green Home Shop
              </span>

              <span
                title="Chi tiết"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white transition-colors hover:bg-blue-700"
              >
                <ChevronRight size={16} />
              </span>
            </div>

            <div className="space-y-3 text-base leading-relaxed text-gray-700">
              <p>
                <strong>Giờ làm việc:</strong> 08:00 - 18:00, Thứ 2 - Chủ nhật
              </p>

              <p>
                <span className="font-semibold text-gray-700">Địa chỉ:</span>
                <br />
                LK7-142, Khu tái định cư phục vụ giải phóng mặt bằng, Xã Tứ Hiệp, Huyện Thanh Trì,
                Thành phố Hà Nội 100000, Việt Nam
              </p>

              <p>
                <span className="font-semibold text-gray-700">Hotline:</span>{' '}
                <a href={`tel:${phone}`} className="text-blue-700 hover:underline">
                  {phone}
                </a>
              </p>

              <p>
                <span className="font-semibold text-gray-700">Email:</span>{' '}
                <span>lienheghd@gmail.com</span>
              </p>

              <p>
                <span className="font-semibold text-gray-700">Mã số thuế:</span> 0110891976
              </p>
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7452.571635488802!2d105.84375719959951!3d20.94103408590247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad926a912381%3A0x58f4b3bf10788674!2zQ8OUTkcgVFkgVE5ISCBUSMavxqBORyBN4bqgSSBWw4AgQ8OUTkcgTkdI4buGIEdIRA!5e0!3m2!1svi!2s!4v1778579330893!5m2!1svi!2s"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ vị trí cửa hàng Green Home Shop"
              />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="mb-5 flex w-full items-center justify-center md:justify-start md:w-1/2 lg:w-1/4">
          <Link href="/" aria-label="Green Home" className="flex h-10 items-center">
            <picture>
              <source type="image/webp" srcSet="/client/images/greenhome-logo-500.lossless.webp" />
              <img
                src="/client/images/logo.png"
                alt=""
                className="h-auto w-[180px] object-contain md:w-[200px]"
                width={200}
                height={43}
                loading="eager"
              />
            </picture>
          </Link>
        </div>

        {/* Footer columns */}
        <div className="grid grid-cols-1 gap-5 text-center sm:text-left sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
          <div className="space-y-3 text-base leading-relaxed text-gray-700">
            <FooterPhone title="Tư vấn mua hàng" />
            <FooterPhone title="Hỗ trợ kỹ thuật" />
            <FooterPhone title="Góp ý, khiếu nại" />
          </div>

          <FooterCol
            title="Chính sách"
            links={[
              ['Quy định chung', '/chinh-sach/quy-dinh-chung'],
              ['Điều khoản và chính sách', '/chinh-sach/dieu-khoan-su-dung-va-bao-mat'],
              ['Chính sách bảo hành', '/chinh-sach/bao-hanh'],
              ['Chính sách thanh toán', '/chinh-sach/thanh-toan'],
              ['Chính sách vận chuyển', '/chinh-sach/van-chuyen'],
              ['Chính sách đổi trả hàng', '/chinh-sach/doi-tra']
            ]}
          />

          <div className="flex flex-col items-center justify-center sm:items-start">
            <h3 className="mb-6 text-base font-semibold uppercase tracking-wider text-gray-700">
              Về chúng tôi
            </h3>

            <ul className="space-y-3 text-base text-gray-700">
              <li>
                <Link href="/ve-chung-toi" className="transition-colors hover:text-blue-900">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="transition-colors hover:text-blue-900">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="transition-colors hover:text-blue-900">
                  Tin tức
                </Link>
              </li>
            </ul>

            <div className="space-y-3 pt-3 flex flex-col items-center sm:items-start">
              <p className="font-semibold uppercase text-gray-700 md:text-base">
                Công ty TNHH Thương mại và Công nghệ GHD
              </p>

              <p className="text-base">
                Mã số thuế: <span className="font-medium text-gray-700">0110891976</span>
                <br />
                do Sở KH&amp;ĐT TP.HN cấp ngày: 18/11/2024
              </p>

              <a
                href="https://online.gov.vn/Home/WebDetails/140706"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                <img
                  src="/client/images/logoBCT.png"
                  alt="Chứng nhận Đã thông báo Bộ Công Thương"
                  className="h-14 w-auto object-contain"
                  width={150}
                  height={56}
                  loading="lazy"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="mt-12 flex items-center justify-center gap-5 pb-3">
          <span>Mạng xã hội</span>

          <a
            href="https://www.facebook.com/greenhomeshop.vn"
            className="text-gray-400 transition-colors hover:text-blue-600"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </a>
        </div>

        <div className="border-t border-gray-200 pt-3 text-center">
          <p className="text-base text-gray-600">© 2026 Green Home Shop - Gia dụng thông minh.</p>
        </div>
      </div>

      {/* Floating contact desktop */}
      <div className="fixed bottom-10 left-8 z-[30] hidden flex-col gap-5 lg:flex">
        <FloatingIcon
          href="https://www.messenger.com/t/191032857437399"
          img="/common/images/facebook-messenger.svg"
          label="Chat qua Facebook"
        />

        <FloatingIcon
          href={`https://zalo.me/${phone}`}
          img="/common/images/zalo.svg"
          label="Chat qua Zalo"
        />

        <a
          href={`tel:${phone}`}
          className="group relative flex items-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 py-1.5 pl-1.5 pr-6 text-white shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-5px_rgba(37,99,235,0.6)] active:scale-95"
        >
          <div className="relative flex h-12 w-12 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-700 shadow-inner transition-transform duration-700 group-hover:rotate-[360deg]">
              <Phone size={20} fill="currentColor" />
            </div>
          </div>

          <div className="ml-3 flex flex-col">
            <div className="mb-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-blue-100/80">
                Gọi ngay
              </span>
            </div>

            <span className="text-lg font-semibold leading-none tracking-widest">{phone}</span>
          </div>
        </a>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[45] border-t border-gray-200/60 bg-white/95 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-end justify-around py-2">
          <MobileAction href={`tel:${phone}`} label="Gọi ngay">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
              <Phone size={18} fill="currentColor" />
            </div>
          </MobileAction>

          <MobileAction href={`https://zalo.me/${phone}`} label="Zalo">
            <img src="/common/images/zalo.svg" alt="" className="h-6 w-6" />
          </MobileAction>

          <MobileAction href="https://m.me/191032857437399" label="Tin nhắn">
            <img src="/common/images/facebook-messenger.svg" alt="" className="h-6 w-6" />
          </MobileAction>

          <button
            type="button"
            className="flex flex-1 cursor-pointer flex-col items-center justify-center"
            onClick={openMobileSidebar}
          >
            <div className="mb-1 flex h-8 w-8 items-center justify-center transition-transform active:scale-90">
              <Menu size={28} className="text-gray-700" />
            </div>
            <span className="text-xs font-semibold uppercase text-gray-600">Danh mục</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterPhone({ title }: { title: string }) {
  return (
    <div className="space-y-1">
      <p className="text-base text-gray-600">
        {title}:
        <a href={`tel:${phone}`}>
          <span className="block font-semibold text-gray-700 md:text-base">{phone}</span>
        </a>
      </p>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="flex flex-col items-center sm:items-start">
      <h3 className="mb-6 text-base font-semibold uppercase tracking-wider text-gray-700">
        {title}
      </h3>

      <ul className="space-y-3 text-base text-gray-700">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="transition-colors hover:text-blue-900">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FloatingIcon({ href, img, label }: { href: string; img: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-gray-100 bg-white shadow-xl transition-all duration-300 hover:scale-110"
    >
      <img width={32} height={32} src={img} alt="" className="h-8 w-8" />

      <span className="pointer-events-none absolute left-full ml-4 translate-x-2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-2xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        {label}
      </span>
    </a>
  );
}

function MobileAction({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="group flex flex-1 flex-col items-center justify-center border-r border-gray-100"
    >
      <div className="mb-1 transition-transform group-active:scale-90">{children}</div>
      <span className="text-xs font-semibold uppercase text-gray-600">{label}</span>
    </a>
  );
}
