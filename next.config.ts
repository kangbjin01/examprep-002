import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        // Proxy PocketBase API through Next.js
        // So the frontend only needs one domain
        source: "/pb/:path*",
        destination: `${process.env.POCKETBASE_INTERNAL_URL || "http://pocketbase:8090"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
