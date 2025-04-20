import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude test files from the build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Exclude test directory from the build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
