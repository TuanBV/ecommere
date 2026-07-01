import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Green Home Shop - Gia dung thong minh',
    template: '%s | Green Home Shop'
  },
  description:
    'Thiet bi gia dung thong minh, robot hut bui, robot lau kinh va thiet bi dien tu gia dinh.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Green Home Shop',
    title: 'Green Home Shop - Gia dung thong minh',
    description:
      'Thiet bi gia dung thong minh, robot hut bui, robot lau kinh va thiet bi dien tu gia dinh.',
    url: '/'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="preload"
          href="/common/fonts/MiSansLatin-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/common/fonts/MiSansLatin-Semibold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/common/fonts/MiSansLatin-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#f6f6f6] text-gray-700">{children}</body>
    </html>
  );
}
