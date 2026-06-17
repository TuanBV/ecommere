'use client';

import { useEffect, useState } from 'react';
import { authRequest, handleError } from '../common/api';
import { ListShell } from '../common/ui';
import type { AdminContact } from '../common/types';

export function ContactsView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [items, setItems] = useState<AdminContact[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems(await authRequest<AdminContact[]>('/admin/contacts', token));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function update(id: string, status: string) {
    await authRequest(`/admin/contacts/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    await load();
  }

  async function remove(id: string) {
    await authRequest(`/admin/contacts/${id}`, token, { method: 'DELETE' });
    await load();
  }

  return (
    <ListShell title="Lien he">
      {error ? <div className="p-4 text-sm text-red-700">{error}</div> : null}
      {items.map((item) => (
        <div
          key={item.id}
          className="grid gap-3 border-b border-gray-100 p-4 lg:grid-cols-[1fr_150px_auto] lg:items-center"
        >
          <div>
            <div className="font-semibold text-gray-800">
              {item.fullName} · {item.phone}
            </div>
            <div className="text-sm text-gray-500">
              {item.serviceType} · {item.message}
            </div>
          </div>
          <select
            value={item.status ?? 'NEW'}
            onChange={(event) => void update(item.id, event.target.value)}
            className="h-9 rounded-lg border border-gray-200 px-3 text-sm"
          >
            {['NEW', 'PROCESSING', 'DONE', 'CANCELLED'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={() => void remove(item.id)}
            className="h-9 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700"
          >
            Xoa
          </button>
        </div>
      ))}
    </ListShell>
  );
}
