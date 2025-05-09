/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.vercel.com'],
  },
  swcMinify: true,
  // Burada i18n yapılandırmasını çıkarıyoruz, çünkü App Router ile /src/app/[lang] formatını kullanıyoruz
};

module.exports = nextConfig;