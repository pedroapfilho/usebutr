import type { WalletAdapter } from "@usebutr/core";
import { base64ToBytes } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import { resolveSuiCapabilities } from "./capabilities";
import type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignPersonalMessageFeature,
  SuiSignTransactionFeature,
} from "./wallet-standard-types";

const SUI_PREFIX = "sui:";
const SUI_DECIMALS = 9;
const SUI_MAINNET = "sui:mainnet";

/** Coerce butr's `unknown` tx into the shape `sui:signAndExecuteTransaction`
 *  expects (an object with `toJSON()` returning a Promise<string>). When
 *  consumers pass a base64 string directly, we wrap it in a stub object so
 *  the feature contract stays satisfied without us depending on
 *  `@mysten/sui`. */
const coerceSuiTransaction = (tx: unknown): { toJSON: () => Promise<string> } | string => {
  if (typeof tx === "string") {
    return tx;
  }
  if (typeof tx === "object" && tx !== null && "toJSON" in tx && typeof tx.toJSON === "function") {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- validated toJSON() above; @mysten/sui Transaction is otherwise untyped here
    return tx as { toJSON: () => Promise<string> };
  }
  throw new TypeError(
    "Sui sendTx/signTransaction expects a @mysten/sui Transaction (with toJSON()) or a base64-encoded string",
  );
};

/**
 * Adapt a Sui Wallet Standard `Wallet` into a butr `WalletAdapter`.
 *
 * Returns `null` if the wallet doesn't advertise any Sui chain or doesn't
 * expose `standard:connect`. Same posture as `buildSvmAdapter`: gate
 * features on what each wallet advertises, return placeholders for
 * RPC-backed reads (`getBalance`, `getTransactionReceipt`), forward
 * `subscribe` through `standard:events`.
 *
 * **Known limitations**
 *
 *  - `getBalance` returns a `{ value: 0n, symbol: "SUI" }` placeholder.
 *    Consumers wrap `@mysten/sui`'s `SuiClient` for real reads.
 *  - `getTransactionReceipt` returns `"Pending"` for the same reason.
 *  - `switchChain` is local-state-only (mirrors SVM). Sui Wallet Standard
 *    has no "tell the wallet to switch network" RPC; the wallet's UI
 *    controls its global cluster setting.
 */
const buildSuiAdapter = (
  wallet: WalletStandardWallet,
  /** Optional. Called with a function that pushes a synthetic
   *  `disconnected` event to all current subscribers. The discovery
   *  layer invokes it on Wallet Standard `unregister`. */
  registerDisconnector?: (emit: () => void) => void,
): WalletAdapter | null => {
  const core = createWalletStandardCore({
    chainPrefix: SUI_PREFIX,
    id: slugify("sui", wallet.name),
    label: "Sui",
    namespace: "sui",
    platform: "Sui",
    preferredChainIds: [SUI_MAINNET],
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });
  if (core === null) {
    return null;
  }

  const signMessage = getFeature<SuiSignPersonalMessageFeature>(wallet, "sui:signPersonalMessage");
  const signAndExecute = getFeature<SuiSignAndExecuteTransactionFeature>(
    wallet,
    "sui:signAndExecuteTransaction",
  );
  const signTx = getFeature<SuiSignTransactionFeature>(wallet, "sui:signTransaction");

  const executeTx = async (tx: unknown, account?: { walletAddress: string }): Promise<string> => {
    if (signAndExecute === undefined) {
      throw new Error(`Wallet ${wallet.name} does not advertise sui:signAndExecuteTransaction`);
    }
    const wsAccount = core.resolveAccount(account);
    const transaction = coerceSuiTransaction(tx);
    const output = await signAndExecute.signAndExecuteTransaction({
      account: wsAccount,
      chain: core.currentChainId(),
      transaction,
    });
    return output.digest;
  };

  return {
    ...core,
    capabilities: resolveSuiCapabilities({
      chainCount: core.chainCount,
      features: {
        events: core.hasEvents,
        signAndExecuteTransaction: Boolean(signAndExecute),
        signMessage: Boolean(signMessage),
        signTransaction: Boolean(signTx),
      },
    }),
    chainPlatform: "sui",

    getBalance: () =>
      Promise.resolve({
        decimals: SUI_DECIMALS,
        formatted: "0",
        symbol: "SUI",
        value: 0n,
      }),

    getTransactionReceipt: () => Promise.resolve({ status: "Pending" as const }),

    async requestAccounts() {
      await core.connect();
    },

    sendTx: (tx, account) => executeTx(tx, account),

    sendTxToChain: (tx, _targetChainId, account, cb) => {
      cb?.();
      return executeTx(tx, account);
    },

    async signMessage(msg, account) {
      if (signMessage === undefined) {
        throw new Error(`Wallet ${wallet.name} does not advertise sui:signPersonalMessage`);
      }
      const output = await signMessage.signPersonalMessage({
        account: core.resolveAccount(account),
        message: msg,
      });
      return {
        signature: base64ToBytes(output.signature),
        signedMessage: base64ToBytes(output.bytes),
      };
    },

    ...(signTx === undefined
      ? {}
      : {
          async signTransaction(tx, account) {
            const wsAccount = core.resolveAccount(account);
            const transaction = coerceSuiTransaction(tx);
            const output = await signTx.signTransaction({
              account: wsAccount,
              chain: core.currentChainId(),
              transaction,
            });
            return base64ToBytes(output.bytes);
          },
        }),
  };
};

/**
 * Subscribe to Sui Wallet Standard announcements.
 * Spec: https://docs.sui.io/standards/wallet-standard
 *
 * Runtime requires the `@wallet-standard/app` package, which is an
 * **optional peer dependency** of butr.
 *
 * Sui wallets share the same `getWallets()` bus as SVM wallets; Phantom
 * advertises features for SVM, Sui, and Bitcoin from a single Wallet
 * Standard wallet object. `buildSuiAdapter` returns `null` for wallets
 * that don't advertise any `sui:*` features, so we cleanly end up with
 * one adapter per platform on multi-chain wallets.
 *
 * The discovery loop (dynamic import, dedupe, register / unregister
 * bridge) lives in `@usebutr/wallet-standard-shared`.
 */
const discoverSuiAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildSuiAdapter(wallet, registerDisconnector),
  );

export { buildSuiAdapter, discoverSuiAdapters };
