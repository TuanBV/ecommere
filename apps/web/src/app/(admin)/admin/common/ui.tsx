import type React from 'react';
import type { OptionItem } from './types';

export function Field(props: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase text-slate-500">{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? 'text'}
        defaultValue={props.defaultValue}
        required={props.required}
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

export function TextareaField(props: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase text-slate-500">{props.label}</span>
      <textarea
        name={props.name}
        defaultValue={props.defaultValue}
        required={props.required}
        className="min-h-24 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

export function SelectField(props: {
  name: string;
  label: string;
  value?: string;
  items: OptionItem[];
  allowEmpty?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase text-slate-500">{props.label}</span>
      <select
        name={props.name}
        defaultValue={props.value ?? ''}
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {props.allowEmpty ? <option value="">Khong chon</option> : null}
        {props.items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormActions({ editing, onCancel }: { editing: boolean; onCancel: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
        {editing ? 'Luu' : 'Tao moi'}
      </button>
      {editing ? (
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
        >
          Huy
        </button>
      ) : null}
    </div>
  );
}

export function ListShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase text-slate-500">
        {title}
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </section>
  );
}

export function ListRow({
  title,
  desc,
  onEdit,
  onDelete
}: {
  title: string;
  desc: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="font-bold text-slate-700">{title}</div>
        <div className="line-clamp-2 text-sm font-medium text-slate-500">{desc}</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="h-9 rounded-lg px-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
        >
          Sua
        </button>
        <button
          onClick={onDelete}
          className="h-9 rounded-lg px-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
        >
          Xoa
        </button>
      </div>
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
      {children}
    </div>
  );
}

export function AdminPagination({
  page,
  pageSize,
  total,
  onPageChange
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4 text-sm font-bold text-slate-600">
      <div>
        Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} / {total}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-9 rounded-lg bg-slate-100 px-3 disabled:opacity-40"
        >
          Trước
        </button>
        {pageWindow(page, totalPages).map((item, index) =>
          item === '...' ? (
            <span key={`${item}-${index}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`h-9 min-w-9 rounded-lg px-3 ${
                item === page ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-9 rounded-lg bg-slate-100 px-3 disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

function pageWindow(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages: Array<number | '...'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('...');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
}
