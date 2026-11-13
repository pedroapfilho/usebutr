import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["usebutr.landing.localhost", "*.usebutr.landing.localhost"],
  headers: () =>
    Promise.resolve([
      {
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
        source: "/:path*",
      },
    ]),
  reactStrictMode: true,
};

export default nextConfig;
