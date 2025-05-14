/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
    unoptimized: true, // Statik export için gerekli
  },
  // Statik export için
  output: 'export',
  // Vercel için basit yapılandırma
  swcMinify: true,
  // ISR değerleri için herhangi bir değer belirtmiyoruz
  webpack: (config) => {
    return config;
  }
}

module.exports = nextConfig;