import "./globals.css";

import { readWalletSnapshot } from "@usebutr/core";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { STORAGE_KEY_PREFIX, WalletProvider } from "../wallet-provider";

export const metadata = {
  title: "butr · Next.js",
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  // Read cookies once on the server and feed both channels:
  //  - `initialCookies`: powers the cookie storage driver's SSR reads
  //    so the storage layer is consistent across server and client.
  //  - `initialSnapshot`: a typed view of the persisted pool, ready
  //    for `useWalletSnapshot()` to render a connected shell during
  //    the first paint — no client-side hydration flicker.
  const cookieStore = await cookies();
  const initialCookies: Record<string, string> = {};
  for (const { name, value } of cookieStore.getAll()) {
    initialCookies[name] = value;
  }
  const initialSnapshot = readWalletSnapshot(initialCookies, { keyPrefix: STORAGE_KEY_PREFIX });

  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body>
        <WalletProvider initialCookies={initialCookies} initialSnapshot={initialSnapshot}>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
};

export default RootLayout;
