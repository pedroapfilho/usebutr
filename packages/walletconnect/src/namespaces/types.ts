import type { ChainPlatform, WalletAdapter } from "@usebutr/core";

import type { UniversalProviderLike } from "../loader";

/**
 * Self-describing builder for one CAIP-2 namespace in a WalletConnect
 * pairing. Each `WalletConnectNamespaceBuilder` is a complete recipe
 * for "WC speaks this chain platform": which CAIP prefix, which
 * methods to request, which events to subscribe to, and how to wrap
 * the resulting RPC surface as a butr `WalletAdapter`.
 *
 * **Why this seam exists.** WC v2's `UniversalProvider` exposes a
 * single `request(method, params)` interface that spans every
 * namespace the session was paired with. butr's `WalletAdapter` is a
 * per-platform contract. Bridging the two is per-namespace work:
 *
 *  - `eip155` → `eth_sendTransaction`, `personal_sign`, etc.
 *  - `solana` → `solana_signMessage`, `solana_signAndSendTransaction`, etc.
 *  - `sui`    → `sui_signPersonalMessage`, `sui_signAndExecuteTransaction`, etc.
 *  - `bip122` → `signMessage`, `signPsbt`, `sendTransfer`, etc.
 *
 * Adding a new platform = add one file under `src/namespaces/` exporting
 * a `WalletConnectNamespaceBuilder`. The factory iterates the registered
 * builders; no changes elsewhere.
 *
 * The EVM, SVM (Solana), Sui, and Bitcoin (bip122) builders all ship
 * under `src/namespaces/`, each registered in the adapter's
 * `KNOWN_NAMESPACES`.
 */
type WalletConnectNamespaceBuilder = {
  /**
   * Build a `WalletAdapter` over the paired `UniversalProvider`. Called
   * after a successful pairing handshake; the provider is live and ready
   * to route requests in this namespace.
   */
  buildAdapter: (input: {
    chains: ReadonlyArray<string>;
    icon: string;
    id: string;
    name: string;
    provider: UniversalProviderLike;
  }) => WalletAdapter;
  /** CAIP-2 namespace prefix (`eip155`, `solana`, `sui`, `bip122`). */
  caipPrefix: string;
  /** butr's `ChainPlatform` for adapters this builder produces. */
  chainPlatform: ChainPlatform;
  /** Chains advertised to the wallet at pairing time when the caller
   *  doesn't specify any. Use this for sensible defaults. */
  defaultChains: ReadonlyArray<string>;
  /** RPC events to subscribe to. */
  defaultEvents: ReadonlyArray<string>;
  /** RPC methods to request access to at pairing time. */
  defaultMethods: ReadonlyArray<string>;
};

export type { WalletConnectNamespaceBuilder };
