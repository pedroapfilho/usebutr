import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
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
