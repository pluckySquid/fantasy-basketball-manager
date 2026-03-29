import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".build",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
