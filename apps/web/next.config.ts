import type { NextConfig } from 'next';

const apiOrigin =
  process.env.API_PROXY_ORIGIN ??
  (process.env.NODE_ENV === 'production' ? 'http://api:3001' : 'http://localhost:3001');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${apiOrigin}/uploads/:path*`
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'greenhomeshop.vn' }
    ]
  }
};

export default nextConfig;
