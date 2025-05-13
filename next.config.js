/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  // Üretim ortamında ön belleği tamamen devre dışı bırak
  output: 'standalone',
  experimental: {
    // API Routes için de ön belleği devre dışı bırak
    isrMemoryCacheSize: 0,
    // Sunucu bileşenleri için ön belleği devre dışı bırak
    serverComponentsExternalPackages: []
  },
}

module.exports = nextConfig
