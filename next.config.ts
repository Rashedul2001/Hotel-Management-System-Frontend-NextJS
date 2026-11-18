import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/pms/dashboard",
        permanent: true,
      },
      {
        source: "/admin/dashboard",
        destination: "/pms/dashboard",
        permanent: true,
      },
      {
        source: "/admin/:path*",
        destination: "/pms/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
