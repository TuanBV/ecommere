'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { authRequest, handleError } from '../common/api';
import { Field } from '../common/ui';
import { roleLabel } from '../common/session';
import type { AdminUser } from '../common/types';

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
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [error, setError] = useState('');

  const emptyUser = useMemo<AdminUser>(
    () => ({
      id: '',
      username: '',
      email: '',
      fullName: '',
      phone: '',
      role: 1
    }),
    []
  );
  const formUser = editing ?? emptyUser;

  async function load() {
    try {
      setUsers(await authRequest<AdminUser[]>('/admin/users', token));
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
    const payload = {
      username: form.get('username'),
      email: form.get('email'),
      fullName: form.get('fullName'),
      phone: form.get('phone'),
      role: Number(form.get('role')),
      password: form.get('password')
    };
    try {
      if (editing?.id) {
        await authRequest(`/admin/users/${editing.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (String(payload.password)) {
          await authRequest(`/admin/users/${editing.id}/password`, token, {
            method: 'PATCH',
            body: JSON.stringify({ password: payload.password })
          });
        }
      } else {
        await authRequest('/admin/users', token, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setEditing(null);
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  async function remove(id: string) {
    if (id === currentUserId) return setError('Không thể xóa tài khoản đang đăng nhập');
    await authRequest(`/admin/users/${id}`, token, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <form
        onSubmit={submit}
        className="grid content-start gap-3 rounded-2xl bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800">
          {editing ? 'Sửa tài khoản' : 'Tạo tài khoản'}
        </h2>
        {error ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        <Field name="username" label="Username" defaultValue={formUser.username} required />
        <Field name="email" label="Email" type="email" defaultValue={formUser.email} required />
        <Field name="fullName" label="Họ tên" defaultValue={formUser.fullName ?? ''} />
        <Field name="phone" label="Số điện thoại" defaultValue={formUser.phone ?? ''} />
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Phân quyền
          <select
            name="role"
            defaultValue={formUser.role ?? 1}
            className="h-10 rounded-lg border border-gray-200 px-3"
          >
            <option value={0}>Admin</option>
            <option value={1}>Nhân viên</option>
            <option value={2}>Khách hàng</option>
          </select>
        </label>
        <Field
          name="password"
          label={editing ? 'Mật khẩu mới' : 'Mật khẩu'}
          type="password"
          required={!editing}
        />
        <div className="flex gap-2">
          <button className="h-10 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">
            {editing ? 'Lưu' : 'Tạo mới'}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold"
            >
              Hủy
            </button>
          ) : null}
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">
          Danh sách tài khoản
        </div>
        <div className="divide-y divide-gray-100">
          {users.map((item) => (
            <div key={item.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="font-semibold text-gray-800">{item.fullName || item.username}</div>
                <div className="text-sm text-gray-500">
                  {item.username} · {item.email} · {roleLabel(item.role)}
                </div>
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
