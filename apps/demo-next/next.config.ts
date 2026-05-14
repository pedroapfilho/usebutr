import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@butr/core", "@butr/evm", "@butr/react"],
};

export default nextConfig;
