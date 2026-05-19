import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  // Serve any docs page as Markdown by appending `.md` (used by the
  // "Copy Markdown" / "View as Markdown" page actions).
  async rewrites() {
    return [
      { source: "/index.md", destination: "/llms.mdx" },
      { source: "/:path*.md", destination: "/llms.mdx/:path*" },
    ];
  },
};

export default withMDX(config);
