'use client';

import { useEffect, useState } from 'react';
import { money } from '@/lib/api';
import { authRequest, handleError } from '../common/api';
import type { AdminOrder } from '../common/types';

export function OrdersView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems(await authRequest<AdminOrder[]>('/admin/orders', token));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function updateStatus(id: string, status: string) {
    await authRequest(`/admin/orders/${id}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    await load();
  }

  return (
    <section className="rounded-2xl bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">Don hang</div>
      {error ? <div className="p-4 text-sm text-red-700">{error}</div> : null}
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_180px] lg:items-center">
            <div>
              <div className="font-semibold text-gray-800">
                {item.customerName} · {item.customerPhone}
              </div>
              <div className="text-sm text-gray-500">
                {item.id} · {money(item.totalAmount)} · {item.status}
              </div>
            </div>
            <select
              value={item.status ?? 'PENDING'}
              onChange={(event) => void updateStatus(item.id, event.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
            >
              {['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
