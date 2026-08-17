import type { WalletAdapter } from "@usebutr/core";
import { buildAccount, bytesToBase64 } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import { resolveWalletStandardCapabilities } from "./capabilities";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignInFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature,
} from "./wallet-standard-types";

const SOLANA_PREFIX = "solana:";
const SOLANA_DECIMALS = 9;
const SOLANA_MAINNETS: ReadonlyArray<string> = ["solana:mainnet", "solana:mainnet-beta"];

/**
 * Adapt a Solana Wallet Standard `Wallet` object into a butr
 * `WalletAdapter`. Returns `null` if the wallet doesn't advertise any
 * Solana chain or doesn't expose `standard:connect`; both required
 * for butr to do anything useful with it.
 *
 * **Capability gating**
 *
 *  - `signMessage` is only present if the wallet advertises
 *    `solana:signMessage`. Without it, calling `adapter.signMessage`
 *    rejects with a clear error.
 *  - `sendTx` / `sendTxToChain` use `solana:signAndSendTransaction`.
 *    Without it, those methods reject.
 *  - `subscribe` is wired through `standard:events`. Wallets that
 *    don't expose events get a no-op unsubscribe.
 *
 * **Known limitations**
 *
 *  - `getBalance` returns `{ value: 0n, formatted: "0", … }`. Solana
 *    balance reads require an RPC connection that's outside butr's
 *    scope; consumers wrap their own RPC client.
 *  - `getTransactionReceipt` returns `{ status: "Pending" }`. Same
 *    reason; needs an RPC.
 *  - `switchChain` updates butr's view of the current Solana cluster
 *    locally and routes subsequent `signAndSendTransaction` calls
 *    through the new chain. Wallet Standard has no "tell the wallet
 *    to switch cluster" RPC; the wallet's own UI controls its global
 *    cluster setting, and `signAndSendTransaction` accepts the chain
 *    per-call. The chain must be one the wallet advertises in
 *    `wallet.chains`; otherwise the call rejects.
 *  - `requestAccounts` re-runs `standard:connect`. Some wallets show
 *    their account picker again; others (those that "remember"
 *    authorisations) silently return the existing accounts. butr
 *    refreshes the pool entry's `accounts` array either way.
 *  - `switchAccount` is intentionally unimplemented. Wallet Standard
 *    has no silent "use address X" feature; the user picks the active
 *    account through the wallet's own UI. `signAndSendTransaction`
 *    accepts an `account` input, so consumers needing per-tx address
 *    selection can pick one from `accounts` at call time.
 */
const buildSvmAdapter = (
  wallet: WalletStandardWallet,
  /** Optional. Called with a function that pushes a synthetic
   *  `disconnected` event to all current subscribers. The discovery
   *  layer invokes it on Wallet Standard `unregister` so a connected
   *  pool entry tears down when its extension is removed. */
  registerDisconnector?: (emit: () => void) => void,
): WalletAdapter | null => {
  const core = createWalletStandardCore({
    chainPrefix: SOLANA_PREFIX,
    id: slugify("svm", wallet.name),
    label: "SVM",
    namespace: "solana",
    platform: "Solana",
    preferredChainIds: SOLANA_MAINNETS,
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });
  if (core === null) {
    return null;
  }

  const signMessage = getFeature<SolanaSignMessageFeature>(wallet, "solana:signMessage");
  const signAndSendTx = getFeature<SolanaSignAndSendTransactionFeature>(
    wallet,
    "solana:signAndSendTransaction",
  );
  const signTx = getFeature<SolanaSignTransactionFeature>(wallet, "solana:signTransaction");
  const signIn = getFeature<SolanaSignInFeature>(wallet, "solana:signIn");

  const signAndSend = async (tx: unknown, account?: { walletAddress: string }): Promise<string> => {
    if (signAndSendTx === undefined) {
      throw new Error(`Wallet ${wallet.name} does not advertise solana:signAndSendTransaction`);
    }
    const wsAccount = core.resolveAccount(account);
    if (!(tx instanceof Uint8Array)) {
      throw new TypeError("SVM sendTx expects a serialized transaction (Uint8Array)");
    }
    const [output] = await signAndSendTx.signAndSendTransaction({
      account: wsAccount,
      chain: core.currentChainId(),
      transaction: tx,
    });
    if (output === undefined) {
      throw new Error("signAndSendTransaction returned no outputs");
    }
    return bytesToBase64(output.signature);
  };

  return {
    ...core,
    capabilities: resolveWalletStandardCapabilities({
      chainCount: core.chainCount,
      features: {
        events: core.hasEvents,
        signAndSendTransaction: Boolean(signAndSendTx),
        signIn: Boolean(signIn),
        signMessage: Boolean(signMessage),
        signTransaction: Boolean(signTx),
      },
    }),
    chainPlatform: "svm",

    getBalance: () =>
      Promise.resolve({
        decimals: SOLANA_DECIMALS,
        formatted: "0",
        symbol: "SOL",
        value: 0n,
      }),

    getTransactionReceipt: () => Promise.resolve({ status: "Pending" as const }),

    async requestAccounts() {
      await core.connect();
    },

    sendTx: (tx, account) => signAndSend(tx, account),

    sendTxToChain: (tx, _targetChainId, account, cb) => {
      cb?.();
      return signAndSend(tx, account);
    },

    async signMessage(msg, account) {
      if (signMessage === undefined) {
        throw new Error(`Wallet ${wallet.name} does not advertise solana:signMessage`);
      }
      const [output] = await signMessage.signMessage({
        account: core.resolveAccount(account),
        message: msg,
      });
      if (output === undefined) {
        throw new Error("signMessage returned no outputs");
      }
      return { signature: output.signature, signedMessage: output.signedMessage };
    },

    ...(signTx === undefined
      ? {}
      : {
          async signTransaction(tx, account) {
            const wsAccount = core.resolveAccount(account);
            if (!(tx instanceof Uint8Array)) {
              throw new TypeError(
                "SVM signTransaction expects a serialized transaction (Uint8Array)",
              );
            }
            const [output] = await signTx.signTransaction({
              account: wsAccount,
              chain: core.currentChainId(),
              transaction: tx,
            });
            if (output === undefined) {
              throw new Error("signTransaction returned no outputs");
            }
            return output.signedTransaction;
          },
        }),

    ...(signIn === undefined
      ? {}
      : {
          async signIn(input) {
            const [output] = await signIn.signIn(input);
            if (output === undefined) {
              throw new Error("signIn returned no outputs");
            }
            return {
              account: buildAccount(output.account.address, core.toChain()),
              signature: output.signature,
              signedMessage: output.signedMessage,
            };
          },
        }),
  };
};

/**
 * Subscribe to Solana Wallet Standard announcements.
 * Spec: https://github.com/wallet-standard/wallet-standard
 *
 * Runtime requires the `@wallet-standard/app` package, which is an
 * **optional peer dependency** of butr. EVM-only consumers don't need
 * to install it; discovery will silently skip the SVM side if the
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

export { buildSvmAdapter, discoverSvmAdapters };
