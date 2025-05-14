/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  output: 'standalone',
  experimental: {
    isrMemoryCacheSize: 0,
    serverComponentsExternalPackages: []
  },
  // PostCSS'i manuel yapılandırma
  webpack: (config) => {
    return config;
  }
}