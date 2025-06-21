/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@solana/wallet-adapter-base', '@solana/wallet-adapter-react', '@solana/wallet-adapter-react-ui'],
  webpack: (config, { webpack }) => {
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

    return config;
  },
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig