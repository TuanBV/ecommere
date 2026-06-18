'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2, UserCog, X } from 'lucide-react';
import { authRequest, handleError } from '../common/api';
import { roleLabel } from '../common/session';
import type { AdminUser } from '../common/types';

type UserForm = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  password: string;
};

type Toast = {
  type: 'success' | 'error';
  message: string;
};

const emptyForm: UserForm = {
  id: '',
  username: '',
  email: '',
  fullName: '',
  phone: '',
  role: '1',
  password: ''
};

export function UsersView({
  token,
  onUnauthorized,
  currentUserId
}: {
  token: string;
  onUnauthorized: () => void;
  currentUserId?: string;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesKeyword =
        !keyword ||
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        (user.fullName ?? '').toLowerCase().includes(keyword) ||
        (user.phone ?? '').toLowerCase().includes(keyword);
      const matchesRole = !roleFilter || String(user.role ?? 1) === roleFilter;
      return matchesKeyword && matchesRole;
    });
  }, [query, roleFilter, users]);

  async function load() {
    try {
      setUsers(await authRequest<AdminUser[]>('/admin/users', token));
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

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(user: AdminUser) {
    setForm({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName ?? '',
      phone: user.phone ?? '',
      role: String(user.role ?? 1),
      password: ''
    });
    setModalOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.username.trim()) return showError('Vui lòng nhập username');
    if (!form.email.trim()) return showError('Vui lòng nhập email');
    if (!form.id && form.password.length < 6) {
      return showError('Mật khẩu phải có ít nhất 6 ký tự');
    }

    setSaving(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        role: Number(form.role)
      };

      if (form.id) {
        await authRequest(`/admin/users/${form.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (form.password) {
          await authRequest(`/admin/users/${form.id}/password`, token, {
            method: 'PATCH',
            body: JSON.stringify({ password: form.password })
          });
        }
        showSuccess('Đã cập nhật tài khoản');
      } else {
        await authRequest('/admin/users', token, {
          method: 'POST',
          body: JSON.stringify({ ...payload, password: form.password })
        });
        showSuccess('Đã tạo tài khoản mới');
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    } finally {
      setSaving(false);
    }
  }

  async function remove(user: AdminUser) {
    if (user.id === currentUserId) return showError('Không thể xóa tài khoản đang đăng nhập');
    if (!window.confirm(`Xóa tài khoản "${user.username}"?`)) return;

    try {
      await authRequest(`/admin/users/${user.id}`, token, { method: 'DELETE' });
      showSuccess('Đã xóa tài khoản');
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    }
  }

  return (
    <section className="relative">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-700">Quản lý User</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Quản lý tài khoản, thông tin liên hệ và phân quyền quản trị
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Thêm user mới
        </button>
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
              placeholder="Tìm theo username, email, họ tên, số điện thoại..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Tất cả phân quyền</option>
            <option value="0">Admin</option>
            <option value="1">Nhân viên</option>
            <option value="2">Khách hàng</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-[1.2fr_1.2fr_160px_120px_110px] gap-4 bg-slate-50 px-5 py-4 text-xs font-black uppercase text-slate-500">
          <div>Tài khoản</div>
          <div>Liên hệ</div>
          <div>Phân quyền</div>
          <div>Trạng thái</div>
          <div className="text-right">Hành động</div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1.2fr_1.2fr_160px_120px_110px] items-center gap-4 px-5 py-4 text-sm"
            >
              <div className="min-w-0">
                <div className="truncate font-bold text-slate-700">
                  {user.fullName || user.username}
                </div>
                <div className="truncate text-xs font-semibold text-slate-500">{user.username}</div>
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-slate-700">{user.email}</div>
                <div className="truncate text-xs font-semibold text-slate-500">
                  {user.phone || 'Chưa có số điện thoại'}
                </div>
              </div>
              <div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">
                  {roleLabel(user.role)}
                </span>
              </div>
              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-700">
                  Hoạt động
                </span>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(user)}
                  className="text-blue-600 transition hover:text-blue-800"
                  aria-label="Sửa user"
                >
                  <Edit3 size={19} />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(user)}
                  className="text-rose-500 transition hover:text-rose-700"
                  aria-label="Xóa user"
                >
                  <Trash2 size={19} />
                </button>
              </div>
            </div>
          ))}
          {!filteredUsers.length ? (
            <div className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
              Không có tài khoản phù hợp
            </div>
          ) : null}
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <UserCog className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-slate-700">
                  {form.id ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-500 transition hover:text-slate-800"
                aria-label="Đóng"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
              <AdminInput
                label="Username *"
                value={form.username}
                onChange={(value) => setForm((current) => ({ ...current, username: value }))}
              />
              <AdminInput
                label="Email *"
                type="email"
                value={form.email}
                onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              />
              <AdminInput
                label="Họ tên"
                value={form.fullName}
                onChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
              />
              <AdminInput
                label="Số điện thoại"
                value={form.phone}
                onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
              />
              <label className="grid gap-2">
                <span className="text-[11px] font-black uppercase text-slate-500">Phân quyền</span>
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value }))
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="0">Admin</option>
                  <option value="1">Nhân viên</option>
                  <option value="2">Khách hàng</option>
                </select>
              </label>
              <AdminInput
                label={form.id ? 'Mật khẩu mới' : 'Mật khẩu *'}
                type="password"
                value={form.password}
                onChange={(value) => setForm((current) => ({ ...current, password: value }))}
                placeholder={form.id ? 'Bỏ trống nếu không đổi' : ''}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-11 rounded-xl bg-white px-6 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                disabled={saving}
                className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {toast ? <ToastMessage toast={toast} /> : null}
    </section>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = ''
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
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
