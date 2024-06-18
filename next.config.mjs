/** @type {import('next').NextConfig} */

const nextConfig = {
    webpack: (config, { isServer }) => {
        // If client-side, don't polyfill `fs`
        if (!isServer) {
          config.resolve.fallback = {
            fs: false,
          };
        }
        return config;
      },
    pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js']
}

export default nextConfig;
