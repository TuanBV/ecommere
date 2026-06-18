'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Boxes,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Package,
  Presentation,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Users
} from 'lucide-react';

const adminTokenKey = 'core_admin_access_token';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(adminTokenKey);

    if (pathname === '/admin/login') {
      setAuthenticated(Boolean(token));
      setLoading(false);
      return;
    }

    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      router.replace('/admin/login');
      return;
    }

    setAuthenticated(true);
    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-sm font-medium text-gray-500">Dang tai...</div>
      </div>
    );
  }

  if (pathname === '/admin/login') return <>{children}</>;
  if (!authenticated) return null;

  function logout() {
    localStorage.removeItem(adminTokenKey);
    localStorage.removeItem('core_admin_refresh_token');
    localStorage.removeItem('core_admin_user');
    router.replace('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#ededed] text-slate-700 lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="border-b border-slate-100 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0">
        <div className="flex h-[104px] items-center px-5">
          <img
            src="/client/images/logo.png"
            alt="GreenHome"
            className="h-auto w-[176px] object-contain"
          />
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 lg:grid lg:flex-1 lg:content-start lg:gap-1">
          <AdminLink href="/admin" icon={<LayoutDashboard size={18} />} pathname={pathname}>
            Dashboard
          </AdminLink>
          <AdminLink href="/admin/users" icon={<Users size={18} />} pathname={pathname}>
            User
          </AdminLink>
          <AdminLink href="/admin/categories" icon={<Boxes size={18} />} pathname={pathname}>
            Danh mục
          </AdminLink>
          <AdminLink href="/admin/brands" icon={<Tags size={18} />} pathname={pathname}>
            Thương hiệu
          </AdminLink>
          <AdminLink href="/admin/products" icon={<Package size={18} />} pathname={pathname}>
            Sản phẩm
          </AdminLink>
          <AdminLink href="/admin/sliders" icon={<Presentation size={18} />} pathname={pathname}>
            Slider
          </AdminLink>
          <AdminLink href="/admin/banners" icon={<Images size={18} />} pathname={pathname}>
            Banner
          </AdminLink>
          <AdminLink href="/admin/news" icon={<Newspaper size={18} />} pathname={pathname}>
            Tin tức
          </AdminLink>
          <AdminLink href="/admin/policies" icon={<ShieldCheck size={18} />} pathname={pathname}>
            Chính sách
          </AdminLink>
          <AdminLink href="/admin/orders" icon={<ShoppingBag size={18} />} pathname={pathname}>
            Đơn hàng
          </AdminLink>
          <AdminLink href="/admin/contacts" icon={<Mail size={18} />} pathname={pathname}>
            Liên hệ
          </AdminLink>
        </nav>

        <nav className="grid gap-1 p-3">
          <AdminLink href="/admin/settings" icon={<Settings size={18} />} pathname={pathname}>
            Cài đặt
          </AdminLink>
          <button
            type="button"
            onClick={logout}
            className="flex h-10 shrink-0 items-center gap-3 rounded-[8px] px-3 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      <section className="min-w-0">{children}</section>
    </div>
  );
}

function AdminLink({
  href,
  icon,
  pathname,
  children
}: {
  href: string;
  icon: React.ReactNode;
  pathname: string;
  children: React.ReactNode;
}) {
  const active = href === '/admin' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex h-10 shrink-0 items-center gap-3 rounded-[8px] px-3 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-600 ${
        active ? 'bg-slate-50 text-blue-500 ring-4 ring-slate-100' : 'text-slate-900'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
