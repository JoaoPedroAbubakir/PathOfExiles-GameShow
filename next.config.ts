import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'external-content.duckduckgo.com',
        pathname: '/**',
      },
      // Add other common image hosting services you might use
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.imgur.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
