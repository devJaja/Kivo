import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
      unoptimized: true,
    },
    basePath: '', // ensures links work as relative paths
  };

export default nextConfig;
