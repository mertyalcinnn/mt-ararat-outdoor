/** @type {import('next').NextConfig} */

// Not: CMS entegrasyonu geçici olarak devre dışı bırakıldı
// const cmsConfig = require('./cms-no-types.js');

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,  // Optimizasyon sorunlarından kaçınmak için
    domains: ['assets.vercel.com', 'cdnjs.cloudflare.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
        pathname: '**',
      },
    ],
  },
  swcMinify: true,
  // Burada i18n yapılandırmasını çıkarıyoruz, çünkü App Router ile /src/app/[lang] formatını kullanıyoruz
  
  // TypeScript hatalarını görmezden gel
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint hatalarını görmezden gel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Import alias'ları ayarla
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;