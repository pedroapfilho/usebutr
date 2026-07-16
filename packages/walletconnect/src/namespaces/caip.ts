import type { ChainBase, WalletCapabilities } from "@usebutr/core";

import type { UniversalProviderLike } from "../loader";

/**
 * Runtime capability flags shared by every CAIP-based WalletConnect v2
 * namespace (`solana`, `sui`, `bip122`). All three advertise the same
 * surface at pairing time: sign/send RPC methods are requested, while
 * balance/receipt reads, account requests, sign-in and wallet-side
 * subscriptions are not available over WC today. Per-platform builders
 * spread this into their own exported constant so each keeps a distinct
 * object identity.
 */
const CAIP_WC_CAPABILITIES: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: true,
  signIn: false,
  signMessage: true,
  signTransaction: true,
  subscribe: false,
  switchAccount: false,
  switchChain: true,
};

/** Parse a CAIP-10 string (`<namespace>:<chain>:<address>`) into its
 *  address segment. The address is the trailing part after the last `:`. */
const parseCaip10Address = (caip10: string): string => {
  const lastColon = caip10.lastIndexOf(":");
  return lastColon === -1 ? caip10 : caip10.slice(lastColon + 1);
};

/** Read the accounts of one namespace from the live WC session without
 *  depending on the `@walletconnect/universal-provider` types being
 *  present at build time (the dep is optional). */
const readNamespaceAccounts = (
  provider: UniversalProviderLike,
  namespace: string,
): ReadonlyArray<string> => {
  const session = provider.session as
    | { namespaces?: Record<string, { accounts?: ReadonlyArray<string> }> }
    | null
    | undefined;
  return session?.namespaces?.[namespace]?.accounts ?? [];
};

/** Build a butr `ChainBase` for a CAIP-2 chain id. butr ships no
 *  chain-id → display-name map, so the wallet name is surfaced as the
 *  chain name and consumers overlay their own labels. `namespace` is the
 *  CAIP prefix without its colon (`solana`, `sui`, `bip122`). */
const buildCaipChain = (chainId: string, walletName: string, namespace: string): ChainBase => ({
  id: chainId,
  name: walletName,
  namespace,
  reference: chainId.slice(namespace.length + 1),
});

export { CAIP_WC_CAPABILITIES, buildCaipChain, parseCaip10Address, readNamespaceAccounts };
