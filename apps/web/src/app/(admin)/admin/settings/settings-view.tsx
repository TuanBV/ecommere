'use client';

import { FormEvent, useEffect, useState } from 'react';
import { authRequest, handleError } from '../common/api';
import { Field } from '../common/ui';
import type { Setting } from '../common/types';

export function SettingsView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
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
        className="grid content-start gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
      >
        <h2 className="border-b border-slate-200 pb-4 text-xs font-black uppercase tracking-wide text-slate-600">
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
            className="min-h-28 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <Field name="description" label="Mô tả" defaultValue={editing?.description ?? ''} />
        <div className="flex gap-2">
          <button className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
            Lưu setting
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="h-11 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
            >
              Hủy
            </button>
          ) : null}
        </div>
      </form>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase text-slate-500">
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
