import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { apiGet } from '@/lib/api';

type Category = {
  id: string;
  title: string;
  slug: string | null;
  logo?: string | null;
  brands?: {
    id: string;
    title: string;
    slug: string | null;
    logo?: string | null;
  }[];
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const categories = await apiGet<Category[]>('/categories').catch(() => []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Bo qua menu den noi dung chinh
      </a>
      <SiteHeader categories={categories} />
      <div id="main-content" tabIndex={-1} className="mt-2.5 min-h-screen">
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
