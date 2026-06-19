'use client';

import dynamic from 'next/dynamic';
import {
  CalendarDays,
  Edit3,
  Eye,
  ImagePlus,
  Newspaper,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import 'suneditor/dist/css/suneditor.min.css';
import { mediaUrl } from '@/lib/api';
import { authRequest, authUpload, handleError } from '../common/api';
import type { OptionItem } from '../common/types';
import { AdminPagination, Field, SelectField, TextareaField } from '../common/ui';

const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false });

export function NewsView({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [brands, setBrands] = useState<OptionItem[]>([]);
  const [thumbnail, setThumbnail] = useState('');
  const [content, setContent] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const value = editing ?? {};
  const filteredItems = items.filter((item) => {
    const keyword = query.trim().toLowerCase();
    const title = String(item.title ?? '').toLowerCase();
    const status = String(item.status ?? '');
    return (!keyword || title.includes(keyword)) && (!statusFilter || status === statusFilter);
  });
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  useEffect(() => {
    setThumbnail(String(value.thumbnail ?? ''));
    setContent(String(value.content ?? ''));
  }, [value]);

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
    payload.thumbnail = thumbnail;
    payload.content = content;
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
      setFormOpen(false);
      setThumbnail('');
      setContent('');
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

  function openCreate() {
    setEditing(null);
    setThumbnail('');
    setContent('');
    setFormOpen(true);
  }

  function openEdit(item: Record<string, unknown>) {
    setEditing(item);
    setFormOpen(true);
  }

  async function upload(file: File) {
    const body = new FormData();
    body.append('file', file);
    setUploading(true);
    try {
      const result = await authUpload<{ url: string }>('/admin/uploads/news', token, body);
      setThumbnail(result.url);
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    } finally {
      setUploading(false);
    }
  }

  if (formOpen) {
    return (
      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <h2 className="text-xs font-black uppercase tracking-wide text-slate-600">
              {String(value.id ?? '') ? 'Cập nhật tin tức' : 'Viết bài mới'}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="h-10 rounded-xl bg-slate-100 px-4 text-xs font-black uppercase text-slate-600"
              >
                Hủy
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-black uppercase text-blue-700"
              >
                <Eye size={16} />
                Xem trước
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black uppercase text-white shadow-sm">
                <Save size={16} />
                Lưu bài viết
              </button>
            </div>
          </div>
          {error ? (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}
          <div className="grid gap-4">
            <Field
              name="title"
              label="Tiêu đề bài viết *"
              defaultValue={String(value.title ?? '')}
              required
            />
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                name="slug"
                label="Slug (đường dẫn)"
                defaultValue={String(value.slug ?? '')}
                required
              />
              <SelectField
                name="categoryId"
                label="Danh mục *"
                value={String(value.categoryId ?? '')}
                items={categories}
                allowEmpty
              />
              <SelectField
                name="brandId"
                label="Thương hiệu"
                value={String(value.brandId ?? '')}
                items={brands}
                allowEmpty
              />
            </div>
            <TextareaField
              name="summary"
              label="Tóm tắt ngắn"
              defaultValue={String(value.summary ?? '')}
            />
            <input type="hidden" name="content" value={content} />
            <div className="grid gap-2">
              <span className="text-[11px] font-black uppercase text-slate-500">
                Nội dung chi tiết *
              </span>
              <RichEditor value={content} onChange={setContent} />
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-5">
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <ImageUploadField
              name="thumbnail"
              label="Ảnh đại diện"
              value={thumbnail}
              uploading={uploading}
              onChange={setThumbnail}
              onUpload={upload}
            />
          </section>
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-4 text-xs font-black uppercase text-slate-600">Thiết lập</h3>
            <Field
              name="status"
              label="Trạng thái"
              defaultValue={String(value.status ?? 'DRAFT')}
            />
            <label className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
              Tin nổi bật
              <input type="checkbox" name="isFeatured" value="1" />
            </label>
          </section>
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-4 text-xs font-black uppercase text-slate-600">Tối ưu SEO</h3>
            <Field name="seoTitle" label="SEO title" defaultValue={String(value.title ?? '')} />
            <TextareaField
              name="seoDescription"
              label="SEO description"
              defaultValue={String(value.summary ?? '')}
            />
          </section>
        </aside>
      </form>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Bài viết</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Tin tức, bài viết dịch vụ và tối ưu SEO trang web
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Viết bài mới
        </button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
          <label className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tiêu đề bài viết..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã đăng</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
          <div className="grid h-12 place-items-center px-2 text-sm font-bold text-slate-600">
            Tổng: {filteredItems.length} bài viết
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-[minmax(420px,1fr)_170px_170px_130px_130px] bg-slate-50 px-6 py-4 text-xs font-black uppercase text-slate-500">
          <div>Nội dung bài viết</div>
          <div>Danh mục</div>
          <div>Thương hiệu</div>
          <div>Trạng thái</div>
          <div className="text-right">Thao tác</div>
        </div>
        {pagedItems.map((item) => (
          <div
            key={String(item.id)}
            className="grid grid-cols-[minmax(420px,1fr)_170px_170px_130px_130px] items-center border-t border-slate-100 px-6 py-4 text-sm"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {item.thumbnail ? (
                  <img
                    src={mediaUrl(String(item.thumbnail))}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Newspaper size={18} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate font-bold text-slate-700">{String(item.title ?? '')}</div>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                  <CalendarDays size={13} />
                  {formatDate(String(item.updatedDate ?? item.createdDate ?? ''))}
                </div>
              </div>
            </div>
            <Badge>{categoryTitle(String(item.categoryId ?? ''), categories)}</Badge>
            <Badge>{categoryTitle(String(item.brandId ?? ''), brands)}</Badge>
            <div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase text-emerald-700">
                {String(item.status ?? 'DRAFT') === 'DRAFT' ? 'Bản nháp' : 'Đã đăng'}
              </span>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => openEdit(item)}
                className="grid h-9 w-9 place-items-center rounded-lg text-blue-600 hover:bg-blue-50"
              >
                <Edit3 size={18} />
              </button>
              <button
                type="button"
                onClick={() => void remove(String(item.id))}
                className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={filteredItems.length}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}

function ImageUploadField({
  name,
  label,
  value,
  uploading,
  onChange,
  onUpload
}: {
  name: string;
  label: string;
  value: string;
  uploading: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-start gap-3">
        <div className="relative grid h-24 w-32 place-items-center overflow-hidden rounded-xl border border-dashed border-blue-300 bg-blue-50">
          {value ? (
            <>
              <img src={mediaUrl(value)} alt={label} className="h-full w-full object-contain p-2" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white"
                aria-label="Xoa anh"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <ImagePlus className="text-blue-400" size={24} />
          )}
        </div>
        <div className="grid flex-1 gap-2">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
            placeholder="/uploads/news/example.webp"
          />
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">
            <ImagePlus size={16} />
            {uploading ? 'Dang upload...' : 'Upload anh'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file);
                event.target.value = '';
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <span className="rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-black uppercase text-slate-600">
        {children}
      </span>
    </div>
  );
}

function categoryTitle(id: string, items: OptionItem[]) {
  return items.find((item) => item.id === id)?.title ?? 'Chung';
}

function formatDate(value: string) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function RichEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 [&_.sun-editor]:border-0">
      <SunEditor
        setContents={value}
        onChange={onChange}
        height="360px"
        setOptions={{
          buttonList: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['bold', 'underline', 'italic', 'strike'],
            ['fontColor', 'hiliteColor'],
            ['align', 'horizontalRule', 'list', 'table'],
            ['link', 'image', 'video'],
            ['fullScreen', 'showBlocks', 'codeView']
          ]
        }}
      />
    </div>
  );
}
