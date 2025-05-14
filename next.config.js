/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  // Vercel için basit yapılandırma
  swcMinify: true,
  // Dinamik API rotaları için server rendering kullan
  // output: 'export' yerine bu yapılandırmayı kullanıyoruz
  // bu, API rotalarının dinamik olarak çalışmasını sağlar
  output: 'standalone',
  // API yolları için server components ayarı
  experimental: {
    serverComponentsExternalPackages: ['react-dom', '@mui/material'],
  },
  // ISR değerleri için herhangi bir değer belirtmiyoruz
  webpack: (config) => {
    return config;
  }
}

module.exports = nextConfig;