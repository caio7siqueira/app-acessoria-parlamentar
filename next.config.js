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

  // Disable CSS optimization completely
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Force disable all optimizations that could use critters
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react'],
  },

  // Force dynamic rendering to avoid static generation issues
  output: 'standalone',

  // Configure generation behavior
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // Use SWC minifier instead of Terser/critters
  swcMinify: true,
};

module.exports = nextConfig;