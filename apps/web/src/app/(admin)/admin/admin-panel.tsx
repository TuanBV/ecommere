'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { DashboardView } from './dashboard/dashboard-view';
import { TaxonomyView } from './taxonomy/taxonomy-view';
import { ProductsView } from './products/products-view';
import { OrdersView } from './orders/orders-view';
import { MediaView } from './media/media-view';
import { NewsView } from './news/news-view';
import { PoliciesView } from './policies/policies-view';
import { ContactsView } from './contacts/contacts-view';
import { UsersView } from './users/users-view';
import { SettingsView } from './settings/settings-view';
import { Notice } from './common/ui';
import { refreshKey, roleLabel, tokenKey, userKey } from './common/session';
import type { SessionUser, Tab } from './common/types';

export { AdminLogin } from './auth/admin-login';

export function AdminPanel({ view = 'dashboard' }: { view?: Tab }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem(tokenKey));

    const storedUser = localStorage.getItem(userKey);
    if (storedUser) {
      setUser(JSON.parse(storedUser) as SessionUser);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !token) {
      router.replace('/admin/login');
    }
  }, [ready, router, token]);

  function logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem(userKey);
    setToken(null);
    setUser(null);
    router.replace('/admin/login');
  }

  if (!ready || !token) {
    return <Notice>Đang chuyển tới trang đăng nhập...</Notice>;
  }

  return (
    <main className="min-h-screen w-full bg-[#f3f3f3]">
      <AdminTopBar view={view} user={user} onLogout={logout} />

      <div className="w-full px-5 py-6 lg:px-8">
        {view === 'dashboard' ? <DashboardView token={token} onUnauthorized={logout} /> : null}

        {view === 'products' ? <ProductsView token={token} onUnauthorized={logout} /> : null}

        {view === 'categories' ? (
          <TaxonomyView
            token={token}
            onUnauthorized={logout}
            resource="categories"
            title="Quản lý danh mục"
            subtitle="Quản lý nhóm sản phẩm hiển thị trên website"
          />
        ) : null}

        {view === 'brands' ? (
          <TaxonomyView
            token={token}
            onUnauthorized={logout}
            resource="brands"
            title="Quản lý thương hiệu"
            subtitle="Quản lý logo và tên thương hiệu sản phẩm"
          />
        ) : null}

        {view === 'orders' ? <OrdersView token={token} onUnauthorized={logout} /> : null}

        {view === 'banners' ? (
          <MediaView token={token} onUnauthorized={logout} resource="banners" title="Banner" />
        ) : null}

        {view === 'sliders' ? (
          <MediaView token={token} onUnauthorized={logout} resource="sliders" title="Slide" />
        ) : null}

        {view === 'news' ? <NewsView token={token} onUnauthorized={logout} /> : null}

        {view === 'policies' ? <PoliciesView token={token} onUnauthorized={logout} /> : null}

        {view === 'contacts' ? <ContactsView token={token} onUnauthorized={logout} /> : null}

        {view === 'users' ? (
          <UsersView token={token} onUnauthorized={logout} currentUserId={user?.id} />
        ) : null}

        {view === 'settings' ? <SettingsView token={token} onUnauthorized={logout} /> : null}
      </div>
    </main>
  );
}

function AdminTopBar({
  view,
  user,
  onLogout
}: {
  view: Tab;
  user: SessionUser | null;
  onLogout: () => void;
}) {
  const displayName = user?.fullName ?? user?.username ?? 'Admin';
  const avatarText = displayName.charAt(0).toUpperCase();

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 shadow-sm lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold text-gray-900">{getPageTitle(view)}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-semibold text-gray-800">{displayName}</div>
          <div className="text-xs font-medium text-gray-500">{roleLabel(user?.role)}</div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
          {avatarText}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

function getPageTitle(view: Tab) {
  switch (view) {
    case 'dashboard':
      return 'Dashboard';

    case 'products':
      return 'Sản phẩm';

    case 'categories':
      return 'Danh mục';

    case 'brands':
      return 'Thương hiệu';

    case 'orders':
      return 'Đơn hàng';

    case 'banners':
      return 'Banner';

    case 'sliders':
      return 'Slider';

    case 'news':
      return 'Tin tức';

    case 'policies':
      return 'Chính sách';

    case 'contacts':
      return 'Liên hệ';

    case 'users':
      return 'User';

    case 'settings':
      return 'Cài đặt';

    default:
      return 'Dashboard';
  }
}
