import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    formats: ['image/webp'],
    loader: 'default'
  },
    async headers() {
      return [
        {
          source: "/api/:path*",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
            },
            {
              key: "Access-Control-Allow-Credentials",
              value: "true",
            },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
            },
          ],
        },
      ];
    },
};

export default nextConfig;
