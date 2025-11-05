/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // PWA Configuration
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // Service Worker & Supabase Optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Suprimir warnings críticos do Supabase (não são erros reais)
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\//,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },

  // Transpilação de módulos ES para melhor compatibilidade
  transpilePackages: ['@supabase/supabase-js'],

  // Disable CSS inlining to avoid critters issues
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configurações experimentais para performance
  experimental: {
    optimizeCss: false,
  },
};

module.exports = nextConfig;