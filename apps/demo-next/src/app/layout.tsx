import "./globals.css";

import { readWalletSnapshot } from "@usebutr/core";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { STORAGE_KEY_PREFIX, WalletProvider } from "../wallet-provider";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "butr · Next.js",
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = await cookies();
  // Only butr's own keys may cross into the client bundle. `initialCookies` is a
  // prop on a "use client" component, so anything placed here is serialized into
  // the RSC payload and readable from JS: forwarding the whole jar would publish
  // httpOnly session cookies to the page.
  const initialCookies: Record<string, string> = {};
  for (const { name, value } of cookieStore.getAll()) {
    if (name.startsWith(`${STORAGE_KEY_PREFIX}-`)) {
      initialCookies[name] = value;
    }
  }
  const initialState = readWalletSnapshot(initialCookies, { keyPrefix: STORAGE_KEY_PREFIX });

  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body className={geist.className}>
        <WalletProvider initialCookies={initialCookies} initialState={initialState}>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
};

export default RootLayout;
