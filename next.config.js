/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  // Vercel için basit yapılandırma
  swcMinify: true,
  // Vercel için runtime ayarı
  experimental: {
    // Edge runtime'a geçiş (daha hızlı ve hafif)
    runtime: 'nodejs',
  },
  // ISR değerleri için herhangi bir değer belirtmiyoruz
  webpack: (config) => {
    return config;
  }
}

module.exports = nextConfig;