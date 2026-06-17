'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardView } from './dashboard/dashboard-view';
import { ProductsView } from './products/products-view';
import { OrdersView } from './orders/orders-view';
import { MediaView } from './media/media-view';
import { NewsView } from './news/news-view';
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
    if (storedUser) setUser(JSON.parse(storedUser) as SessionUser);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !token) router.replace('/admin/login');
  }, [ready, router, token]);

  function logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem(userKey);
    setToken(null);
    setUser(null);
    router.replace('/admin/login');
  }

  if (!ready || !token) return <Notice>Đang chuyển tới trang đăng nhập...</Notice>;

  if (view === 'products') {
    return <ProductsView token={token} onUnauthorized={logout} />;
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-gray-500">Quản trị hệ thống</div>
          <h1 className="mt-1 text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
          <div className="mt-1 text-sm text-gray-500">
            {user?.fullName ?? user?.username} · {roleLabel(user?.role)}
          </div>
        </div>
        <button
          onClick={logout}
          className="h-10 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white"
        >
          Đăng xuất
        </button>
      </div>

      {view === 'dashboard' ? <DashboardView token={token} onUnauthorized={logout} /> : null}
      {view === 'orders' ? <OrdersView token={token} onUnauthorized={logout} /> : null}
      {view === 'banners' ? (
        <MediaView token={token} onUnauthorized={logout} resource="banners" title="Banner" />
      ) : null}
      {view === 'sliders' ? (
        <MediaView token={token} onUnauthorized={logout} resource="sliders" title="Slide" />
      ) : null}
      {view === 'news' ? <NewsView token={token} onUnauthorized={logout} /> : null}
      {view === 'contacts' ? <ContactsView token={token} onUnauthorized={logout} /> : null}
      {view === 'users' ? (
        <UsersView token={token} onUnauthorized={logout} currentUserId={user?.id} />
      ) : null}
      {view === 'settings' ? <SettingsView token={token} onUnauthorized={logout} /> : null}
    </main>
  );
}
