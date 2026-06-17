'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { request } from '../common/api';
import { Field } from '../common/ui';
import { refreshKey, tokenKey, userKey } from '../common/session';
import type { LoginResponse } from '../common/types';

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');

  function saveSession(session: LoginResponse) {
    localStorage.setItem(tokenKey, session.accessToken);
    localStorage.setItem(refreshKey, session.refreshToken);
    localStorage.setItem(userKey, JSON.stringify(session.user));
    router.replace('/admin');
  }

  useEffect(() => {
    if (localStorage.getItem(tokenKey)) router.replace('/admin');
  }, [router]);

  return <LoginScreen onLogin={saveSession} error={error} setError={setError} />;
}

function LoginScreen({
  onLogin,
  error,
  setError
}: {
  onLogin: (session: LoginResponse) => void;
  error: string;
  setError: (value: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const session = await request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: form.get('username'),
          password: form.get('password')
        })
      });
      if (session.user.role !== 0) throw new Error('Tài khoản không có quyền admin');
      onLogin(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đăng nhập được');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container flex min-h-[calc(100vh-220px)] items-center justify-center py-10">
      <form
        onSubmit={submit}
        className="grid w-full max-w-md gap-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Đăng nhập quản trị</h1>
          <p className="mt-1 text-sm text-gray-500">
            Dùng tài khoản có role admin để vào dashboard.
          </p>
        </div>
        {error ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        <Field name="username" label="Username hoặc email" required />
        <Field name="password" label="Mật khẩu" type="password" required />
        <button
          disabled={loading}
          className="h-11 rounded-lg bg-blue-700 px-4 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </main>
  );
}
