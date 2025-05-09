/** @type {import('next').NextConfig} */

// Contentlayer'ı projeye entegre et (geçici olarak devre dışı)
// const { withContentlayer } = require('next-contentlayer');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.vercel.com'],
  },
  swcMinify: true,
  // Burada i18n yapılandırmasını çıkarıyoruz, çünkü App Router ile /src/app/[lang] formatını kullanıyoruz
};

// module.exports = withContentlayer(nextConfig);
module.exports = nextConfig;