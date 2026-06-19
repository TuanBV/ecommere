'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Edit3, Mail, Phone, Search, Trash2, X } from 'lucide-react';
import { authRequest, handleError } from '../common/api';
import { AdminPagination } from '../common/ui';
import type { AdminContact } from '../common/types';

type Toast = {
  type: 'success' | 'error';
  message: string;
};

const statusOptions = [
  { value: 'NEW', label: 'Mới', className: 'bg-blue-100 text-blue-700' },
  { value: 'PROCESSING', label: 'Đang xử lý', className: 'bg-amber-100 text-amber-700' },
  { value: 'DONE', label: 'Hoàn tất', className: 'bg-emerald-100 text-emerald-700' },
  { value: 'CANCELLED', label: 'Đã hủy', className: 'bg-rose-100 text-rose-700' }
];

export function ContactsView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [items, setItems] = useState<AdminContact[]>([]);
  const [editing, setEditing] = useState<AdminContact | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [status, setStatus] = useState('NEW');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesKeyword =
        !keyword ||
        item.fullName.toLowerCase().includes(keyword) ||
        item.phone.toLowerCase().includes(keyword) ||
        (item.serviceType ?? '').toLowerCase().includes(keyword) ||
        (item.message ?? '').toLowerCase().includes(keyword);
      const matchesStatus = !statusFilter || (item.status ?? 'NEW') === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [items, query, statusFilter]);
  const pagedItems = useMemo(
    () => filteredItems.slice((page - 1) * pageSize, page * pageSize),
    [filteredItems, page]
  );

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  async function load() {
    try {
      setItems(await authRequest<AdminContact[]>('/admin/contacts', token));
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showSuccess(message: string) {
    setToast({ type: 'success', message });
  }

  function showError(message: string) {
    setToast({ type: 'error', message });
  }

  function openEdit(item: AdminContact) {
    setEditing(item);
    setStatus(item.status ?? 'NEW');
    setNote(item.note ?? '');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setSaving(true);
    try {
      await authRequest(`/admin/contacts/${editing.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status, note })
      });
      setEditing(null);
      showSuccess('Đã cập nhật liên hệ');
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: AdminContact) {
    if (!window.confirm(`Xóa liên hệ của "${item.fullName}"?`)) return;
    try {
      await authRequest(`/admin/contacts/${item.id}`, token, { method: 'DELETE' });
      showSuccess('Đã xóa liên hệ');
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    }
  }

  return (
    <section className="relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-700">Quản lý Liên hệ</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Theo dõi yêu cầu tư vấn, cập nhật trạng thái xử lý và ghi chú nội bộ
        </p>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
          <label className="relative block">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, số điện thoại, dịch vụ, nội dung..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-[1fr_1.2fr_170px_130px_95px] gap-4 bg-slate-50 px-5 py-4 text-xs font-black uppercase text-slate-500">
          <div>Khách hàng</div>
          <div>Nội dung liên hệ</div>
          <div>Dịch vụ</div>
          <div>Trạng thái</div>
          <div className="text-right">Thao tác</div>
        </div>
        <div className="divide-y divide-slate-100">
          {pagedItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_1.2fr_170px_130px_95px] items-center gap-4 px-5 py-4 text-sm"
            >
              <div className="min-w-0">
                <div className="truncate font-bold text-slate-700">{item.fullName}</div>
                <a
                  href={`tel:${item.phone}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600"
                >
                  <Phone size={13} />
                  {item.phone}
                </a>
              </div>
              <div className="min-w-0">
                <div className="line-clamp-2 font-semibold leading-5 text-slate-600">
                  {item.message || 'Khách hàng chưa nhập nội dung'}
                </div>
              </div>
              <div className="font-semibold text-slate-600">{item.serviceType || 'Chung'}</div>
              <div>
                <StatusBadge value={item.status ?? 'NEW'} />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="text-blue-600 transition hover:text-blue-800"
                  aria-label="Xử lý liên hệ"
                >
                  <Edit3 size={19} />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  className="text-rose-500 transition hover:text-rose-700"
                  aria-label="Xóa liên hệ"
                >
                  <Trash2 size={19} />
                </button>
              </div>
            </div>
          ))}
          {!filteredItems.length ? (
            <div className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
              Không có liên hệ phù hợp
            </div>
          ) : null}
        </div>
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={filteredItems.length}
          onPageChange={setPage}
        />
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <Mail className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-slate-700">Chi tiết & xử lý liên hệ</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-slate-500 transition hover:text-slate-800"
                aria-label="Đóng"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-4 px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
                  <div className="text-xs font-black uppercase text-blue-500">Khách hàng</div>
                  <div className="mt-2 font-bold text-slate-700">{editing.fullName}</div>
                  <a href={`tel:${editing.phone}`} className="text-sm font-bold text-blue-600">
                    {editing.phone}
                  </a>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <div className="text-xs font-black uppercase text-slate-500">Dịch vụ</div>
                  <div className="mt-2 font-bold text-slate-700">
                    {editing.serviceType || 'Chung'}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-slate-700 ring-1 ring-amber-100">
                {editing.message || 'Khách hàng chưa nhập nội dung'}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-[11px] font-black uppercase text-slate-500">
                    Cập nhật trạng thái
                  </span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    {statusOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-[11px] font-black uppercase text-slate-500">
                    Ghi chú nội bộ
                  </span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Nhập lưu ý xử lý..."
                    className="min-h-24 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-11 rounded-xl bg-white px-6 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                Đóng
              </button>
              <button
                disabled={saving}
                className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Cập nhật liên hệ'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {toast ? <ToastMessage toast={toast} /> : null}
    </section>
  );
}

function StatusBadge({ value }: { value: string }) {
  const option = statusOptions.find((item) => item.value === value) ?? statusOptions[0];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${option.className}`}>
      {option.label}
    </span>
  );
}

function ToastMessage({ toast }: { toast: Toast }) {
  return (
    <div
      className={`fixed right-6 top-6 z-[70] rounded-xl px-5 py-3 text-sm font-bold text-white shadow-xl ${
        toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
      }`}
    >
      {toast.message}
    </div>
  );
}
