import "./globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist",
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

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html className={geist.variable} lang="en">
    <body>{children}</body>
  </html>
);

export { metadata };
export default RootLayout;
