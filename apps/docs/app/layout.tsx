import "@/app/global.css";

import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  description:
    "Documentation for butr: multi-chain (EVM, Solana, Sui, Bitcoin, Polkadot) wallet management primitives for React.",
  metadataBase: new URL("https://docs.usebutr.com"),
  title: {
    default: "butr: multi-chain wallet management for React",
    template: "%s · butr docs",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "oklch(1 0 0)", media: "(prefers-color-scheme: light)" },
    { color: "oklch(0.145 0 0)", media: "(prefers-color-scheme: dark)" },
  ],
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <body className="flex min-h-screen flex-col">
      {/* Scroll-driven reading progress bar; hidden when user prefers reduced motion via CSS */}
      <div
        aria-hidden="true"
        className="reading-progress-bar fixed top-0 left-0 z-50 h-0.5 bg-[--primary] [animation-range:0%_100%]"
        style={{ width: "0%" }}
      />
      {/* oxlint-disable-next-line typescript/no-deprecated -- fumadocs static-search `type` option; migration to the re-created dialog is tracked upstream */}
      <RootProvider search={{ options: { type: "static" } }}>{children}</RootProvider>
    </body>
  </html>
);

export default RootLayout;
