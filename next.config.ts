import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  turbopack: {
    root: process.cwd(),
  },
  reactStrictMode: true,
  async rewrites() {
    const adminUrl = process.env.ADMIN_PANEL_URL || 'http://127.0.0.1:3001';
    const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8001';
    return [
      {
        source: '/admin/:path*',
        destination: `${adminUrl}/admin/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
