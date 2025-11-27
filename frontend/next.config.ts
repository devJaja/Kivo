import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
      unoptimized: true,
    },
    distDir: 'build', // optional, keeps .next folder clean
    basePath: '', // ensures links work as relative paths
    assetPrefix: './',
  };

export default nextConfig;
