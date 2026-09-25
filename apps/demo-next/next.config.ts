import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["usebutr.demo-next.localhost", "*.usebutr.demo-next.localhost"],
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
  transpilePackages: ["@usebutr/core", "@usebutr/evm", "@usebutr/react"],
  turbopack: {
    rules: {
      "*.{ts,tsx}": {
        condition: {
          all: [{ not: "foreign" }, { content: /[Zz]od/ }],
        },
        loaders: ["zod-compiler/turbopack"],
      },
    },
  },
};

export default nextConfig;
