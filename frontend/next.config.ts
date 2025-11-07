import type { NextConfig } from "next";
import withPWA from 'next-pwa';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Fix for Next.js 15 compatibility
    optimizePackageImports: ['@sentry/nextjs'],
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
    formats: ['image/avif', 'image/webp'], // Modern formats first
    // Reduce device sizes to save memory in production
    deviceSizes: process.env.NODE_ENV === 'production' ? [640, 750, 1080, 1920] : [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: process.env.NODE_ENV === 'production' ? [16, 32, 64, 128] : [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images for 30 days
    dangerouslyAllowSVG: false, // Security: block SVG uploads
    contentDispositionType: 'attachment', // Security: force download
    // Disable image optimization if specified (use Cloudinary instead)
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === 'true',
  },
  async rewrites() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:5000";
    return {
      beforeFiles: [
        // Proxy credential REST endpoints to backend while keeping NextAuth handled locally
        { source: "/api/auth/login", destination: `${apiOrigin}/api/auth/login` },
        { source: "/api/auth/register", destination: `${apiOrigin}/api/auth/register` },
        { source: "/api/auth/status", destination: `${apiOrigin}/api/auth/status` },
        { source: "/api/auth/logout", destination: `${apiOrigin}/api/auth/logout` },
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
  // Force service worker update after domain migration
  publicExcludes: ['!noprecache/**/*'],
  runtimeCaching: [
    {
      // Cloudinary images - can cache longer since they have unique URLs when changed
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cloudinary-images',
        expiration: {
          maxEntries: 50, // Reduced from 200 to save memory
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      // Google Fonts - safe to cache long-term
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      // Next.js optimized images - use StaleWhileRevalidate to update in background
      urlPattern: /^\/_next\/image\?url=.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 50, // Reduced from 200 to save memory
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      // Static images - use StaleWhileRevalidate instead of CacheFirst
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 1 day (reduced from 7)
        },
      },
    },
    {
      // JS/CSS - StaleWhileRevalidate for better updates
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
    {
      // Auth API calls - NEVER cache authentication endpoints
      urlPattern: /^\/api\/auth\/.*/i,
      handler: 'NetworkOnly',
    },
    {
      // Other API calls - NetworkFirst with shorter timeout
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 2, // 2 minutes (reduced from 5)
        },
        networkTimeoutSeconds: 3, // 3 seconds (reduced from 10)
      },
    },
  ],
})(nextConfig);