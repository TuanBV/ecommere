'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { FileText, Package, RefreshCw, Search, X } from 'lucide-react';
import { mediaUrl, money } from '@/lib/api';
import { authRequest, handleError } from '../common/api';
import { AdminPagination } from '../common/ui';
import type { AdminOrder } from '../common/types';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

export function OrdersView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [query, setQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const phoneKeyword = phone.trim();
    return items.filter((item) => {
      const matchesQuery =
        !keyword ||
        item.id.toLowerCase().includes(keyword) ||
        item.customerName.toLowerCase().includes(keyword);
      const matchesPhone = !phoneKeyword || item.customerPhone.includes(phoneKeyword);
      const matchesStatus = !status || item.status === status;
      return matchesQuery && matchesPhone && matchesStatus;
    });
  }, [items, phone, query, status]);
  const pagedItems = useMemo(
    () => filteredItems.slice((page - 1) * pageSize, page * pageSize),
    [filteredItems, page]
  );

  useEffect(() => {
    setPage(1);
  }, [phone, query, status]);

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

  async function openOrder(id: string) {
    try {
      const order = await authRequest<AdminOrder>(`/admin/orders/${id}`, token);
      setSelected(order);
      setAdminNote(order.adminNote ?? '');
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    await authRequest(`/admin/orders/${selected.id}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({
        status: form.get('status'),
        adminNote
      })
    });
    setSelected(null);
    await load();
  }

  return (
    <div className="mx-auto grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Đơn hàng</h1>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1.5fr]">
          <Field label="Mã đơn / Tên khách">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nhập tên hoặc mã..."
                className="h-11 w-full rounded-xl border border-slate-200 pl-12 pr-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </Field>
          <Field label="Số điện thoại">
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="09xxx..."
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </Field>
          <Field label="Trạng thái">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setPhone('');
                setStatus('');
              }}
              className="h-11 rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-600"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm"
            >
              <RefreshCw size={18} />
              Áp dụng lọc
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-[190px_1fr_180px_180px_160px_120px] bg-slate-50 px-5 py-4 text-xs font-black uppercase text-slate-500">
          <div>Ngày đặt</div>
          <div>Khách hàng</div>
          <div>Tổng tiền</div>
          <div>Thanh toán</div>
          <div>Trạng thái</div>
          <div className="text-right">Thao tác</div>
        </div>
        {pagedItems.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[190px_1fr_180px_180px_160px_120px] items-center border-t border-slate-100 px-5 py-4 text-sm"
          >
            <div className="font-bold text-slate-600">{formatDateTime(item.createdDate)}</div>
            <div>
              <div className="font-bold text-slate-700">{item.customerName}</div>
              <div className="font-bold text-blue-600">{item.customerPhone}</div>
            </div>
            <div className="font-black text-red-600">{money(item.totalAmount)}</div>
            <div>
              <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600">
                {item.paymentMethod ?? 'COD'}
              </span>
            </div>
            <div>
              <StatusBadge status={item.status ?? 'PENDING'} />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => void openOrder(item.id)}
                className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                Xử lý
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

      {selected ? (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={updateStatus}
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-700">
                <FileText className="text-blue-600" />
                Chi tiết & Xử lý đơn hàng
              </h2>
              <button type="button" onClick={() => setSelected(null)} className="text-slate-500">
                <X size={24} />
              </button>
            </div>

            <div className="grid gap-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <InfoBox title="Khách hàng">
                  <div>{selected.customerName}</div>
                  <div className="font-black text-blue-600">{selected.customerPhone}</div>
                </InfoBox>
                <InfoBox title="Địa chỉ nhận hàng">
                  <div>{selected.shippingAddress}</div>
                </InfoBox>
              </div>

              <section className="overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3 text-xs font-black uppercase text-slate-600">
                  Sản phẩm trong đơn hàng
                </div>
                <div className="grid grid-cols-[1fr_120px_140px_160px] bg-slate-50 px-5 py-3 text-xs font-black uppercase text-slate-500">
                  <div>Sản phẩm</div>
                  <div>Số lượng</div>
                  <div>Đơn giá</div>
                  <div className="text-right">Thành tiền</div>
                </div>
                {selected.details?.map((detail) => (
                  <div
                    key={detail.id}
                    className="grid grid-cols-[1fr_120px_140px_160px] items-center border-t border-slate-100 px-5 py-4 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg border border-slate-200">
                        {detail.product?.image ? (
                          <img
                            src={mediaUrl(detail.product.image)}
                            alt=""
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <Package size={18} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">{detail.product?.title}</div>
                        <div className="mt-1 text-xs font-bold text-blue-600">
                          {detail.product?.category?.title}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-600">{detail.quantity}</div>
                    <div className="font-bold text-slate-600">{money(detail.price)}</div>
                    <div className="text-right font-black text-blue-600">
                      {money(Number(detail.price) * detail.quantity)}
                    </div>
                  </div>
                ))}
                <div className="bg-slate-50 px-5 py-4 text-right text-xl font-black text-red-600">
                  Tổng thanh toán: {money(selected.totalAmount)}
                </div>
              </section>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Cập nhật trạng thái">
                  <select
                    name="status"
                    defaultValue={selected.status ?? 'PENDING'}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ghi chú nội bộ (Admin)">
                  <textarea
                    value={adminNote}
                    onChange={(event) => setAdminNote(event.target.value)}
                    placeholder="Nhập lưu ý nội bộ..."
                    className="min-h-12 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                  />
                </Field>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_1.8fr] gap-4 border-t border-slate-100 bg-slate-50 px-6 py-5">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="h-12 rounded-xl bg-white text-sm font-bold text-slate-700 ring-1 ring-slate-200"
              >
                Đóng
              </button>
              <button className="h-12 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                Cập nhật đơn hàng
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm font-bold text-slate-700">
      <div className="mb-2 text-xs font-black uppercase text-blue-500">{title}</div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'COMPLETED'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'CANCELLED'
        ? 'bg-rose-100 text-rose-700'
        : 'bg-orange-100 text-orange-700';
  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-black ${className}`}>{status}</span>
  );
}

function formatDateTime(value?: string | null) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
