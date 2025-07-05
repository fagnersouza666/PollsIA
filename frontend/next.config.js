const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Production optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  transpilePackages: ['@solana/wallet-adapter-base', '@solana/wallet-adapter-react', '@solana/wallet-adapter-react-ui'],
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [
      'raw.githubusercontent.com',  // Para tokens do Solana
      'cdn.jsdelivr.net',          // CDN público
      'assets.coingecko.com',      // CoinGecko assets
      'cryptologos.cc',            // Crypto logos
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  webpack: (config, { webpack, isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );

    // Otimizações de bundle
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all'
          },
          solana: {
            test: /[\\/]node_modules[\\/]@solana[\\/]/,
            name: 'solana',
            priority: 0,
            chunks: 'all'
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 10,
            chunks: 'all'
          }
        }
      }
    }

    return config;
  },
  experimental: {
    esmExternals: 'loose'
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        }
      ]
    }
  ]
}

module.exports = withBundleAnalyzer(nextConfig)