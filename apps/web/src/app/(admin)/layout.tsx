'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Images,
  LayoutDashboard,
  Mail,
  Newspaper,
  Package,
  Presentation,
  Settings,
  Shield,
  ShoppingBag,
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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-700 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-gray-200 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-700 text-white">
            <Shield size={18} />
          </div>
          <div>
            <div className="text-sm font-bold uppercase text-gray-900">Admin</div>
            <div className="text-xs text-gray-500">Green Home Shop</div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 lg:grid lg:gap-1">
          <AdminLink href="/admin" icon={<LayoutDashboard size={18} />}>
            Tong quan
          </AdminLink>
          <AdminLink href="/admin/products" icon={<Package size={18} />}>
            San pham
          </AdminLink>
          <AdminLink href="/admin/orders" icon={<ShoppingBag size={18} />}>
            Don hang
          </AdminLink>
          <AdminLink href="/admin/banners" icon={<Images size={18} />}>
            Banner
          </AdminLink>
          <AdminLink href="/admin/sliders" icon={<Presentation size={18} />}>
            Slide
          </AdminLink>
          <AdminLink href="/admin/news" icon={<Newspaper size={18} />}>
            Tin tuc
          </AdminLink>
          <AdminLink href="/admin/contacts" icon={<Mail size={18} />}>
            Lien he
          </AdminLink>
          <AdminLink href="/admin/users" icon={<Users size={18} />}>
            Tai khoan
          </AdminLink>
          <AdminLink href="/admin/settings" icon={<Settings size={18} />}>
            Setting
          </AdminLink>
          <Link
            href="/"
            className="flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          >
            Ve website
          </Link>
        </nav>
      </aside>

      <section className="min-w-0">{children}</section>
    </div>
  );
}

function AdminLink({
  href,
  icon,
  children
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
