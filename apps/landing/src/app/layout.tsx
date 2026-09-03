import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const metadata: Metadata = {
  description:
    "butr discovers EVM, Solana, Sui, Bitcoin, and Polkadot wallets and manages their connection state through one React hook surface. Bring your own chain library.",
  metadataBase: new URL("https://usebutr.com"),
  openGraph: {
    description:
      "Discover and manage EVM, Solana, Sui, Bitcoin, and Polkadot wallets through one React hook surface.",
    siteName: "butr",
    title: "butr: multi-chain wallet management for React",
    type: "website",
    url: "https://usebutr.com",
  },
  title: {
    default: "butr: multi-chain wallet management for React",
    template: "%s · butr",
  },
};

const viewport: Viewport = {
  themeColor: "oklch(1 0 0)",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html className={`${geist.variable} ${geistMono.variable} antialiased`} lang="en">
    <body>{children}</body>
  </html>
);

export { metadata, viewport };
export default RootLayout;
