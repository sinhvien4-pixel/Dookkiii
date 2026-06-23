import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "emdoi.vn" },
      { protocol: "https", hostname: "aeonmall-long-bien.com.vn" },
      { protocol: "https", hostname: "halotravel.vn" },
      { protocol: "https", hostname: "kenhhomestay.com" },
      { protocol: "https", hostname: "dookkivietnam.vn" },
    ],
  },
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
  },
};

export default nextConfig;
