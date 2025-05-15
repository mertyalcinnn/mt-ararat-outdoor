/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'mt-ararat-outdoor.vercel.app',
      'res.cloudinary.com',
      'likyaclimbing.com',
      'www.likyaclimbing.com'
    ],
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
    // Bilinmeyen görüntüler için Blob URL'leri yok sayma
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Vercel için basit yapılandırma
  swcMinify: true,
  // Dinamik sayfalar için Server-Side Rendering kullan
  output: 'standalone',
  // API yolları için server components ayarı
  experimental: {
    serverComponentsExternalPackages: ['react-dom'],
    serverActions: true,
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
  // API route'ları için CORS ayarları
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
  // API route'ları için ek ayarlar
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig