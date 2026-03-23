/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  },
  webpack: (config, { isServer }) => {
    // Exclude jest from webpack bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'jest-runtime': 'jest-runtime',
        '@jest/globals': '@jest/globals',
      });
    }
    return config;
  },
}

module.exports = nextConfig
