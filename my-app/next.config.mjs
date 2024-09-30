// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false,
      fs: false,
      'fs/promises': false,
      net: false,
      tls: false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'intelli.medium.com',
        port: '',
        pathname: '/*',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com', // Added to allow the Google Chart QR code
        port: '',
        pathname: '/v1/create-qr-code/**', // This matches the path for generating QR codes
      },
    ],
  },
};

export default nextConfig;