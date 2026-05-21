import type { WalletAdapter } from "@usebutr/core";
import { discoverWalletStandard } from "@usebutr/wallet-standard-shared";

import { buildSvmAdapter } from "./wallet-standard-adapter";

/**
 * Subscribe to Solana Wallet Standard announcements.
 * Spec: https://github.com/wallet-standard/wallet-standard
 *
 * Runtime requires the `@wallet-standard/app` package, which is an
 * **optional peer dependency** of butr. EVM-only consumers don't need
 * to install it — discovery will silently skip the SVM side if the
 * module isn't resolvable.
 *
 * Install for SVM auto-discovery:
 *
 *     npm install @wallet-standard/app
 *
 * The function returns a synchronous unsubscribe that's safe to call
 * before the dynamic import has resolved.
 *
 * Implementation: the discovery loop (dynamic import, dedupe, register
 * / unregister bridge) lives in `@usebutr/wallet-standard-shared`. This
 * file's only job is to hand the kit a per-wallet builder.
 */
const discoverSvmAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildSvmAdapter(wallet, registerDisconnector),
  );

export { discoverSvmAdapters };
