import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@usebutr/core", "@usebutr/evm", "@usebutr/react"],
  turbopack: {
    rules: {
      "*.{ts,tsx}": {
        // Turbopack rejects Unicode RegExp flags.
        // oxlint-disable-next-line eslint/require-unicode-regexp
        condition: { all: [{ not: "foreign" }, { content: /[Zz]od/ }] },
        loaders: ["zod-compiler/turbopack"],
      },
    },
  },
};

export default nextConfig;
