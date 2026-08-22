import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow external map styles and weather icons if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.maptiler.com",
      },
      {
        protocol: "https",
        hostname: "openweathermap.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
