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
 * Subscribe to both EIP-6963 (EVM) and Wallet Standard (SVM) at once.
 * Calls `onAdapter` exactly once per unique wallet, deduplicated by
 * `adapter.id`.
 *
 * **Defaults**
 *
 *  - No options passed → both platforms enabled (the
 *    `<WalletManagerProvider auto>` shorthand uses this path).
 *  - Options object passed → opt-in. `{ evm: true }` discovers only
 *    EVM; `{ svm: true }` discovers only SVM. Unspecified flags
 *    default to `false` when the object form is used, which makes
 *    `{ evm: true }` mean "EVM-only app" the way most callers expect.
 *
 * The returned function unsubscribes whichever listeners were attached.
 */
const discoverWalletAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  options?: DiscoverOptions,
): (() => void) => {
  // No options object = "both" (`auto={true}` shorthand). With an
  // explicit object, only flags set to true are enabled — unspecified
  // becomes `false`, not the global default.
  const evmEnabled = options ? options.evm === true : true;
  const svmEnabled = options ? options.svm === true : true;

  const seen = new Set<string>();
  const add = (adapter: WalletAdapter) => {
    if (seen.has(adapter.id)) {
      return;
    }
    seen.add(adapter.id);
    onAdapter(adapter);
  };

  const unsubEvm = evmEnabled ? discoverEvmAdapters(add) : () => {};
  const unsubSvm = svmEnabled ? discoverSvmAdapters(add) : () => {};

  return () => {
    unsubEvm();
    unsubSvm();
  };
};

export type { DiscoverOptions };
export { discoverWalletAdapters };
