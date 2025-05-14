/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  // Vercel için basit yapılandırma
  swcMinify: true,
  // Server Actions için gerekli ayar
  experimental: {
    serverActions: true,
  },
  // ISR değerleri için herhangi bir değer belirtmiyoruz
  webpack: (config) => {
    return config;
  }
}

module.exports = nextConfig;