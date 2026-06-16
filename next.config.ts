import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 开发时允许的跨域来源
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.3.2'],

  // 图片优化
  images: {
    domains: ['yourdomain.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 压缩
  compress: true,

  // 性能优化
  poweredByHeader: false,
  generateEtags: true,

  // 实验性功能
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'react-markdown'],
  },

  // Headers配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
