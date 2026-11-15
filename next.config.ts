import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all trycloudflare.com tunnel hosts for HMR and dev resources
  allowedDevOrigins: ["*.trycloudflare.com"],
  async redirects() {
    return [
      {
        source: "/students",
        destination: "/student",
        permanent: true,
      },
      {
        source: "/students/:path*",
        destination: "/student/:path*",
        permanent: true,
      },
      {
        source: "/academics",
        destination: "/academia",
        permanent: true,
      },
      {
        source: "/academics/:path*",
        destination: "/academia/:path*",
        permanent: true,
      },
      {
        source: "/industries",
        destination: "/industry",
        permanent: true,
      },
      {
        source: "/industries/:path*",
        destination: "/industry/:path*",
        permanent: true,
      },
      {
        source: "/direct-portal",
        destination: "/student",
        permanent: true,
      },
      {
        source: "/direct-portals",
        destination: "/student",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
