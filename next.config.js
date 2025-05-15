/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
    unoptimized: true, // Yerel görseller için optimize etmeyi devre dışı bırak
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
  // Vercel için basit yapılandırma
  swcMinify: true,
  // Dinamik sayfalar için Server-Side Rendering kullan
  output: 'standalone',
  // API yolları için server components ayarı
  experimental: {
    serverComponentsExternalPackages: ['react-dom', '@mui/material'],
  },
  // Statik sayfaları otomatik olarak güncellemek için revalidate süresini kısa tut
  staticPageGenerationTimeout: 90,
  // Sayfa önbelleğini devre dışı bırak
  onDemandEntries: {
    // Server sadece kısa bir süre için sayfa önbelleğini tutar
    maxInactiveAge: 10,
    // Aynı anda en fazla 1 sayfa önbellekte tutulur
    pagesBufferLength: 1,
  },
  // Önemli: Statik dosyaların yolunu korur
  // Dil tabanlı yönlendirme kullanılırken statik dosyaların erihşimi için
  assetPrefix: '',
}

module.exports = nextConfig