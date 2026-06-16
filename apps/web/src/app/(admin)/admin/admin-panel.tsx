'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiBaseUrl, money } from '@/lib/api';

type ApiResponse<T> = { data: T };
type SessionUser = {
  id: string;
  username: string;
  email: string;
  fullName?: string | null;
  role?: number | null;
};
type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};
type Dashboard = {
  revenue: string | number;
  orderCount: number;
  newOrders: number;
  lowStock: { id: string; title: string; stockQty: number }[];
  topProducts: { id: string; title: string; soldCount: number }[];
};
type AdminUser = SessionUser & {
  phone?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
};
type Setting = {
  id: string;
  paramKey: string;
  paramValue: string;
  paramName: string;
  groupCode?: string | null;
  description?: string | null;
};
type OptionItem = { id: string; title: string };
type AdminProduct = {
  id: string;
  title: string;
  sku: string;
  slug?: string | null;
  categoryId: string;
  brandId: string;
  price: string;
  salePrice: string;
  stockQty: number;
  status?: number | null;
  image?: string | null;
  description?: string | null;
};
type AdminOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: string | number;
  status?: string | null;
  adminNote?: string | null;
  createdDate?: string | null;
};
type AdminContact = {
  id: string;
  fullName: string;
  phone: string;
  serviceType?: string | null;
  message?: string | null;
  status?: string | null;
  note?: string | null;
};
type Tab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'banners'
  | 'sliders'
  | 'news'
  | 'contacts'
  | 'users'
  | 'settings';

const tokenKey = 'core_admin_access_token';
const refreshKey = 'core_admin_refresh_token';
const userKey = 'core_admin_user';

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

  if (!ready || !token) return <Notice>Dang chuyen toi trang dang nhap...</Notice>;

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
      {view === 'products' ? <ProductsView token={token} onUnauthorized={logout} /> : null}
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

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');

  function saveSession(session: LoginResponse) {
    localStorage.setItem(tokenKey, session.accessToken);
    localStorage.setItem(refreshKey, session.refreshToken);
    localStorage.setItem(userKey, JSON.stringify(session.user));
    router.replace('/admin');
  }

  useEffect(() => {
    if (localStorage.getItem(tokenKey)) router.replace('/admin');
  }, [router]);

  return <LoginScreen onLogin={saveSession} error={error} setError={setError} />;
}

function LoginScreen({
  onLogin,
  error,
  setError
}: {
  onLogin: (session: LoginResponse) => void;
  error: string;
  setError: (value: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const session = await request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: form.get('username'),
          password: form.get('password')
        })
      });
      if (session.user.role !== 0) throw new Error('Tài khoản không có quyền admin');
      onLogin(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đăng nhập được');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container flex min-h-[calc(100vh-220px)] items-center justify-center py-10">
      <form
        onSubmit={submit}
        className="grid w-full max-w-md gap-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Đăng nhập quản trị</h1>
          <p className="mt-1 text-sm text-gray-500">
            Dùng tài khoản có role admin để vào dashboard.
          </p>
        </div>
        {error ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        <Field name="username" label="Username hoặc email" required />
        <Field name="password" label="Mật khẩu" type="password" required />
        <button
          disabled={loading}
          className="h-11 rounded-lg bg-blue-700 px-4 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </main>
  );
}

function DashboardView({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authRequest<Dashboard>('/admin/dashboard', token)
      .then(setDashboard)
      .catch((err) => handleError(err, setError, onUnauthorized));
  }, [token, onUnauthorized]);

  if (error) return <Notice>{error}</Notice>;
  if (!dashboard) return <Notice>Đang tải dữ liệu...</Notice>;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Doanh thu" value={money(dashboard.revenue)} />
        <Metric label="Đơn hàng" value={dashboard.orderCount} />
        <Metric label="Đơn mới" value={dashboard.newOrders} />
      </div>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-800">Sản phẩm sắp hết hàng</h2>
        <div className="grid gap-2 text-sm text-gray-600">
          {dashboard.lowStock.map((item) => (
            <div key={item.id}>
              {item.title} · {item.stockQty}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductsView({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [brands, setBrands] = useState<OptionItem[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [error, setError] = useState('');

  const empty = useMemo<AdminProduct>(
    () => ({
      id: '',
      title: '',
      sku: '',
      slug: '',
      categoryId: '',
      brandId: '',
      price: '0',
      salePrice: '0',
      stockQty: 0,
      status: 1,
      image: '',
      description: ''
    }),
    []
  );
  const value = editing ?? empty;

  async function load() {
    try {
      const [products, categoryList, brandList] = await Promise.all([
        authRequest<AdminProduct[]>('/admin/products', token),
        authRequest<OptionItem[]>('/admin/categories', token),
        authRequest<OptionItem[]>('/admin/brands', token)
      ]);
      setItems(products);
      setCategories(categoryList);
      setBrands(brandList);
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      if (editing?.id)
        await authRequest(`/admin/products/${editing.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      else
        await authRequest('/admin/products', token, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      setEditing(null);
      event.currentTarget.reset();
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  async function remove(id: string) {
    await authRequest(`/admin/products/${id}`, token, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[460px_1fr]">
      <form
        onSubmit={submit}
        className="grid content-start gap-3 rounded-2xl bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800">
          {editing ? 'Sua san pham' : 'Them san pham'}
        </h2>
        {error ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        <Field name="title" label="Ten san pham" defaultValue={value.title} required />
        <Field name="sku" label="SKU" defaultValue={value.sku} required />
        <Field name="slug" label="Slug" defaultValue={value.slug ?? ''} required />
        <SelectField
          name="categoryId"
          label="Danh muc"
          value={value.categoryId}
          items={categories}
        />
        <SelectField name="brandId" label="Thuong hieu" value={value.brandId} items={brands} />
        <div className="grid gap-3 md:grid-cols-2">
          <Field name="price" label="Gia" type="number" defaultValue={String(value.price)} />
          <Field
            name="salePrice"
            label="Gia sale"
            type="number"
            defaultValue={String(value.salePrice)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            name="stockQty"
            label="Ton kho"
            type="number"
            defaultValue={String(value.stockQty)}
          />
          <Field
            name="status"
            label="Trang thai"
            type="number"
            defaultValue={String(value.status ?? 1)}
          />
        </div>
        <Field name="image" label="Anh" defaultValue={value.image ?? ''} />
        <TextareaField name="description" label="Mo ta" defaultValue={value.description ?? ''} />
        <FormActions editing={Boolean(editing)} onCancel={() => setEditing(null)} />
      </form>
      <ListShell title="Danh sach san pham">
        {items.map((item) => (
          <ListRow
            key={item.id}
            title={item.title}
            desc={`${item.sku} · ${money(item.salePrice || item.price)} · Ton ${item.stockQty}`}
            onEdit={() => setEditing(item)}
            onDelete={() => void remove(item.id)}
          />
        ))}
      </ListShell>
    </div>
  );
}

function OrdersView({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems(await authRequest<AdminOrder[]>('/admin/orders', token));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function updateStatus(id: string, status: string) {
    await authRequest(`/admin/orders/${id}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    await load();
  }

  return (
    <section className="rounded-2xl bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">Don hang</div>
      {error ? <div className="p-4 text-sm text-red-700">{error}</div> : null}
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_180px] lg:items-center">
            <div>
              <div className="font-semibold text-gray-800">
                {item.customerName} · {item.customerPhone}
              </div>
              <div className="text-sm text-gray-500">
                {item.id} · {money(item.totalAmount)} · {item.status}
              </div>
            </div>
            <select
              value={item.status ?? 'PENDING'}
              onChange={(event) => void updateStatus(item.id, event.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
            >
              {['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}

function MediaView({
  token,
  onUnauthorized,
  resource,
  title
}: {
  token: string;
  onUnauthorized: () => void;
  resource: 'banners' | 'sliders';
  title: string;
}) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const value = editing ?? {};

  async function load() {
    try {
      setItems(await authRequest<Record<string, unknown>[]>(`/admin/${resource}`, token));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token, resource]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const id = String(value.id ?? '');
      if (id)
        await authRequest(`/admin/${resource}/${id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      else
        await authRequest(`/admin/${resource}`, token, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      setEditing(null);
      event.currentTarget.reset();
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  async function remove(id: string) {
    await authRequest(`/admin/${resource}/${id}`, token, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <form
        onSubmit={submit}
        className="grid content-start gap-3 rounded-2xl bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800">
          {String(value.id ?? '') ? `Sua ${title}` : `Them ${title}`}
        </h2>
        {error ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        <Field name="title" label="Tieu de" defaultValue={String(value.title ?? '')} required />
        {resource === 'sliders' ? (
          <TextareaField
            name="description"
            label="Mo ta"
            defaultValue={String(value.description ?? '')}
          />
        ) : null}
        <Field name="imageUrl" label="Anh" defaultValue={String(value.imageUrl ?? '')} required />
        <Field name="linkUrl" label="Link" defaultValue={String(value.linkUrl ?? '')} />
        <Field name="position" label="Vi tri" defaultValue={String(value.position ?? 'HOME_TOP')} />
        <Field
          name="isActive"
          label="Kich hoat 1/0"
          type="number"
          defaultValue={String(value.isActive ?? 1)}
        />
        <FormActions editing={Boolean(value.id)} onCancel={() => setEditing(null)} />
      </form>
      <ListShell title={`Danh sach ${title}`}>
        {items.map((item) => (
          <ListRow
            key={String(item.id)}
            title={String(item.title ?? '')}
            desc={`${String(item.imageUrl ?? '')} · ${String(item.position ?? '')}`}
            onEdit={() => setEditing(item)}
            onDelete={() => void remove(String(item.id))}
          />
        ))}
      </ListShell>
    </div>
  );
}

function NewsView({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [brands, setBrands] = useState<OptionItem[]>([]);
  const [error, setError] = useState('');
  const value = editing ?? {};

  async function load() {
    try {
      const [news, categoryList, brandList] = await Promise.all([
        authRequest<Record<string, unknown>[]>('/admin/news', token),
        authRequest<OptionItem[]>('/admin/categories', token),
        authRequest<OptionItem[]>('/admin/brands', token)
      ]);
      setItems(news);
      setCategories(categoryList);
      setBrands(brandList);
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const id = String(value.id ?? '');
      if (id)
        await authRequest(`/admin/news/${id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      else
        await authRequest('/admin/news', token, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      setEditing(null);
      event.currentTarget.reset();
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  async function remove(id: string) {
    await authRequest(`/admin/news/${id}`, token, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[460px_1fr]">
      <form
        onSubmit={submit}
        className="grid content-start gap-3 rounded-2xl bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800">
          {String(value.id ?? '') ? 'Sua tin tuc' : 'Them tin tuc'}
        </h2>
        {error ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        <Field name="title" label="Tieu de" defaultValue={String(value.title ?? '')} required />
        <Field name="slug" label="Slug" defaultValue={String(value.slug ?? '')} required />
        <SelectField
          name="categoryId"
          label="Danh muc"
          value={String(value.categoryId ?? '')}
          items={categories}
          allowEmpty
        />
        <SelectField
          name="brandId"
          label="Thuong hieu"
          value={String(value.brandId ?? '')}
          items={brands}
          allowEmpty
        />
        <Field name="thumbnail" label="Anh dai dien" defaultValue={String(value.thumbnail ?? '')} />
        <Field name="status" label="Trang thai" defaultValue={String(value.status ?? 'DRAFT')} />
        <TextareaField name="summary" label="Tom tat" defaultValue={String(value.summary ?? '')} />
        <TextareaField
          name="content"
          label="Noi dung HTML"
          defaultValue={String(value.content ?? '')}
        />
        <FormActions editing={Boolean(value.id)} onCancel={() => setEditing(null)} />
      </form>
      <ListShell title="Danh sach tin tuc">
        {items.map((item) => (
          <ListRow
            key={String(item.id)}
            title={String(item.title ?? '')}
            desc={`${String(item.slug ?? '')} · ${String(item.status ?? '')}`}
            onEdit={() => setEditing(item)}
            onDelete={() => void remove(String(item.id))}
          />
        ))}
      </ListShell>
    </div>
  );
}

function ContactsView({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [items, setItems] = useState<AdminContact[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems(await authRequest<AdminContact[]>('/admin/contacts', token));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function update(id: string, status: string) {
    await authRequest(`/admin/contacts/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    await load();
  }

  async function remove(id: string) {
    await authRequest(`/admin/contacts/${id}`, token, { method: 'DELETE' });
    await load();
  }

  return (
    <ListShell title="Lien he">
      {error ? <div className="p-4 text-sm text-red-700">{error}</div> : null}
      {items.map((item) => (
        <div
          key={item.id}
          className="grid gap-3 border-b border-gray-100 p-4 lg:grid-cols-[1fr_150px_auto] lg:items-center"
        >
          <div>
            <div className="font-semibold text-gray-800">
              {item.fullName} · {item.phone}
            </div>
            <div className="text-sm text-gray-500">
              {item.serviceType} · {item.message}
            </div>
          </div>
          <select
            value={item.status ?? 'NEW'}
            onChange={(event) => void update(item.id, event.target.value)}
            className="h-9 rounded-lg border border-gray-200 px-3 text-sm"
          >
            {['NEW', 'PROCESSING', 'DONE', 'CANCELLED'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={() => void remove(item.id)}
            className="h-9 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700"
          >
            Xoa
          </button>
        </div>
      ))}
    </ListShell>
  );
}

function UsersView({
  token,
  onUnauthorized,
  currentUserId
}: {
  token: string;
  onUnauthorized: () => void;
  currentUserId?: string;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [error, setError] = useState('');

  const emptyUser = useMemo<AdminUser>(
    () => ({
      id: '',
      username: '',
      email: '',
      fullName: '',
      phone: '',
      role: 1
    }),
    []
  );
  const formUser = editing ?? emptyUser;

  async function load() {
    try {
      setUsers(await authRequest<AdminUser[]>('/admin/users', token));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      username: form.get('username'),
      email: form.get('email'),
      fullName: form.get('fullName'),
      phone: form.get('phone'),
      role: Number(form.get('role')),
      password: form.get('password')
    };
    try {
      if (editing?.id) {
        await authRequest(`/admin/users/${editing.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (String(payload.password)) {
          await authRequest(`/admin/users/${editing.id}/password`, token, {
            method: 'PATCH',
            body: JSON.stringify({ password: payload.password })
          });
        }
      } else {
        await authRequest('/admin/users', token, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setEditing(null);
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  async function remove(id: string) {
    if (id === currentUserId) return setError('Không thể xóa tài khoản đang đăng nhập');
    await authRequest(`/admin/users/${id}`, token, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <form
        onSubmit={submit}
        className="grid content-start gap-3 rounded-2xl bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800">
          {editing ? 'Sửa tài khoản' : 'Tạo tài khoản'}
        </h2>
        {error ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        <Field name="username" label="Username" defaultValue={formUser.username} required />
        <Field name="email" label="Email" type="email" defaultValue={formUser.email} required />
        <Field name="fullName" label="Họ tên" defaultValue={formUser.fullName ?? ''} />
        <Field name="phone" label="Số điện thoại" defaultValue={formUser.phone ?? ''} />
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Phân quyền
          <select
            name="role"
            defaultValue={formUser.role ?? 1}
            className="h-10 rounded-lg border border-gray-200 px-3"
          >
            <option value={0}>Admin</option>
            <option value={1}>Nhân viên</option>
            <option value={2}>Khách hàng</option>
          </select>
        </label>
        <Field
          name="password"
          label={editing ? 'Mật khẩu mới' : 'Mật khẩu'}
          type="password"
          required={!editing}
        />
        <div className="flex gap-2">
          <button className="h-10 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">
            {editing ? 'Lưu' : 'Tạo mới'}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold"
            >
              Hủy
            </button>
          ) : null}
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">
          Danh sách tài khoản
        </div>
        <div className="divide-y divide-gray-100">
          {users.map((item) => (
            <div key={item.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="font-semibold text-gray-800">{item.fullName || item.username}</div>
                <div className="text-sm text-gray-500">
                  {item.username} · {item.email} · {roleLabel(item.role)}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(item)}
                  className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-semibold"
                >
                  Sửa
                </button>
                <button
                  onClick={() => void remove(item.id)}
                  className="h-9 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsView({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editing, setEditing] = useState<Setting | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setSettings(await authRequest<Setting[]>('/admin/settings', token));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await authRequest('/admin/settings', token, {
        method: 'POST',
        body: JSON.stringify({
          paramKey: form.get('paramKey'),
          paramValue: form.get('paramValue'),
          paramName: form.get('paramName'),
          groupCode: form.get('groupCode'),
          description: form.get('description')
        })
      });
      setEditing(null);
      event.currentTarget.reset();
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  async function remove(id: string) {
    await authRequest(`/admin/settings/${id}`, token, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <form
        onSubmit={submit}
        className="grid content-start gap-3 rounded-2xl bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800">
          {editing ? 'Sửa setting' : 'Thêm setting'}
        </h2>
        {error ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        <Field name="paramKey" label="Key" defaultValue={editing?.paramKey ?? ''} required />
        <Field
          name="paramName"
          label="Tên setting"
          defaultValue={editing?.paramName ?? ''}
          required
        />
        <Field name="groupCode" label="Nhóm" defaultValue={editing?.groupCode ?? ''} />
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Giá trị
          <textarea
            name="paramValue"
            defaultValue={editing?.paramValue ?? ''}
            className="min-h-28 rounded-lg border border-gray-200 px-3 py-2"
          />
        </label>
        <Field name="description" label="Mô tả" defaultValue={editing?.description ?? ''} />
        <div className="flex gap-2">
          <button className="h-10 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">
            Lưu setting
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold"
            >
              Hủy
            </button>
          ) : null}
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">
          Danh sách setting
        </div>
        <div className="divide-y divide-gray-100">
          {settings.map((item) => (
            <div key={item.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="font-semibold text-gray-800">{item.paramName}</div>
                <div className="text-sm text-gray-500">
                  {item.paramKey} · {item.groupCode || 'GENERAL'}
                </div>
                <div className="mt-1 line-clamp-2 text-sm text-gray-600">{item.paramValue}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(item)}
                  className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-semibold"
                >
                  Sửa
                </button>
                <button
                  onClick={() => void remove(item.id)}
                  className="h-9 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
  });
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok) throw new Error(messageForStatus(res.status, json));
  return json?.data as T;
}

function authRequest<T>(path: string, token: string, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) }
  });
}

function handleError(err: unknown, setError: (value: string) => void, onUnauthorized: () => void) {
  const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
  if (message.includes('401')) onUnauthorized();
  setError(message);
}

function messageForStatus(status: number, json: ApiResponse<unknown> | null) {
  const data = json?.data as { message?: string } | undefined;
  return data?.message ?? `API error ${status}`;
}

function Field(props: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-gray-700">
      {props.label}
      <input
        name={props.name}
        type={props.type ?? 'text'}
        defaultValue={props.defaultValue}
        required={props.required}
        className="h-10 rounded-lg border border-gray-200 px-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function TextareaField(props: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-gray-700">
      {props.label}
      <textarea
        name={props.name}
        defaultValue={props.defaultValue}
        required={props.required}
        className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function SelectField(props: {
  name: string;
  label: string;
  value?: string;
  items: OptionItem[];
  allowEmpty?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-gray-700">
      {props.label}
      <select
        name={props.name}
        defaultValue={props.value ?? ''}
        className="h-10 rounded-lg border border-gray-200 px-3"
      >
        {props.allowEmpty ? <option value="">Khong chon</option> : null}
        {props.items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormActions({ editing, onCancel }: { editing: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-2">
      <button className="h-10 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">
        {editing ? 'Luu' : 'Tao moi'}
      </button>
      {editing ? (
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold"
        >
          Huy
        </button>
      ) : null}
    </div>
  );
}

function ListShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">{title}</div>
      <div className="divide-y divide-gray-100">{children}</div>
    </section>
  );
}

function ListRow({
  title,
  desc,
  onEdit,
  onDelete
}: {
  title: string;
  desc: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="font-semibold text-gray-800">{title}</div>
        <div className="line-clamp-2 text-sm text-gray-500">{desc}</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-semibold"
        >
          Sua
        </button>
        <button
          onClick={onDelete}
          className="h-9 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700"
        >
          Xoa
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">{children}</div>;
}

function roleLabel(role?: number | null) {
  if (role === 0) return 'Admin';
  if (role === 1) return 'Nhân viên';
  return 'Khách hàng';
}
