import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (url.pathname === '/products' || url.pathname.startsWith('/products/')) {
    url.pathname = url.pathname.replace(/^\/products/, '/san-pham');
    renameSearchParam(url, 'category', 'danh-muc');
    renameSearchParam(url, 'brand', 'thuong-hieu');
    return NextResponse.redirect(url, 308);
  }

  if (url.pathname === '/news' || url.pathname.startsWith('/news/')) {
    url.pathname = url.pathname.replace(/^\/news/, '/tin-tuc');
    return NextResponse.redirect(url, 308);
  }

  if (url.pathname === '/about') {
    url.pathname = '/ve-chung-toi';
    return NextResponse.redirect(url, 308);
  }

  if (url.pathname === '/contact') {
    url.pathname = '/lien-he';
    return NextResponse.redirect(url, 308);
  }

  const policyRedirects: Record<string, string> = {
    '/policy/general-regulations': '/chinh-sach/quy-dinh-chung',
    '/policy/terms-of-use-and-privacy': '/chinh-sach/dieu-khoan-su-dung-va-bao-mat',
    '/policy/warranty': '/chinh-sach/bao-hanh',
    '/policy/payment': '/chinh-sach/thanh-toan',
    '/policy/shipping': '/chinh-sach/van-chuyen',
    '/policy/return-exchange': '/chinh-sach/doi-tra'
  };

  const policyTarget = policyRedirects[url.pathname];
  if (policyTarget) {
    url.pathname = policyTarget;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

function renameSearchParam(url: URL, oldKey: string, newKey: string) {
  const value = url.searchParams.get(oldKey);
  if (!value || url.searchParams.has(newKey)) return;

  url.searchParams.set(newKey, value);
  url.searchParams.delete(oldKey);
}

export const config = {
  matcher: ['/products/:path*', '/news/:path*', '/about', '/contact', '/policy/:path*']
};
