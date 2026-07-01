import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { apiGet, mediaUrl } from '@/lib/api';

type NewsDetail = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: string | null;
  thumbnail?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
};

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await apiGet<NewsDetail>(`/news/${slug}`).catch(() => null);
  if (!item) notFound();

  return (
    <main className="container pb-8">
      <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {item.thumbnail ? (
          <img src={mediaUrl(item.thumbnail)} alt="" className="w-full object-cover" />
        ) : null}
        <div className="p-6 md:p-8">
          <Link href="/tin-tuc" className="text-sm font-bold text-blue-600">
            Tin tức
          </Link>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {item.title}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-500">
            <CalendarDays size={16} />
            {formatDate(item.updatedDate ?? item.createdDate)}
          </div>
          {item.summary ? (
            <p className="mt-5 rounded-xl bg-blue-50 p-4 text-base font-semibold leading-7 text-gray-700">
              {item.summary}
            </p>
          ) : null}
          <div
            className="prose prose-slate mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: item.content ?? '' }}
          />
        </div>
      </article>
    </main>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Đang cập nhật';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}
