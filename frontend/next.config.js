/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed obsolete experimental.appDir - it's default in Next.js 14
  output: 'standalone', // For Docker optimization
  transpilePackages: ['@solana/wallet-adapter-base'],
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
}

module.exports = nextConfig