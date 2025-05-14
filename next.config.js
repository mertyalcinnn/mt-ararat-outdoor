/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  // Vercel için basit yapılandırma
  swcMinify: true,
  // ISR değerleri için herhangi bir değer belirtmiyoruz
  // Tüm deneysel özellikleri kaldırıyoruz
  webpack: (config) => {
    return config;
  }
}

module.exports = nextConfig;