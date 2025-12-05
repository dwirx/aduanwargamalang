import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static page generation for pages that use client-side only features
  experimental: {
    // This helps with packages that use window/document
  },
  // Transpile leaflet packages
  transpilePackages: ['leaflet', 'react-leaflet'],
};

export default nextConfig;
