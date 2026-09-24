import type { WalletAdapter } from "@usebutr/core";

import type { UniversalProviderLike } from "../loader";
import type { WalletConnectSession } from "../session";

type NamespaceAdapterInput = {
  /** Chains advertised to the wallet at pairing time; the first is the
   *  adapter's chain until `switchChain`. */
  chains: ReadonlyArray<string>;
  icon: string;
  id: string;
  name: string;
  provider: UniversalProviderLike;
  /** Pairing state shared with the sibling adapters built in the same
   *  factory call. Omit it to drive the builder standalone, in which
   *  case it pairs for its own namespace only. */
  session?: WalletConnectSession;
};

/**
 * WC v2's `UniversalProvider` exposes one `request(args, chain)` across
 * every paired namespace, while butr's adapters are per platform, so
 * bridging the two is per-namespace work.
 */
type WalletConnectNamespaceBuilder<Adapter extends WalletAdapter = WalletAdapter> = {
  buildAdapter: (input: NamespaceAdapterInput) => Adapter;
  /** CAIP-2 namespace prefix (`eip155`, `solana`, `sui`, `bip122`). */
  caipPrefix: string;
  /** butr chain id → the id WalletConnect sessions use for it, where they
   *  differ (Solana clusters are named by genesis hash). */
  chainAliases?: ReadonlyMap<string, string>;
  chainPlatform: Adapter["chainPlatform"];
  /** Chains advertised to the wallet at pairing time when the caller
   *  doesn't specify any. */
  defaultChains: ReadonlyArray<string>;
  /** RPC events to subscribe to. */
  defaultEvents: ReadonlyArray<string>;
  /** RPC methods to request access to at pairing time. */
  defaultMethods: ReadonlyArray<string>;
};

export type { NamespaceAdapterInput, WalletConnectNamespaceBuilder };
