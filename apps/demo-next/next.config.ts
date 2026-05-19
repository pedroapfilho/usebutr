import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@usebutr/core", "@usebutr/evm", "@usebutr/react"],
};

export default nextConfig;
