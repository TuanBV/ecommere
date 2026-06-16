import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Green Home Shop',
  description:
    'Thiet bi gia dung thong minh, robot hut bui, robot lau kinh va thiet bi dien tu gia dinh'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-[#f6f6f6] text-gray-700">{children}</body>
    </html>
  );
}
