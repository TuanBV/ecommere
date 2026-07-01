import Link from 'next/link';
import { CalendarDays, Search } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { apiGetWithMeta, mediaUrl } from '@/lib/api';

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  thumbnail?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
  category?: { title?: string | null } | null;
  brand?: { title?: string | null } | null;
};

export default async function NewsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  if (!query.has('limit')) query.set('limit', '9');

  const result = await apiGetWithMeta<NewsItem[]>(`/news?${query.toString()}`).catch(() => ({
    data: [],
    meta: { page: 1, limit: 9, total: 0, totalPages: 1 }
  }));

  return (
    <main className="container pb-8">
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-2 text-base text-gray-600">Trang chủ / Tin tức</div>
        <h1 className="text-3xl font-semibold text-gray-800">Tin tức</h1>
      </section>

      <form action="/tin-tuc" className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Tìm kiếm bài viết..."
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </form>

      {result.data.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {result.data.map((item) => (
            <Link
              key={item.id}
              href={`/tin-tuc/${item.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                <img
                  src={mediaUrl(item.thumbnail)}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-blue-600">
                  <CalendarDays size={14} />
                  {formatDate(item.updatedDate ?? item.createdDate)}
                </div>
                <h2 className="line-clamp-2 text-lg font-bold leading-snug text-gray-800">
                  {item.title}
                </h2>
                {item.summary ? (
                  <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-gray-600">
                    {item.summary}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl bg-white px-5 py-12 text-center text-sm font-semibold text-gray-500 shadow-sm">
          Không tìm thấy bài viết phù hợp.
        </section>
      )}

      <Pagination meta={result.meta} basePath="/tin-tuc" params={params} />
    </main>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Đang cập nhật';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}
