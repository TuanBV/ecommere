'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { money } from '@/lib/api';
import { authRequest, handleError } from '../common/api';
import { Field, FormActions, ListRow, ListShell, SelectField, TextareaField } from '../common/ui';
import type { AdminProduct, OptionItem } from '../common/types';

export function ProductsView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
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
