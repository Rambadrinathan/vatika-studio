import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow larger request bodies for multi-image generation (scene + product refs)
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
