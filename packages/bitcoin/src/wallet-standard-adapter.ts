import type { WalletAdapter } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import { resolveBitcoinCapabilities } from "./capabilities";
import type {
  BitcoinSendTransferFeature,
  BitcoinSignMessageFeature,
  BitcoinSignPsbtFeature,
} from "./wallet-standard-types";

const BITCOIN_PREFIX = "bip122:";
const BITCOIN_DECIMALS = 8;
const BITCOIN_MAINNET_ID = "bip122:000000000019d6689c085ae165831e93";

/**
 * Adapt a Bitcoin Wallet Standard `Wallet` into a butr `WalletAdapter`.
 *
 * Returns `null` if the wallet doesn't advertise any `bip122:` chain or
 * doesn't expose `standard:connect`. Same posture as the SVM/Sui
 * adapters: gate features on what each wallet advertises, return
 * placeholders for RPC reads, forward `subscribe` through
 * `standard:events`.
 *
 * **Known limitations**
 *
 *  - `getBalance` returns `{ value: 0n, symbol: "BTC" }`. Bitcoin
 *    balance lookups require an Esplora/Electrum/RPC client outside
 *    butr's scope.
 *  - `getTransactionReceipt` returns `"Pending"` for the same reason.
 *  - `sendTx` expects the consumer to pass `{ amount: bigint, recipient: string }`
 *    via butr's `unknown` tx parameter; the simplest mental model that
 *    maps onto `bitcoin:sendTransfer`. PSBT-shaped flows go through
 *    `signTransaction`.
 *  - `signTransaction` expects a `Uint8Array` PSBT (raw bytes); the
 *    same shape `bitcoin:signPsbt` accepts. Consumers building with
 *    `bitcoinjs-lib` get bytes via `psbt.toBuffer()`.
 *  - `switchChain` is local-state-only; the capability flag is `false`
 *    when only one chain is advertised. Wallets that ship a real switch
 *    primitive (none today, portably) would need their own adapter.
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

  const signMessage = getFeature<BitcoinSignMessageFeature>(wallet, "bitcoin:signMessage");
  const signPsbt = getFeature<BitcoinSignPsbtFeature>(wallet, "bitcoin:signPsbt");
  const sendTransfer = getFeature<BitcoinSendTransferFeature>(wallet, "bitcoin:sendTransfer");

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
    tx: unknown,
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

  return {
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

    ...(signPsbt === undefined
      ? {}
      : {
          async signTransaction(tx, account) {
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
          },
        }),
  };
};

/**
 * Subscribe to Bitcoin Wallet Standard announcements.
 *
 * Phantom (Bitcoin), Magic Eden, OKX Wallet (Bitcoin), and Leather
 * advertise `bitcoin:*` features over the same `getWallets()` bus that
 * SVM and Sui consume. `buildBitcoinAdapter` returns `null` for wallets
 * that don't advertise any `bip122:` chain, so multi-chain wallets
 * (Phantom: EVM + SVM + Sui + Bitcoin) produce one adapter per platform.
 *
 * Requires the **optional peer dependency** `@wallet-standard/app`.
 *
 * The discovery loop (dynamic import, dedupe, register / unregister
 * bridge) lives in `@usebutr/wallet-standard-shared`.
 */
const discoverBitcoinAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildBitcoinAdapter(wallet, registerDisconnector),
  );

export { buildBitcoinAdapter, discoverBitcoinAdapters };
