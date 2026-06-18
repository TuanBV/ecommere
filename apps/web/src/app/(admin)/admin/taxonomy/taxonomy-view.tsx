'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Edit3, ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { mediaUrl } from '@/lib/api';
import { authRequest, authUpload, handleError } from '../common/api';
import type { OptionItem } from '../common/types';

type Resource = 'categories' | 'brands';

type FormState = {
  id: string;
  title: string;
  slug: string;
  logo: string;
  priority: string;
};

const emptyForm: FormState = {
  id: '',
  title: '',
  slug: '',
  logo: '',
  priority: '0'
};

export function TaxonomyView({
  token,
  onUnauthorized,
  resource,
  title,
  subtitle
}: {
  token: string;
  onUnauthorized: () => void;
  resource: Resource;
  title: string;
  subtitle: string;
}) {
  const [items, setItems] = useState<OptionItem[]>([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => item.title.toLowerCase().includes(keyword));
  }, [items, query]);

  async function load() {
    try {
      setItems(await authRequest<OptionItem[]>(`/admin/${resource}`, token));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token, resource]);

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
    setError('');
  }

  function openEdit(item: OptionItem) {
    setForm({
      id: item.id,
      title: item.title,
      slug: item.slug ?? '',
      logo: item.logo ?? '',
      priority: String(item.priority ?? 0)
    });
    setModalOpen(true);
    setError('');
  }

  async function upload(file: File) {
    const body = new FormData();
    body.append('file', file);
    setUploading(true);
    try {
      const result = await authUpload<{ url: string }>(`/admin/uploads/${resource}`, token, body);
      setForm((current) => ({ ...current, logo: result.url }));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError(`Vui lòng nhập tên ${resource === 'brands' ? 'thương hiệu' : 'danh mục'}.`);
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      logo: form.logo.trim(),
      priority: Number(form.priority || 0)
    };

    try {
      if (form.id) {
        await authRequest(`/admin/${resource}/${form.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        await authRequest(`/admin/${resource}`, token, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setModalOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  async function remove(item: OptionItem) {
    if (!window.confirm(`Xóa "${item.title}"?`)) return;
    try {
      await authRequest(`/admin/${resource}/${item.id}`, token, { method: 'DELETE' });
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  return (
    <div className="mx-auto grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          {resource === 'brands' ? 'Thêm thương hiệu' : 'Thêm danh mục'}
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
            placeholder={resource === 'brands' ? 'Tìm kiếm thương hiệu...' : 'Tìm kiếm danh mục...'}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <div className="flex gap-3">
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm">
            <option>{Math.min(5, filteredItems.length || 5)} bản ghi</option>
          </select>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm">
            <option>Mặc định (Mới nhất)</option>
          </select>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-[90px_1fr_1.3fr_120px] bg-slate-50 px-6 py-4 text-xs font-black uppercase text-slate-500">
          <div>STT</div>
          <div>Logo</div>
          <div>{resource === 'brands' ? 'Tên thương hiệu' : 'Tên danh mục'}</div>
          <div className="text-right">Hành động</div>
        </div>
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[90px_1fr_1.3fr_120px] items-center border-t border-slate-100 px-6 py-5 text-sm"
          >
            <div className="font-semibold text-slate-600">{index + 1}</div>
            <div>
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {item.logo ? (
                  <img
                    src={mediaUrl(item.logo)}
                    alt={item.title}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span className="text-xs font-black text-slate-400">
                    {item.title.slice(0, 2)}
                  </span>
                )}
              </div>
            </div>
            <div className="font-bold text-slate-700">{item.title}</div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => openEdit(item)}
                className="grid h-9 w-9 place-items-center rounded-lg text-blue-600 hover:bg-blue-50"
                aria-label="Sửa"
              >
                <Edit3 size={18} />
              </button>
              <button
                type="button"
                onClick={() => void remove(item)}
                className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
                aria-label="Xóa"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm font-bold text-slate-600">
          <span>Tổng số {filteredItems.length} bản ghi</span>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-[448px] rounded-xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-700">
                {form.id
                  ? resource === 'brands'
                    ? 'Cập nhật thương hiệu'
                    : 'Cập nhật danh mục'
                  : resource === 'brands'
                    ? 'Thêm thương hiệu'
                    : 'Thêm danh mục'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-500">
                <X size={22} />
              </button>
            </div>
            {error ? (
              <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
                {error}
              </div>
            ) : null}
            <div className="mb-5 grid place-items-center gap-3">
              <label className="grid h-24 w-24 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                {form.logo ? (
                  <img
                    src={mediaUrl(form.logo)}
                    alt={form.title}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <ImagePlus className="text-blue-500" size={28} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                    event.target.value = '';
                  }}
                />
              </label>
              <span className="text-xs font-bold text-slate-500">
                {uploading
                  ? 'Đang upload...'
                  : `Tải lên logo ${resource === 'brands' ? 'thương hiệu' : 'danh mục'}`}
              </span>
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-600">
                {resource === 'brands' ? 'Tên thương hiệu' : 'Tên danh mục'}
              </span>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="mt-4 grid gap-2">
              <span className="text-sm font-bold text-slate-600">Slug</span>
              <input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({ ...current, slug: event.target.value }))
                }
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            {resource === 'categories' ? (
              <label className="mt-4 grid gap-2">
                <span className="text-sm font-bold text-slate-600">Ưu tiên</span>
                <input
                  type="number"
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, priority: event.target.value }))
                  }
                  className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ) : null}
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-11 rounded-xl bg-slate-100 text-sm font-bold text-slate-600"
              >
                Hủy bỏ
              </button>
              <button className="h-11 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
