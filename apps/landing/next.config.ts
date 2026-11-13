import { applyPortlessUrls } from "@repo/portless-env";
import type { NextConfig } from "next";

applyPortlessUrls(["NEXT_PUBLIC_DEMO_URL", "NEXT_PUBLIC_DOCS_URL"]);

const nextConfig: NextConfig = {
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
