import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type React from 'react';
import type { ApiMeta } from '@/lib/api';

export function Pagination({
  meta,
  basePath,
  params
}: {
  meta?: Partial<ApiMeta>;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const page = Math.max(Number(meta?.page ?? 1), 1);
  const totalPages = Math.max(Number(meta?.totalPages ?? 1), 1);
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <PageLink href={hrefFor(basePath, params, page - 1)} disabled={page <= 1} label="Trang trước">
        <ChevronLeft size={18} />
      </PageLink>

      {pages.map((item, index) =>
        item === '...' ? (
          <span
            key={`${item}-${index}`}
            className="grid h-10 min-w-10 place-items-center rounded-lg px-3 text-sm font-bold text-gray-400"
          >
            ...
          </span>
        ) : (
          <PageLink key={item} href={hrefFor(basePath, params, item)} active={item === page}>
            {item}
          </PageLink>
        )
      )}

      <PageLink
        href={hrefFor(basePath, params, page + 1)}
        disabled={page >= totalPages}
        label="Trang sau"
      >
        <ChevronRight size={18} />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  label,
  children
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  label?: string;
  children: React.ReactNode;
}) {
  const className = [
    'grid h-10 min-w-10 place-items-center rounded-lg px-3 text-sm font-bold transition',
    active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200',
    disabled ? 'pointer-events-none opacity-40' : 'hover:bg-blue-50 hover:text-blue-700'
  ].join(' ');

  return (
    <Link
      href={href}
      className={className}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

function hrefFor(basePath: string, params: Record<string, string | undefined>, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value || key === 'page') continue;
    query.set(key, value);
  }
  if (page > 1) query.set('page', String(page));
  const text = query.toString();
  return text ? `${basePath}?${text}` : basePath;
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
