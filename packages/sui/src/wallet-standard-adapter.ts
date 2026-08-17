import type { WalletAdapter } from "@usebutr/core";
import { base64ToBytes, bytesToBase64 } from "@usebutr/core";
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

/** Coerce butr's `unknown` tx into the shape the Sui Wallet Standard features
 *  expect: an object with `toJSON()` returning a Promise<string>. A raw string
 *  or BCS byte array is wrapped, because wallets accept only the `toJSON()`
 *  form and a bare string reaches them as a shape they cannot consume. */
const coerceSuiTransaction = (tx: unknown): { toJSON: () => Promise<string> } => {
  if (typeof tx === "string") {
    return { toJSON: () => Promise.resolve(tx) };
  }
  if (tx instanceof Uint8Array) {
    const encoded = bytesToBase64(tx);
    return { toJSON: () => Promise.resolve(encoded) };
  }
  if (typeof tx === "object" && tx !== null && "toJSON" in tx && typeof tx.toJSON === "function") {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- validated toJSON() above; @mysten/sui Transaction is otherwise untyped here
    return tx as { toJSON: () => Promise<string> };
  }
  throw new TypeError(
    "Sui sendTx/signTransaction expects a @mysten/sui Transaction (with toJSON()), a base64-encoded string, or BCS bytes",
  );
};

/**
 * Sui Wallet Standard has no "switch network" RPC, so `switchChain` moves
 * butr's view only and the wallet's own UI owns its cluster. Balance and
 * receipt reads need `@mysten/sui`'s `SuiClient`, which butr doesn't ship.
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

  /** Resolve a caller-supplied target into a chain the wallet advertises,
   *  accepting either a full CAIP-2 id (`sui:testnet`) or a bare reference. */
  const resolveTargetChain = (targetChainId: string): string => {
    const candidate = targetChainId.startsWith(SUI_PREFIX)
      ? targetChainId
      : `${SUI_PREFIX}${targetChainId}`;
    if (!wallet.chains.includes(candidate)) {
      throw new Error(
        `Wallet ${wallet.name} does not advertise chain "${candidate}". Available: ${wallet.chains.join(", ")}`,
      );
    }
    return candidate;
  };

  const executeTx = async (
    tx: unknown,
    account?: { walletAddress: string },
    chain?: string,
  ): Promise<string> => {
    if (signAndExecute === undefined) {
      throw new Error(`Wallet ${wallet.name} does not advertise sui:signAndExecuteTransaction`);
    }
    const wsAccount = core.resolveAccount(account);
    const transaction = coerceSuiTransaction(tx);
    const output = await signAndExecute.signAndExecuteTransaction({
      account: wsAccount,
      chain: chain ?? core.currentChainId(),
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

    // Async so an unadvertised chain surfaces as a rejection rather than a
    // synchronous throw; the declared return type is a promise either way.
    async sendTxToChain(tx, targetChainId, account, cb) {
      const target = resolveTargetChain(targetChainId);
      if (target !== core.currentChainId()) {
        cb?.();
      }
      const digest = await executeTx(tx, account, target);
      return digest;
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
            return {
              bytes: base64ToBytes(output.bytes),
              signature: base64ToBytes(output.signature),
            };
          },
        }),
  };
};

/**
 * Requires the optional `@wallet-standard/app` peer dep.
 * Spec: https://docs.sui.io/standards/wallet-standard
 */
const discoverSuiAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildSuiAdapter(wallet, registerDisconnector),
  );

export { buildSuiAdapter, discoverSuiAdapters };
