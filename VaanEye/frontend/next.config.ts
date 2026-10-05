import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: "/app.html",
      },
    ];
  },
};

export default nextConfig;
