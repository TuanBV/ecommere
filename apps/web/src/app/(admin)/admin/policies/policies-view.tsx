'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Box, Edit3, Gift, Plus, Search, ShieldCheck, Trash2, Wrench, X } from 'lucide-react';
import { authRequest, handleError } from '../common/api';
import type { AdminPolicy, AdminProduct } from '../common/types';

type ProductLite = Pick<AdminProduct, 'id' | 'title' | 'sku' | 'policyId'>;

type PolicyForm = {
  id: string;
  packageName: string;
  policies: string[];
  afterSales: string[];
  gifts: string[];
  productIds: string[];
};

type Toast = {
  type: 'success' | 'error';
  message: string;
};

const emptyForm: PolicyForm = {
  id: '',
  packageName: '',
  policies: [''],
  afterSales: [''],
  gifts: [''],
  productIds: []
};

export function PoliciesView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [items, setItems] = useState<AdminPolicy[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [form, setForm] = useState<PolicyForm>(emptyForm);
  const [query, setQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => item.packageName.toLowerCase().includes(keyword));
  }, [items, query]);

  const selectedProducts = form.productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is ProductLite => Boolean(product));

  const productSuggestions = useMemo(() => {
    const keyword = productQuery.trim().toLowerCase();
    if (!keyword) return [];
    return products
      .filter((product) => !form.productIds.includes(product.id))
      .filter(
        (product) =>
          product.title.toLowerCase().includes(keyword) ||
          (product.sku ?? '').toLowerCase().includes(keyword)
      )
      .slice(0, 8);
  }, [form.productIds, productQuery, products]);

  async function load() {
    try {
      const [policyList, productList] = await Promise.all([
        authRequest<AdminPolicy[]>('/admin/policies', token),
        authRequest<ProductLite[]>('/admin/products', token)
      ]);
      setItems(policyList);
      setProducts(productList);
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showSuccess(message: string) {
    setToast({ type: 'success', message });
  }

  function showError(message: string) {
    setToast({ type: 'error', message });
  }

  function openCreate() {
    setForm(emptyForm);
    setProductQuery('');
    setModalOpen(true);
  }

  function openEdit(item: AdminPolicy) {
    setForm({
      id: item.id,
      packageName: item.packageName,
      policies: listWithEmpty(item.policies),
      afterSales: listWithEmpty(item.afterSales),
      gifts: listWithEmpty(item.gifts),
      productIds: item.products?.map((product) => product.id) ?? []
    });
    setProductQuery('');
    setModalOpen(true);
  }

  function updateList(field: 'policies' | 'afterSales' | 'gifts', index: number, value: string) {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => (itemIndex === index ? value : item))
    }));
  }

  function addListItem(field: 'policies' | 'afterSales' | 'gifts') {
    setForm((current) => ({ ...current, [field]: [...current[field], ''] }));
  }

  function removeListItem(field: 'policies' | 'afterSales' | 'gifts', index: number) {
    setForm((current) => {
      const next = current[field].filter((_, itemIndex) => itemIndex !== index);
      return { ...current, [field]: next.length ? next : [''] };
    });
  }

  function addProduct(product: ProductLite) {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(product.id)
        ? current.productIds
        : [...current.productIds, product.id]
    }));
    setProductQuery('');
  }

  function removeProduct(productId: string) {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.filter((id) => id !== productId)
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.packageName.trim()) {
      showError('Vui lòng nhập tên gói ưu đãi.');
      return;
    }

    const payload = {
      packageName: form.packageName.trim(),
      policies: compact(form.policies),
      afterSales: compact(form.afterSales),
      gifts: compact(form.gifts),
      productIds: form.productIds,
      isActive: 1
    };

    setSaving(true);
    try {
      if (form.id) {
        await authRequest(`/admin/policies/${form.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        showSuccess('Cập nhật gói chính sách thành công.');
      } else {
        await authRequest('/admin/policies', token, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showSuccess('Tạo gói chính sách thành công.');
      }
      setModalOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: AdminPolicy) {
    if (!window.confirm(`Xóa gói chính sách "${item.packageName}"?`)) return;
    try {
      await authRequest(`/admin/policies/${item.id}`, token, { method: 'DELETE' });
      showSuccess('Xóa gói chính sách thành công.');
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    }
  }

  return (
    <div className="relative mx-auto grid gap-6">
      {toast ? (
        <div
          className={`fixed right-6 top-6 z-[1200] rounded-xl px-4 py-3 text-sm font-bold shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gói chính sách & Hậu mãi</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Thiết lập các quy định cho từng nhóm sản phẩm
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600"
        >
          <Plus size={18} />
          Tạo gói mới
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative w-full md:max-w-sm">
          <Search
            size={20}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm gói chính sách..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <div className="text-sm font-bold text-slate-500">Tổng số {filteredItems.length} gói</div>
      </div>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_110px] bg-slate-50 px-6 py-4 text-xs font-black uppercase text-slate-500">
          <div>Tên gói</div>
          <div>Chính sách</div>
          <div>Hậu mãi</div>
          <div>Quà tặng</div>
          <div className="text-right">Hành động</div>
        </div>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_110px] gap-4 border-t border-slate-100 px-6 py-5 text-sm"
          >
            <div className="font-bold leading-6 text-slate-700">{item.packageName}</div>
            <BulletList color="blue" items={item.policies} />
            <BulletList color="green" items={item.afterSales} />
            <BulletList color="orange" items={item.gifts} />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => openEdit(item)}
                className="grid h-9 w-9 place-items-center rounded-lg text-blue-600 hover:bg-blue-50"
                aria-label="Sửa chính sách"
              >
                <Edit3 size={18} />
              </button>
              <button
                type="button"
                onClick={() => void remove(item)}
                className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
                aria-label="Xóa chính sách"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-700">
                {form.id ? 'Cập nhật gói chính sách' : 'Tạo gói chính sách'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-800">
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-148px)] overflow-y-auto p-6">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-500">Tên gói ưu đãi</span>
                <input
                  value={form.packageName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, packageName: event.target.value }))
                  }
                  className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <PolicyColumn
                  color="blue"
                  icon={<ShieldCheck size={16} />}
                  title="Chính sách"
                  values={form.policies}
                  onAdd={() => addListItem('policies')}
                  onRemove={(index) => removeListItem('policies', index)}
                  onChange={(index, value) => updateList('policies', index, value)}
                />
                <PolicyColumn
                  color="green"
                  icon={<Wrench size={16} />}
                  title="Hậu mãi"
                  values={form.afterSales}
                  onAdd={() => addListItem('afterSales')}
                  onRemove={(index) => removeListItem('afterSales', index)}
                  onChange={(index, value) => updateList('afterSales', index, value)}
                />
                <PolicyColumn
                  color="orange"
                  icon={<Gift size={16} />}
                  title="Quà tặng"
                  values={form.gifts}
                  onAdd={() => addListItem('gifts')}
                  onRemove={(index) => removeListItem('gifts', index)}
                  onChange={(index, value) => updateList('gifts', index, value)}
                />
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-500">
                  <Box size={16} className="text-sky-500" />
                  Sản phẩm áp dụng
                </div>
                <div className="relative rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((product) => (
                      <span
                        key={product.id}
                        className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700"
                      >
                        <span className="truncate">{product.title}</span>
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="text-slate-500"
                          aria-label="Bỏ sản phẩm"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    <input
                      value={productQuery}
                      onChange={(event) => setProductQuery(event.target.value)}
                      placeholder="Chọn sản phẩm..."
                      className="h-8 min-w-[180px] flex-1 text-sm font-semibold outline-none"
                    />
                  </div>
                  {productSuggestions.length ? (
                    <div className="absolute left-3 right-3 top-[calc(100%+6px)] z-10 max-h-64 overflow-y-auto rounded-xl bg-white py-2 shadow-xl ring-1 ring-slate-200">
                      {productSuggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProduct(product)}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-50"
                        >
                          <span className="font-bold text-slate-700">{product.title}</span>
                          <span className="ml-2 text-xs font-semibold text-slate-400">
                            {product.sku}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-11 rounded-xl bg-white text-sm font-bold text-slate-700 ring-1 ring-slate-200"
              >
                Hủy
              </button>
              <button
                disabled={saving}
                className="h-11 rounded-xl bg-sky-500 text-sm font-bold text-white shadow-sm disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function BulletList({
  items,
  color
}: {
  items?: string[] | null;
  color: 'blue' | 'green' | 'orange';
}) {
  const className =
    color === 'blue' ? 'text-blue-500' : color === 'green' ? 'text-emerald-500' : 'text-orange-500';
  return (
    <div className="grid content-start gap-1 text-xs font-semibold leading-5 text-slate-600">
      {(items ?? []).map((item, index) => (
        <div key={`${item}-${index}`} className="flex gap-2">
          <span className={className}>✓</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function PolicyColumn({
  color,
  icon,
  title,
  values,
  onAdd,
  onRemove,
  onChange
}: {
  color: 'blue' | 'green' | 'orange';
  icon: React.ReactNode;
  title: string;
  values: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}) {
  const theme = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-amber-100 text-orange-700'
  }[color];
  const buttonTheme = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500'
  }[color];

  return (
    <section className={`rounded-xl p-4 ${theme}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold">
          {icon}
          {title}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={`rounded-md px-3 py-1 text-xs font-black text-white ${buttonTheme}`}
        >
          + THÊM
        </button>
      </div>
      <div className="grid max-h-44 gap-2 overflow-y-auto pr-1">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={value}
              onChange={(event) => onChange(index, event.target.value)}
              className="h-9 min-w-0 flex-1 rounded-lg bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="grid h-8 w-8 place-items-center text-rose-500"
              aria-label="Xóa dòng"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function compact(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean);
}

function listWithEmpty(items?: string[] | null) {
  return Array.isArray(items) && items.length ? items : [''];
}
