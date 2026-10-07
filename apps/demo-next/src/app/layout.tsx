import "./globals.css";

import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { WalletProvider } from "../wallet-provider";
import { walletStorage } from "../wallet-storage";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "butr · Next.js",
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  // Only the parsed snapshot crosses into the client bundle, never the raw jar,
  // so httpOnly session cookies stay out of the RSC payload.
  const cookieStore = await cookies();
  const initialState = walletStorage.readInitialState(cookieStore.getAll());

  return (
    <html className="scheme-light" lang="en">
      <body className={geist.className}>
        <WalletProvider initialState={initialState}>{children}</WalletProvider>
      </body>
    </html>
  );
};

export default RootLayout;
