/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    // Untuk Next.js 13+ gunakan remotePatterns
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
    // Jika Next.js versi lama (12 atau dibawah), gunakan domains
    // domains: ['localhost'],
  },
};

export default nextConfig;