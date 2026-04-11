import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/site.html",
      },
    ];
  },
};

export default nextConfig;
