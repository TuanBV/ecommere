'use client';

import dynamic from 'next/dynamic';
import { ImagePlus, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import 'suneditor/dist/css/suneditor.min.css';
import { mediaUrl } from '@/lib/api';
import { authRequest, authUpload, handleError } from '../common/api';
import type { OptionItem } from '../common/types';
import { Field, FormActions, ListRow, ListShell, SelectField, TextareaField } from '../common/ui';

const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false });

export function NewsView({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [brands, setBrands] = useState<OptionItem[]>([]);
  const [thumbnail, setThumbnail] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const value = editing ?? {};

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

  return (
    <div className="grid gap-5 xl:grid-cols-[520px_1fr]">
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
        <ImageUploadField
          name="thumbnail"
          label="Anh dai dien"
          value={thumbnail}
          uploading={uploading}
          onChange={setThumbnail}
          onUpload={upload}
        />
        <Field name="status" label="Trang thai" defaultValue={String(value.status ?? 'DRAFT')} />
        <TextareaField name="summary" label="Tom tat" defaultValue={String(value.summary ?? '')} />
        <input type="hidden" name="content" value={content} />
        <div className="grid gap-2">
          <span className="text-sm font-medium text-gray-700">Noi dung</span>
          <RichEditor value={content} onChange={setContent} />
        </div>
        <FormActions editing={Boolean(value.id)} onCancel={() => setEditing(null)} />
      </form>
      <ListShell title="Danh sach tin tuc">
        {items.map((item) => (
          <ListRow
            key={String(item.id)}
            title={String(item.title ?? '')}
            desc={`${String(item.slug ?? '')} - ${String(item.status ?? '')}`}
            onEdit={() => setEditing(item)}
            onDelete={() => void remove(String(item.id))}
          />
        ))}
      </ListShell>
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
