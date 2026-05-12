import type { WalletAdapter } from "../types";
import { discoverEvmAdapters } from "./eip6963";
import { discoverSvmAdapters } from "./wallet-standard";

/**
 * Which platforms to discover. Omitting a flag (or setting it to
 * `false`) skips that platform entirely — useful for apps that target
 * only EVM or only Solana, so unused listeners don't fire and unused
 * adapters don't show up in `useDiscoveredWallets()`.
 *
 * Default when omitted: both `true` (full discovery).
 */
type DiscoverOptions = {
  evm?: boolean;
  svm?: boolean;
};

/**
 * Resolve an `auto` prop input into a concrete set of enabled
 * platforms. The single place where the `true | DiscoverOptions`
 * union is interpreted.
 *
 * **Defaults**
 *
 *  - `true` (or omitted) → both platforms enabled. The
 *    `<WalletManagerProvider auto>` shorthand uses this path.
 *  - `false` (or `undefined`) → discovery disabled.
 *  - Object form → opt-in. `{ evm: true }` discovers only EVM;
 *    unspecified flags default to `false`, so `{ evm: true }` means
 *    "EVM-only app" the way most callers expect.
 */
const resolveDiscoverOptions = (
  auto: true | false | DiscoverOptions | undefined,
): { active: boolean; evm: boolean; svm: boolean } => {
  if (auto === undefined || auto === false) {
    return { active: false, evm: false, svm: false };
  }
  if (auto === true) {
    return { active: true, evm: true, svm: true };
  }
  return {
    active: true,
    evm: auto.evm === true,
    svm: auto.svm === true,
  };
};

/**
 * Subscribe to both EIP-6963 (EVM) and Wallet Standard (SVM) at once.
 * Calls `onAdapter` exactly once per unique wallet, deduplicated by
 * `adapter.id`. See `resolveDiscoverOptions` for the defaults that
 * apply when `options` is omitted.
 *
 * The returned function unsubscribes whichever listeners were attached.
 */
const discoverWalletAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  options?: DiscoverOptions,
): (() => void) => {
  const resolved = resolveDiscoverOptions(options ?? true);

  const seen = new Set<string>();
  const add = (adapter: WalletAdapter) => {
    if (seen.has(adapter.id)) {
      return;
    }
    seen.add(adapter.id);
    onAdapter(adapter);
  };

  const unsubEvm = resolved.evm ? discoverEvmAdapters(add) : () => {};
  const unsubSvm = resolved.svm ? discoverSvmAdapters(add) : () => {};

  return () => {
    unsubEvm();
    unsubSvm();
  };
};

export type { DiscoverOptions };
export { discoverWalletAdapters, resolveDiscoverOptions };
