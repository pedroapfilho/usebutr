import type { WalletAdapter } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify as kitSlugify,
} from "@usebutr/wallet-standard-shared";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import { resolveWalletStandardPolkadotCapabilities } from "./capabilities";
import { noRpcBalance, noRpcSendTx, noRpcSendTxToChain, noRpcTransactionReceipt } from "./no-rpc";
import type { PolkadotSignMessageFeature } from "./wallet-standard-types";

const POLKADOT_PREFIX = "polkadot:";

const slugify = (name: string): string => kitSlugify("polkadot", name);

/**
 * Adapt a Wallet Standard wallet advertising `polkadot:*` features into a
 * butr `WalletAdapter`. Returns `null` for wallets that don't advertise a
 * polkadot chain or `standard:connect`. butr ships no RPC, so
 * sendTx/getBalance/getTransactionReceipt are placeholders; transaction
 * signing goes through `getSigner()` (returns the Wallet Standard wallet).
 */
const buildPolkadotWalletStandardAdapter = (
  wallet: WalletStandardWallet,
  /** Optional. Called with a function that pushes a synthetic
   *  `disconnected` event to all current subscribers. The discovery
   *  layer invokes it on Wallet Standard `unregister`. */
  registerDisconnector?: (emit: () => void) => void,
): WalletAdapter | null => {
  const core = createWalletStandardCore({
    chainPrefix: POLKADOT_PREFIX,
    id: slugify(wallet.name),
    label: "Polkadot",
    namespace: "polkadot",
    platform: "Polkadot",
    preferredChainIds: [],
    registerDisconnector,
    trackChainChanges: false,
    wallet,
  });
  if (core === null) {
    return null;
  }

  const signMessage = getFeature<PolkadotSignMessageFeature>(wallet, "polkadot:signMessage");

  return {
    ...core,
    capabilities: resolveWalletStandardPolkadotCapabilities({
      chainCount: core.chainCount,
      features: { events: core.hasEvents, signMessage: Boolean(signMessage) },
    }),
    chainPlatform: "polkadot",

    getBalance: noRpcBalance,

    getTransactionReceipt: noRpcTransactionReceipt,

    sendTx: noRpcSendTx,

    sendTxToChain: noRpcSendTxToChain,

    async signMessage(msg, account) {
      if (signMessage === undefined) {
        throw new Error(`Wallet ${wallet.name} does not advertise polkadot:signMessage`);
      }
      const output = await signMessage.signMessage({
        account: core.resolveAccount(account),
        message: msg,
      });
      return { signature: output.signature, signedMessage: output.signedMessage ?? msg };
    },
  };
};

/**
 * Subscribe to Wallet Standard announcements and emit adapters for
 * wallets advertising `polkadot:*` features (Talisman, SubWallet). Used
 * as the FALLBACK channel; see `polkadotDiscoverer`. Requires the
 * optional `@wallet-standard/app` peer dep; absent → no-op.
 */
const discoverPolkadotWalletStandardAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildPolkadotWalletStandardAdapter(wallet, registerDisconnector),
  );

export { buildPolkadotWalletStandardAdapter, discoverPolkadotWalletStandardAdapters };
