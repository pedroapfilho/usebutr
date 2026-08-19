import type { TransactionInput, WalletAdapter } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type { WalletStandardFeature, WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import { resolveBitcoinCapabilities } from "./capabilities";
import type {
  BitcoinSendTransferFeature,
  BitcoinSignMessageFeature,
  BitcoinSignPsbtFeature,
} from "./wallet-standard-types";

const BITCOIN_PREFIX = "bip122:";
const BITCOIN_DECIMALS = 8;
const BITCOIN_MAINNET_ID = "bip122:000000000019d6689c085ae165831e93";

const isBitcoinSignMessageFeature = (
  feature: WalletStandardFeature,
): feature is WalletStandardFeature & BitcoinSignMessageFeature =>
  "signMessage" in feature && typeof feature.signMessage === "function";

const isBitcoinSignPsbtFeature = (
  feature: WalletStandardFeature,
): feature is WalletStandardFeature & BitcoinSignPsbtFeature =>
  "signPsbt" in feature && typeof feature.signPsbt === "function";

const isBitcoinSendTransferFeature = (
  feature: WalletStandardFeature,
): feature is WalletStandardFeature & BitcoinSendTransferFeature =>
  "sendTransfer" in feature && typeof feature.sendTransfer === "function";

/**
 * `sendTx` takes `{ amount, recipient }` for `bitcoin:sendTransfer` and
 * `signTransaction` takes raw PSBT bytes for `bitcoin:signPsbt`. Balance
 * and receipt reads would need an Esplora/Electrum client butr doesn't ship.
 */
const buildBitcoinAdapter = (
  wallet: WalletStandardWallet,
  /** Optional. Called with a function that pushes a synthetic
   *  `disconnected` event to all current subscribers. The discovery
   *  layer invokes it on Wallet Standard `unregister`. */
  registerDisconnector?: (emit: () => void) => void,
): WalletAdapter | null => {
  const core = createWalletStandardCore({
    chainPrefix: BITCOIN_PREFIX,
    id: slugify("btc", wallet.name),
    label: "Bitcoin",
    namespace: "bip122",
    platform: "Bitcoin",
    preferredChainIds: [BITCOIN_MAINNET_ID],
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });
  if (core === null) {
    return null;
  }

  const signMessage = getFeature(wallet, "bitcoin:signMessage", isBitcoinSignMessageFeature);
  const signPsbt = getFeature(wallet, "bitcoin:signPsbt", isBitcoinSignPsbtFeature);
  const sendTransfer = getFeature(wallet, "bitcoin:sendTransfer", isBitcoinSendTransferFeature);

  /** Resolve a caller-supplied target into a chain the wallet advertises,
   *  accepting either a full CAIP-2 id or a bare genesis-hash reference. */
  const resolveTargetChain = (targetChainId: string): string => {
    const candidate = targetChainId.startsWith(BITCOIN_PREFIX)
      ? targetChainId
      : `${BITCOIN_PREFIX}${targetChainId}`;
    if (!wallet.chains.includes(candidate)) {
      throw new Error(
        `Wallet ${wallet.name} does not advertise chain "${candidate}". Available: ${wallet.chains.join(", ")}`,
      );
    }
    return candidate;
  };

  const sendTransferTx = async (
    tx: TransactionInput,
    account?: { walletAddress: string },
    chain?: string,
  ): Promise<string> => {
    if (sendTransfer === undefined) {
      throw new Error(`Wallet ${wallet.name} does not advertise bitcoin:sendTransfer`);
    }
    if (
      typeof tx !== "object" ||
      tx === null ||
      !("amount" in tx) ||
      typeof tx.amount !== "bigint" ||
      !("recipient" in tx) ||
      typeof tx.recipient !== "string"
    ) {
      throw new TypeError(
        "Bitcoin sendTx expects { amount: bigint, recipient: string }: pass the recipient address and an amount in satoshis",
      );
    }
    const { amount, recipient } = tx;
    const output = await sendTransfer.sendTransfer({
      account: core.resolveAccount(account),
      amount,
      chain: chain ?? core.currentChainId(),
      recipient,
    });
    return output.txid;
  };

  const adapter: WalletAdapter = {
    ...core,
    capabilities: resolveBitcoinCapabilities({
      chainCount: core.chainCount,
      features: {
        events: core.hasEvents,
        sendTransfer: Boolean(sendTransfer),
        signMessage: Boolean(signMessage),
        signPsbt: Boolean(signPsbt),
      },
    }),
    chainPlatform: "bitcoin",

    getBalance: () =>
      Promise.resolve({
        decimals: BITCOIN_DECIMALS,
        formatted: "0",
        symbol: "BTC",
        value: 0n,
      }),

    getTransactionReceipt: () => Promise.resolve({ status: "Pending" as const }),

    async requestAccounts() {
      await core.connect();
    },

    sendTx: (tx, account) => sendTransferTx(tx, account),

    // Async so an unadvertised chain surfaces as a rejection rather than a
    // synchronous throw; the declared return type is a promise either way.
    async sendTxToChain(tx, targetChainId, account, cb) {
      const target = resolveTargetChain(targetChainId);
      if (target !== core.currentChainId()) {
        cb?.();
      }
      const txid = await sendTransferTx(tx, account, target);
      return txid;
    },

    async signMessage(msg, account) {
      if (signMessage === undefined) {
        throw new Error(`Wallet ${wallet.name} does not advertise bitcoin:signMessage`);
      }
      const output = await signMessage.signMessage({
        account: core.resolveAccount(account),
        message: msg,
      });
      return { signature: output.signature, signedMessage: output.signedMessage };
    },
  };

  if (signPsbt !== undefined) {
    adapter.signTransaction = async (tx, account) => {
      const wsAccount = core.resolveAccount(account);
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "Bitcoin signTransaction expects a PSBT as Uint8Array (e.g. psbt.toBuffer())",
        );
      }
      const output = await signPsbt.signPsbt({
        account: wsAccount,
        chain: core.currentChainId(),
        psbt: tx,
      });
      return output.signedPsbt;
    };
  }

  return adapter;
};

/** Requires the optional `@wallet-standard/app` peer dep. */
const discoverBitcoinAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildBitcoinAdapter(wallet, registerDisconnector),
  );

export { buildBitcoinAdapter, discoverBitcoinAdapters };
