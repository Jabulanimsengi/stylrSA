declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
    scope?: string;
    sw?: string;
    publicExcludes?: string[];
    runtimeCaching?: Array<{
      urlPattern: RegExp;
      handler: 'CacheFirst' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate' | 'CacheOnly';
      options?: {
        cacheName?: string;
        expiration?: {
          maxEntries?: number;
          maxAgeSeconds?: number;
        };
        networkTimeoutSeconds?: number;
      };
    }>;
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
