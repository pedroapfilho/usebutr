import type { ChainPlatform, WalletAdapter } from "@usebutr/core";

import type { UniversalProviderLike } from "../loader";
import type { WalletConnectSession } from "../session";

/**
 * WC v2's `UniversalProvider` exposes one `request(method, params)` across
 * every paired namespace, while butr's `WalletAdapter` is a per-platform
 * contract, so bridging the two is per-namespace work.
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
    /** Pairing state shared with the sibling adapters built in the same
     *  factory call. Omit it to drive the builder standalone, in which
     *  case it pairs for its own namespace only. */
    session?: WalletConnectSession;
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
