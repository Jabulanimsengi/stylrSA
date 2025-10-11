import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
    ],
  },
  async rewrites() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:3000";
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

export default nextConfig;