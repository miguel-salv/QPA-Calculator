import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',  // Changed from 'standalone' to 'export' for static site generation
  images: {
    unoptimized: true,
  },
  trailingSlash: true,  // Add trailing slashes to all routes
};

export default nextConfig;
