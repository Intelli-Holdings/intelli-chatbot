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
  };
  
  export default nextConfig;