import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { apiGet } from '@/lib/api';

type Category = {
  id: string;
  title: string;
  slug: string | null;
  logo?: string | null;
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const categories = await apiGet<Category[]>('/categories').catch(() => []);

  return (
    <>
      <SiteHeader categories={categories} />
      <div className="min-h-screen mt-2.5">{children}</div>
      <SiteFooter />
    </>
  );
}
