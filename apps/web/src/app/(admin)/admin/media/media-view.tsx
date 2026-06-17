'use client';

import { FormEvent, useEffect, useState } from 'react';
import { authRequest, handleError } from '../common/api';
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
