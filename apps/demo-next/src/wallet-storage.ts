import { createCookieWalletStorage } from "@usebutr/core";

/**
 * Outside the "use client" module: a Server Component importing from one
 * receives a client reference, not the object, and the layout reads the
 * initial state with it.
 */
const walletStorage = createCookieWalletStorage({
  keyPrefix: "butr-demo",
  secure: process.env.NODE_ENV === "production",
});

export { walletStorage };
