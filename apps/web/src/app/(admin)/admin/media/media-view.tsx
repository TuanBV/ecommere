'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Edit3, ImagePlus, Images, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { mediaUrl } from '@/lib/api';
import { authRequest, authUpload, handleError } from '../common/api';

type MediaItem = {
  id: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  position?: string | number | null;
  isActive?: boolean | number | null;
};

type MediaForm = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  isActive: string;
};

type Toast = {
  type: 'success' | 'error';
  message: string;
};

const emptyForm: MediaForm = {
  id: '',
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  position: '',
  isActive: '1'
};

export function MediaView({
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
  const [items, setItems] = useState<MediaItem[]>([]);
  const [form, setForm] = useState<MediaForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const isSlider = resource === 'sliders';
  const pageTitle = isSlider ? 'Quản lý Slider' : 'Quản lý Banner';
  const pageSubtitle = isSlider
    ? 'Quản lý slide hiển thị trên trang chủ và các khu vực nổi bật'
    : 'Quản lý banner quảng cáo, vị trí hiển thị và liên kết điều hướng';

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesKeyword =
        !keyword ||
        (item.title ?? '').toLowerCase().includes(keyword) ||
        (item.description ?? '').toLowerCase().includes(keyword) ||
        (item.position !== undefined && String(item.position).toLowerCase().includes(keyword));
      const active = isActiveValue(item.isActive) ? '1' : '0';
      const matchesStatus = !statusFilter || active === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [items, query, statusFilter]);

  async function load() {
    try {
      setItems(await authRequest<MediaItem[]>(`/admin/${resource}`, token));
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token, resource]);

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
    setForm({ ...emptyForm, position: isSlider ? '1' : 'HOME_TOP' });
    setModalOpen(true);
  }

  function openEdit(item: MediaItem) {
    setForm({
      id: item.id,
      title: item.title ?? '',
      description: item.description ?? '',
      imageUrl: item.imageUrl ?? '',
      linkUrl: item.linkUrl ?? '',
      position: item.position !== undefined && item.position !== null ? String(item.position) : '',
      isActive: isActiveValue(item.isActive) ? '1' : '0'
    });
    setModalOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return showError('Vui lòng nhập tiêu đề');
    if (!form.imageUrl.trim()) return showError('Vui lòng chọn ảnh');

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        linkUrl: form.linkUrl.trim(),
        position: isSlider ? Number(form.position || 1) : form.position.trim(),
        isActive: Number(form.isActive)
      };
      const body = isSlider ? payload : omitDescription(payload);

      if (form.id) {
        await authRequest(`/admin/${resource}/${form.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(body)
        });
        showSuccess(`Đã cập nhật ${title.toLowerCase()}`);
      } else {
        await authRequest(`/admin/${resource}`, token, {
          method: 'POST',
          body: JSON.stringify(body)
        });
        showSuccess(`Đã tạo ${title.toLowerCase()} mới`);
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Xóa "${item.title ?? title}"?`)) return;
    try {
      await authRequest(`/admin/${resource}/${item.id}`, token, { method: 'DELETE' });
      showSuccess(`Đã xóa ${title.toLowerCase()}`);
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    }
  }

  async function upload(file: File) {
    const body = new FormData();
    body.append('file', file);
    setUploading(true);
    try {
      const result = await authUpload<{ url: string }>(`/admin/uploads/${resource}`, token, body);
      setForm((current) => ({ ...current, imageUrl: result.url }));
      showSuccess('Đã upload ảnh');
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="relative">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-700">{pageTitle}</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">{pageSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          {isSlider ? 'Thêm slide mới' : 'Thêm banner mới'}
        </button>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Tìm theo tiêu đề, vị trí ${isSlider ? 'hoặc mô tả' : ''}...`}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hiển thị</option>
            <option value="0">Đang tắt</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            <RefreshCw size={18} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-[1.4fr_1fr_150px_130px_100px] gap-4 bg-slate-50 px-5 py-4 text-xs font-black uppercase text-slate-500">
          <div>Nội dung</div>
          <div>Liên kết</div>
          <div>Vị trí</div>
          <div>Trạng thái</div>
          <div className="text-right">Thao tác</div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1.4fr_1fr_150px_130px_100px] items-center gap-4 px-5 py-4 text-sm"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  {item.imageUrl ? (
                    <img
                      src={mediaUrl(item.imageUrl)}
                      alt={item.title ?? title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Images size={22} className="text-slate-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold text-slate-700">{item.title}</div>
                  {isSlider ? (
                    <div className="line-clamp-1 text-xs font-semibold text-slate-500">
                      {item.description || 'Chưa có mô tả'}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="min-w-0 truncate font-semibold text-slate-600">
                {item.linkUrl || 'Không có link'}
              </div>
              <div className="font-semibold text-slate-600">{String(item.position ?? '-')}</div>
              <div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                    isActiveValue(item.isActive)
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isActiveValue(item.isActive) ? 'Hiển thị' : 'Đang tắt'}
                </span>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="text-blue-600 transition hover:text-blue-800"
                  aria-label={`Sửa ${title}`}
                >
                  <Edit3 size={19} />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  className="text-rose-500 transition hover:text-rose-700"
                  aria-label={`Xóa ${title}`}
                >
                  <Trash2 size={19} />
                </button>
              </div>
            </div>
          ))}
          {!filteredItems.length ? (
            <div className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
              Không có dữ liệu phù hợp
            </div>
          ) : null}
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <ImagePlus className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-slate-700">
                  {form.id ? `Cập nhật ${title.toLowerCase()}` : `Tạo ${title.toLowerCase()} mới`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-500 transition hover:text-slate-800"
                aria-label="Đóng"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-6 px-6 py-5 lg:grid-cols-[1fr_320px]">
              <div className="grid content-start gap-4">
                <AdminInput
                  label="Tiêu đề *"
                  value={form.title}
                  onChange={(value) => setForm((current) => ({ ...current, title: value }))}
                />
                {isSlider ? (
                  <label className="grid gap-2">
                    <span className="text-[11px] font-black uppercase text-slate-500">Mô tả</span>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, description: event.target.value }))
                      }
                      className="min-h-24 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                ) : null}
                <AdminInput
                  label="Link điều hướng"
                  value={form.linkUrl}
                  onChange={(value) => setForm((current) => ({ ...current, linkUrl: value }))}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <AdminInput
                    label={isSlider ? 'Thứ tự hiển thị' : 'Vị trí hiển thị'}
                    type={isSlider ? 'number' : 'text'}
                    value={form.position}
                    onChange={(value) => setForm((current) => ({ ...current, position: value }))}
                  />
                  <label className="grid gap-2">
                    <span className="text-[11px] font-black uppercase text-slate-500">
                      Trạng thái
                    </span>
                    <select
                      value={form.isActive}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isActive: event.target.value }))
                      }
                      className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="1">Đang hiển thị</option>
                      <option value="0">Đang tắt</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="mb-3 text-xs font-black uppercase text-slate-500">Ảnh hiển thị</div>
                <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-xl border border-dashed border-blue-300 bg-white">
                  {form.imageUrl ? (
                    <>
                      <img
                        src={mediaUrl(form.imageUrl)}
                        alt={form.title || title}
                        className="h-full w-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, imageUrl: '' }))}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-rose-500 text-white shadow"
                        aria-label="Xóa ảnh"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <ImagePlus className="text-blue-400" size={32} />
                  )}
                </div>
                <input
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, imageUrl: event.target.value }))
                  }
                  placeholder="/uploads/banners/example.webp"
                  className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <label className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700">
                  <ImagePlus size={17} />
                  {uploading ? 'Đang upload...' : 'Upload ảnh'}
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
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-11 rounded-xl bg-white px-6 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                disabled={saving}
                className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {toast ? <ToastMessage toast={toast} /> : null}
    </section>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = 'text'
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function ToastMessage({ toast }: { toast: Toast }) {
  return (
    <div
      className={`fixed right-6 top-6 z-[70] rounded-xl px-5 py-3 text-sm font-bold text-white shadow-xl ${
        toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
      }`}
    >
      {toast.message}
    </div>
  );
}

function isActiveValue(value: MediaItem['isActive']) {
  return value === true || value === 1;
}

function omitDescription(payload: {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: string | number;
  isActive: number;
}) {
  const { description: _description, ...rest } = payload;
  return rest;
}
