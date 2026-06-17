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
    <label className="grid gap-1 text-sm font-medium text-gray-700">
      {props.label}
      <input
        name={props.name}
        type={props.type ?? 'text'}
        defaultValue={props.defaultValue}
        required={props.required}
        className="h-10 rounded-lg border border-gray-200 px-3 outline-none focus:border-blue-500"
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
    <label className="grid gap-1 text-sm font-medium text-gray-700">
      {props.label}
      <textarea
        name={props.name}
        defaultValue={props.defaultValue}
        required={props.required}
        className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-blue-500"
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
    <label className="grid gap-1 text-sm font-medium text-gray-700">
      {props.label}
      <select
        name={props.name}
        defaultValue={props.value ?? ''}
        className="h-10 rounded-lg border border-gray-200 px-3"
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
    <div className="flex gap-2">
      <button className="h-10 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">
        {editing ? 'Luu' : 'Tao moi'}
      </button>
      {editing ? (
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold"
        >
          Huy
        </button>
      ) : null}
    </div>
  );
}

export function ListShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">{title}</div>
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
    <div className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="font-semibold text-gray-800">{title}</div>
        <div className="line-clamp-2 text-sm text-gray-500">{desc}</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-semibold"
        >
          Sua
        </button>
        <button
          onClick={onDelete}
          className="h-9 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700"
        >
          Xoa
        </button>
      </div>
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-800">{value}</div>
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">{children}</div>;
}
