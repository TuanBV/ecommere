'use client';

import { Edit3, ExternalLink, Plus, RefreshCcw, Send, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { authRequest, handleError } from '../common/api';
import type { AdminFacebookPost } from '../common/types';
import { AdminPagination } from '../common/ui';

const emptyForm = {
  pageId: '',
  pageName: '',
  pageAccessToken: '',
  graphVersion: 'v20.0',
  message: '',
  linkUrl: '',
  imageUrl: '',
  publishMode: 'now',
  scheduledAt: ''
};

export function FacebookPostsView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [items, setItems] = useState<AdminFacebookPost[]>([]);
  const [editing, setEditing] = useState<AdminFacebookPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const pageSize = 10;

  const filteredItems = items.filter((item) => {
    const keyword = query.trim().toLowerCase();
    return (
      !keyword ||
      item.message.toLowerCase().includes(keyword) ||
      item.pageId.toLowerCase().includes(keyword) ||
      String(item.pageName ?? '')
        .toLowerCase()
        .includes(keyword)
    );
  });
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  async function load() {
    try {
      setItems(await authRequest<AdminFacebookPost[]>('/admin/facebook-posts', token));
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(item: AdminFacebookPost) {
    setEditing(item);
    setForm({
      pageId: item.pageId,
      pageName: item.pageName ?? '',
      pageAccessToken: '',
      graphVersion: item.graphVersion ?? 'v20.0',
      message: item.message,
      linkUrl: item.linkUrl ?? '',
      imageUrl: item.imageUrl ?? '',
      publishMode: item.status === 'SCHEDULED' ? 'scheduled' : 'draft',
      scheduledAt: toDateTimeLocal(item.scheduledAt)
    });
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const publishNow = form.publishMode === 'now';
    const scheduledAt =
      form.publishMode === 'scheduled' && form.scheduledAt
        ? new Date(form.scheduledAt).toISOString()
        : '';
    const payload = {
      pageId: form.pageId,
      pageName: form.pageName.trim() || undefined,
      pageAccessToken: form.pageAccessToken.trim() || undefined,
      graphVersion: form.graphVersion,
      message: form.message,
      linkUrl: form.linkUrl.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      scheduledAt,
      publishNow
    };

    try {
      if (editing) {
        await authRequest(`/admin/facebook-posts/${editing.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        setNotice(
          form.publishMode === 'now'
            ? 'Da cap nhat bai tren fanpage.'
            : form.publishMode === 'scheduled'
              ? 'Da hen gio dang bai Facebook.'
              : 'Da luu bai Facebook.'
        );
      } else {
        await authRequest('/admin/facebook-posts', token, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setNotice(
          form.publishMode === 'now'
            ? 'Da dang bai len fanpage.'
            : form.publishMode === 'scheduled'
              ? 'Da hen gio dang bai Facebook.'
              : 'Da tao ban nhap.'
        );
      }
      setEditing(null);
      setForm(emptyForm);
      setFormOpen(false);
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: AdminFacebookPost) {
    if (!confirm('Xoa bai nay khoi he thong va fanpage neu da dang?')) return;
    setError('');
    setNotice('');
    try {
      await authRequest(`/admin/facebook-posts/${item.id}`, token, { method: 'DELETE' });
      setNotice('Da xoa bai Facebook.');
      await load();
    } catch (err) {
      handleError(err, setError, onUnauthorized);
    }
  }

  return (
    <section className="grid gap-6">
      {notice ? <Toast type="success" message={notice} onClose={() => setNotice('')} /> : null}
      {error ? <Toast type="error" message={error} onClose={() => setError('')} /> : null}

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quan ly dang bai Facebook</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Tao, sua, xoa va dang bai len fanpage bang Page Access Token.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-600"
            >
              <RefreshCcw size={17} />
              Lam moi
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm"
            >
              <Plus size={17} />
              Tao bai moi
            </button>
          </div>
        </div>
      </div>

      {formOpen ? (
        <form
          onSubmit={submit}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="text-sm font-black uppercase text-slate-500">
              {editing ? 'Cap nhat bai Facebook' : 'Them bai Facebook'}
            </div>
            <button type="button" onClick={() => setFormOpen(false)} className="text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Input
              label="Page ID *"
              value={form.pageId}
              onChange={(value) => setForm((current) => ({ ...current, pageId: value }))}
              required
            />
            <Input
              label="Ten fanpage"
              value={form.pageName}
              onChange={(value) => setForm((current) => ({ ...current, pageName: value }))}
            />
            <Input
              label="Graph version"
              value={form.graphVersion}
              onChange={(value) => setForm((current) => ({ ...current, graphVersion: value }))}
            />
            <Input
              label={editing ? 'Page Access Token moi neu can doi' : 'Page Access Token *'}
              type="password"
              value={form.pageAccessToken}
              onChange={(value) => setForm((current) => ({ ...current, pageAccessToken: value }))}
              required={!editing}
            />
            <Input
              label="Link dinh kem"
              value={form.linkUrl}
              onChange={(value) => setForm((current) => ({ ...current, linkUrl: value }))}
            />
            <Input
              label="URL anh"
              value={form.imageUrl}
              onChange={(value) => setForm((current) => ({ ...current, imageUrl: value }))}
            />
          </div>

          <label className="mt-4 grid gap-2">
            <span className="text-[11px] font-black uppercase text-slate-500">
              Noi dung bai viet *
            </span>
            <textarea
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              required
              className="min-h-36 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <div className="mt-4 rounded-xl bg-blue-50 p-4">
            <div className="mb-3 text-[11px] font-black uppercase text-blue-700">
              Thoi gian dang bai
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <PublishModeOption
                label="Dang ngay"
                checked={form.publishMode === 'now'}
                onChange={() =>
                  setForm((current) => ({ ...current, publishMode: 'now', scheduledAt: '' }))
                }
              />
              <PublishModeOption
                label="Hen gio"
                checked={form.publishMode === 'scheduled'}
                onChange={() => setForm((current) => ({ ...current, publishMode: 'scheduled' }))}
              />
              <PublishModeOption
                label="Luu nhap"
                checked={form.publishMode === 'draft'}
                onChange={() =>
                  setForm((current) => ({ ...current, publishMode: 'draft', scheduledAt: '' }))
                }
              />
            </div>
            {form.publishMode === 'scheduled' ? (
              <div className="mt-4 max-w-md">
                <Input
                  label="Gio dang bai *"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(value) => setForm((current) => ({ ...current, scheduledAt: value }))}
                  required
                />
                <p className="mt-2 text-xs font-semibold text-blue-700">
                  API se tu dong dang khi den gio nay.
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm disabled:opacity-60"
            >
              <Send size={17} />
              {saving
                ? 'Dang xu ly...'
                : form.publishMode === 'scheduled'
                  ? 'Hen gio dang'
                  : editing
                    ? 'Luu thay doi'
                    : 'Dang bai'}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="h-11 rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-600"
            >
              Huy
            </button>
          </div>
        </form>
      ) : null}

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div className="text-sm font-black uppercase text-slate-500">Danh sach bai Facebook</div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tim theo noi dung, page id..."
            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 md:w-96"
          />
        </div>

        <div className="divide-y divide-slate-100">
          {pagedItems.length ? (
            pagedItems.map((item) => (
              <article key={item.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_220px_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800">{item.pageName || item.pageId}</span>
                    <StatusBadge status={item.status ?? 'DRAFT'} />
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
                    {item.message}
                  </p>
                  {item.lastError ? (
                    <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">
                      {item.lastError}
                    </p>
                  ) : null}
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  <div>Page ID: {item.pageId}</div>
                  <div>Graph: {item.graphVersion ?? 'v20.0'}</div>
                  <div>FB Post: {item.facebookPostId ?? '-'}</div>
                  <div>Hen gio: {formatDateTime(item.scheduledAt)}</div>
                  <div>Da dang: {formatDateTime(item.publishedAt)}</div>
                  {item.linkUrl ? (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-blue-600"
                    >
                      Link <ExternalLink size={13} />
                    </a>
                  ) : null}
                </div>

                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    aria-label="Sua"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item)}
                    className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    aria-label="Xoa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Chua co bai Facebook nao.
            </div>
          )}
        </div>

        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={filteredItems.length}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}

function PublishModeOption({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition ${
        checked
          ? 'border-blue-500 bg-white text-blue-700 shadow-sm'
          : 'border-blue-100 bg-blue-50 text-slate-600'
      }`}
    >
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4" />
      {label}
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  type = 'text'
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'PUBLISHED'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'SCHEDULED' || status === 'PUBLISHING'
        ? 'bg-blue-100 text-blue-700'
        : status === 'FAILED' || status === 'DELETE_FAILED'
          ? 'bg-rose-100 text-rose-700'
          : 'bg-slate-100 text-slate-600';
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${tone}`}>{status}</span>
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function Toast({
  type,
  message,
  onClose
}: {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) {
  const tone =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold ${tone}`}
    >
      <span>{message}</span>
      <button type="button" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
}
