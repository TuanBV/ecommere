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
