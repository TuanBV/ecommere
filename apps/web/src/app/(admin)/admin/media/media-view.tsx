'use client';

import { ImagePlus, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { mediaUrl } from '@/lib/api';
import { authRequest, authUpload, handleError } from '../common/api';
import { Field, FormActions, ListRow, ListShell, TextareaField } from '../common/ui';

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
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const value = editing ?? {};

  useEffect(() => {
    setImageUrl(String(value.imageUrl ?? ''));
  }, [value]);

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
    payload.imageUrl = imageUrl;
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
      setImageUrl('');
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

  async function upload(file: File) {
    const body = new FormData();
    body.append('file', file);
    setUploading(true);
    try {
      const result = await authUpload<{ url: string }>(`/admin/uploads/${resource}`, token, body);
      setImageUrl(result.url);
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    } finally {
      setUploading(false);
    }
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
        <ImageUploadField
          name="imageUrl"
          label="Anh"
          value={imageUrl}
          uploading={uploading}
          onChange={setImageUrl}
          onUpload={upload}
        />
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
            desc={`${String(item.imageUrl ?? '')} - ${String(item.position ?? '')}`}
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
            placeholder="/uploads/banners/example.webp"
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
