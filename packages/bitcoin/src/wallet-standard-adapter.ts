import type { Account, ChainBase, ConnectorEvent, WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";
import {
  buildAccount,
  getFeature,
  pickAccountByAddress,
  pickFirstAddress,
  slugify as kitSlugify,
} from "@usebutr/wallet-standard-shared";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";

import { resolveBitcoinCapabilities } from "./capabilities";
import type {
  BitcoinSendTransferFeature,
  BitcoinSignMessageFeature,
  BitcoinSignPsbtFeature,
} from "./wallet-standard-types";

const BITCOIN_PREFIX = "bip122:";
const BITCOIN_DECIMALS = 8;
const BITCOIN_MAINNET_ID = "bip122:000000000019d6689c085ae165831e93";

const slugify = (name: string): string => kitSlugify("btc", name);

const pickBitcoinChain = (wallet: WalletStandardWallet): string | null => {
  const mainnet = wallet.chains.find((c) => c === BITCOIN_MAINNET_ID);
  if (mainnet) {
    return mainnet;
  }
  return wallet.chains.find((c) => c.startsWith(BITCOIN_PREFIX)) ?? null;
};

const buildBitcoinChain = (chainId: string, walletName: string): ChainBase => ({
  id: chainId,
  // Same posture as EVM/SVM/Sui: butr ships no chain-id → name table.
  name: walletName,
  namespace: "bip122",
  reference: chainId.slice(BITCOIN_PREFIX.length),
});

const buildBitcoinAccount = (address: string, chain: ChainBase): Account =>
  buildAccount(address, chain);

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
 *    via butr's `unknown` tx parameter — the simplest mental model that
 *    maps onto `bitcoin:sendTransfer`. PSBT-shaped flows go through
 *    `signTransaction`.
 *  - `signTransaction` expects a `Uint8Array` PSBT (raw bytes) — the
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
  const bitcoinChainId = pickBitcoinChain(wallet);
  if (!bitcoinChainId) {
    return null;
  }
  const connect = getFeature<StandardConnectFeature>(wallet, "standard:connect");
  if (!connect) {
    return null;
  }

  const disconnect = getFeature<StandardDisconnectFeature>(wallet, "standard:disconnect");
  const events = getFeature<StandardEventsFeature>(wallet, "standard:events");
  const signMessage = getFeature<BitcoinSignMessageFeature>(wallet, "bitcoin:signMessage");
  const signPsbt = getFeature<BitcoinSignPsbtFeature>(wallet, "bitcoin:signPsbt");
  const sendTransfer = getFeature<BitcoinSendTransferFeature>(wallet, "bitcoin:sendTransfer");

  let currentChainId = bitcoinChainId;
  const currentChain = (): ChainBase => buildBitcoinChain(currentChainId, wallet.name);

  const listeners = new Set<(event: ConnectorEvent) => void>();
  const notifyAccountChanged = () => {
    if (wallet.accounts.length === 0) {
      return;
    }
    const chain = currentChain();
    const built = wallet.accounts.map((a) => buildBitcoinAccount(a.address, chain));
    const first = built[0];
    if (!first) {
      return;
    }
    for (const listener of listeners) {
      listener({ account: first, accounts: built, type: "accountChanged" });
    }
  };

  registerDisconnector?.(() => {
    for (const listener of listeners) {
      listener({ type: "disconnected" });
    }
  });

  return {
    capabilities: resolveBitcoinCapabilities({
      chainCount: wallet.chains.filter((c) => c.startsWith(BITCOIN_PREFIX)).length,
      features: {
        events: Boolean(events),
        sendTransfer: Boolean(sendTransfer),
        signMessage: Boolean(signMessage),
        signPsbt: Boolean(signPsbt),
      },
    }),
    chainPlatform: "bitcoin",

    async connect(opts) {
      await connect.connect(opts?.silent ? { silent: true } : undefined);
    },

    async disconnect() {
      if (disconnect) {
        try {
          await disconnect.disconnect();
        } catch (error) {
          logWarn("[butr] Bitcoin Wallet Standard disconnect threw:", error);
        }
      }
    },

    getAccount() {
      const address = pickFirstAddress(wallet.accounts);
      if (!address) {
        return Promise.resolve(null);
      }
      return Promise.resolve(buildBitcoinAccount(address, currentChain()));
    },

    getAccounts() {
      const chain = currentChain();
      return Promise.resolve(wallet.accounts.map((a) => buildBitcoinAccount(a.address, chain)));
    },

    getBalance() {
      return Promise.resolve({
        decimals: BITCOIN_DECIMALS,
        formatted: "0",
        symbol: "BTC",
        value: 0n,
      });
    },

    getSigner() {
      // Consumers cast to whatever Bitcoin signing wrapper they use
      // (bitcoinjs-lib's Signer, scure-btc-signer's HDWallet, etc.) or
      // call butr's adapter directly for PSBT / send-transfer.
      return Promise.resolve(wallet);
    },

    getTransactionReceipt() {
      return Promise.resolve({ status: "Pending" as const });
    },

    icon: wallet.icon,
    id: slugify(wallet.name),
    name: wallet.name,

    async requestAccounts() {
      await connect.connect();
    },

    async sendTx(tx, account) {
      if (!sendTransfer) {
        throw new Error(`Wallet ${wallet.name} does not advertise bitcoin:sendTransfer`);
      }
      if (
        !tx ||
        typeof tx !== "object" ||
        typeof (tx as { amount?: unknown }).amount !== "bigint" ||
        typeof (tx as { recipient?: unknown }).recipient !== "string"
      ) {
        throw new TypeError(
          "Bitcoin sendTx expects { amount: bigint, recipient: string } — pass the recipient address and an amount in satoshis",
        );
      }
      const { amount, recipient } = tx as { amount: bigint; recipient: string };
      const wsAccount = account
        ? pickAccountByAddress(wallet.accounts, account.walletAddress)
        : (wallet.accounts[0] ?? null);
      if (!wsAccount) {
        throw new Error("No connected account");
      }
      const output = await sendTransfer.sendTransfer({
        account: wsAccount,
        amount,
        chain: currentChainId,
        recipient,
      });
      return output.txid;
    },

    sendTxToChain(tx, _targetChainId, account, cb) {
      cb?.();
      return this.sendTx(tx, account);
    },

    async signMessage(msg, account) {
      if (!signMessage) {
        throw new Error(`Wallet ${wallet.name} does not advertise bitcoin:signMessage`);
      }
      const wsAccount = account
        ? pickAccountByAddress(wallet.accounts, account.walletAddress)
        : (wallet.accounts[0] ?? null);
      if (!wsAccount) {
        throw new Error("No connected account");
      }
      const output = await signMessage.signMessage({ account: wsAccount, message: msg });
      return { signature: output.signature, signedMessage: output.signedMessage };
    },

    ...(signPsbt
      ? {
          async signTransaction(tx, account) {
            const wsAccount = account
              ? pickAccountByAddress(wallet.accounts, account.walletAddress)
              : (wallet.accounts[0] ?? null);
            if (!wsAccount) {
              throw new Error("No connected account");
            }
            if (!(tx instanceof Uint8Array)) {
              throw new TypeError(
                "Bitcoin signTransaction expects a PSBT as Uint8Array (e.g. psbt.toBuffer())",
              );
            }
            const output = await signPsbt.signPsbt({
              account: wsAccount,
              chain: currentChainId,
              psbt: tx,
            });
            return output.signedPsbt;
          },
        }
      : {}),

    subscribe(listener) {
      listeners.add(listener);
      let unsubWallet: (() => void) | null = null;
      if (events) {
        const unsub = events.on("change", (changes) => {
          if (changes.chains) {
            const next =
              changes.chains.find((c) => c === BITCOIN_MAINNET_ID) ??
              changes.chains.find((c) => c.startsWith(BITCOIN_PREFIX));
            if (next) {
              currentChainId = next;
            }
          }

          if (changes.accounts) {
            if (changes.accounts.length === 0) {
              listener({ type: "disconnected" });
              return;
            }
            const chain = currentChain();
            const built = changes.accounts.map((a) => buildBitcoinAccount(a.address, chain));
            const first = built[0];
            if (!first) {
              return;
            }
            listener({ account: first, accounts: built, type: "accountChanged" });
            return;
          }

          if (changes.chains) {
            notifyAccountChanged();
          }
        });
        unsubWallet = () => unsub();
      }
      return () => {
        listeners.delete(listener);
        unsubWallet?.();
      };
    },

    switchChain(chain) {
      if (chain.namespace !== "bip122") {
        throw new Error(
          `Bitcoin adapter received non-Bitcoin chain "${chain.id}". Pass a chain with namespace "bip122".`,
        );
      }
      if (!wallet.chains.includes(chain.id)) {
        throw new Error(
          `Wallet ${wallet.name} does not advertise chain "${chain.id}". Available: ${wallet.chains.join(", ")}`,
        );
      }
      currentChainId = chain.id;
      notifyAccountChanged();
      return Promise.resolve();
    },
  };
};

export { buildBitcoinAdapter, slugify };
