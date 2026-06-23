import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "emdoi.vn" },
      { protocol: "https", hostname: "aeonmall-long-bien.com.vn" },
      { protocol: "https", hostname: "halotravel.vn" },
      { protocol: "https", hostname: "kenhhomestay.com" },
      { protocol: "https", hostname: "dookkivietnam.vn" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default nextConfig;
