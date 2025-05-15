/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Dinamik rendering için
  swcMinify: true,
  output: 'standalone',
  experimental: {
    // Tamamen dinamik mod
    serverActions: {
      bodySizeLimit: '5mb',
    },
    serverComponentsExternalPackages: ['react-dom', '@mui/material'],
  },
  // Statik önbelleği devre dışı bırak
  staticPageGenerationTimeout: 90,
  // Önbellek süresini kısalt
  onDemandEntries: {
    maxInactiveAge: 10,
    pagesBufferLength: 1,
  },
  // Her zaman server-side render
  // Bu özellik statik sayfaları oluşturmayı devre dışı bırakır
  // ve her sayfa isteğini sunucu tarafında işler
  compiler: {
    styledComponents: true,
  },
  assetPrefix: '',
}

module.exports = nextConfig