'use client';

import { useEffect, useState } from 'react';
import { money } from '@/lib/api';
import { authRequest, handleError } from '../common/api';
import { Metric, Notice } from '../common/ui';
import type { Dashboard } from '../common/types';

export function DashboardView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authRequest<Dashboard>('/admin/dashboard', token)
      .then(setDashboard)
      .catch((err) => handleError(err, setError, onUnauthorized));
  }, [token, onUnauthorized]);

  if (error) return <Notice>{error}</Notice>;
  if (!dashboard) return <Notice>Đang tải dữ liệu...</Notice>;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Doanh thu" value={money(dashboard.revenue)} />
        <Metric label="Đơn hàng" value={dashboard.orderCount} />
        <Metric label="Đơn mới" value={dashboard.newOrders} />
      </div>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-800">Sản phẩm sắp hết hàng</h2>
        <div className="grid gap-2 text-sm text-gray-600">
          {dashboard.lowStock.map((item) => (
            <div key={item.id}>
              {item.title} · {item.stockQty}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
