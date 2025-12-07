import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  env: {
    // Set build phase flag for skipping API calls during static generation
    IS_BUILD_PHASE: process.env.npm_lifecycle_event === 'build' ? 'true' : 'false',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow build to continue even if some pages fail during static generation
  staticPageGenerationTimeout: 120,
  experimental: {
    // Fix for Next.js 15 compatibility
    optimizePackageImports: ['@sentry/nextjs', 'react-icons', 'swiper', 'react-toastify'],
  },
  // Compiler optimizations for better performance
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Webpack configuration to handle Sentry Pages Router compatibility
  webpack: (config, { isServer, dev }) => {
    // Only apply externals during production build to avoid dev server issues
    if (isServer && !dev) {
      // Ignore Sentry's Pages Router files in App Router
      config.externals = config.externals || [];
      config.externals.push({
        '_error': 'commonjs _error',
        '_document': 'commonjs _document',
      });
    }
    return config;
  },
  images: {
    // Cloudflare Pages doesn't support Next.js image optimization
    // Use Cloudinary for image optimization instead
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
        pathname: '/**',
      },
    ],
  },
  // API rewrites to proxy requests through Next.js (avoids CORS issues)
  async rewrites() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    return {
      beforeFiles: [
        { source: "/api/auth/register", destination: `${apiOrigin}/api/auth/register` },
      ],
      afterFiles: [
        {
          source: '/sitemap-seo-:segment.xml',
          destination: '/sitemap-seo/:segment',
        },
        {
          source: '/sitemap-:segment.xml',
          destination: '/sitemap/:segment',
        },
      ],
      fallback: [
        {
          source: "/socket.io/:path*",
          destination: `${apiOrigin}/socket.io/:path*`,
        },
        {
          source: "/api/:path*",
          destination: `${apiOrigin}/api/:path*`,
        },
      ],
    };
  },
};

// Wrap config with PWA
export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  scope: '/',
  sw: 'sw.js',
  publicExcludes: ['!noprecache/**/*'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cloudinary-images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      urlPattern: /^\/api\/auth\/.*/i,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 2,
        },
        networkTimeoutSeconds: 3,
      },
    },
  ],
})(nextConfig);
