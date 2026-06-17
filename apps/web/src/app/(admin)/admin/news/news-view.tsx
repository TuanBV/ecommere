'use client';

import { FormEvent, useEffect, useState } from 'react';
import { authRequest, handleError } from '../common/api';
import type { OptionItem } from '../common/types';
import { Field, FormActions, ListRow, ListShell, SelectField, TextareaField } from '../common/ui';

export function NewsView({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
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
