import type { NextConfig } from 'next';
import path from 'node:path';

const apiOrigin =
  process.env.API_PROXY_ORIGIN ??
  (process.env.NODE_ENV === 'production' ? 'http://api:3001' : 'http://localhost:3001');

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      const modernBrowserNoop = path.resolve(
        process.cwd(),
        'src/polyfills/modern-browser-noop.ts'
      );

      config.resolve.alias = {
        ...config.resolve.alias,
        '../build/polyfills/polyfill-module': modernBrowserNoop,
        'next/dist/build/polyfills/polyfill-module': modernBrowserNoop
      };
    }

    return config;
  },
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
