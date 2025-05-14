/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  // output: 'standalone', // Vercel için bu ayarı kaldırıyoruz
  experimental: {
    // isrMemoryCacheSize: 0, // ISR bellek önbelleği sorunlarına neden olabilir
    serverComponentsExternalPackages: []
  },
  // PostCSS'i manuel yapılandırma
  webpack: (config) => {
    return config;
  }
}

module.exports = nextConfig;