import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Serve any docs page as Markdown by appending `.md` (used by the
  // "Copy Markdown" / "View as Markdown" page actions).
  async rewrites() {
    return [
      { source: "/docs.md", destination: "/llms.mdx/docs" },
      { source: "/docs/:path*.md", destination: "/llms.mdx/docs/:path*" },
    ];
  },
};

export default withMDX(config);
