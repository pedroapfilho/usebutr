import type { ChainBase, ConnectorEvent, WalletAdapter, WalletCapabilities } from "@usebutr/core";
import { base64ToBytes, bytesToHex, hexToBytes } from "@usebutr/core";
import { buildAccount } from "@usebutr/wallet-standard-shared";

import { BITCOIN_CHAINS } from "../chains";

import { GENERIC_BITCOIN_ICON } from "./icon";

/** UniSat-style provider: a single object on `window.unisat` with the
 *  same four methods every UniSat-derivative wallet exposes (UniSat
 *  itself, OKX Wallet's Bitcoin path at `window.okxwallet.bitcoin`). */
type UnisatProvider = {
  getAccounts: () => Promise<ReadonlyArray<string>>;
  getNetwork?: () => Promise<"livenet" | "mainnet" | "testnet" | "signet">;
  on?: (
    event: "accountsChanged" | "networkChanged",
    listener: (...args: Array<unknown>) => void,
  ) => void;
  pushPsbt?: (psbtHex: string) => Promise<string>;
  removeListener?: (
    event: "accountsChanged" | "networkChanged",
    listener: (...args: Array<unknown>) => void,
  ) => void;
  requestAccounts: () => Promise<ReadonlyArray<string>>;
  sendBitcoin?: (recipient: string, amount: number) => Promise<string>;
  signMessage: (message: string, type?: "ecdsa" | "bip322-simple") => Promise<string>;
  signPsbt: (psbtHex: string, options?: Record<string, unknown>) => Promise<string>;
};

const CAPS_UNISAT: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: true,
  sendTransaction: true,
  signIn: false,
  signMessage: true,
  signTransaction: true,
  subscribe: true,
  switchAccount: false,
  switchChain: false,
};

/**
 * Wrap a UniSat-style provider (`window.unisat`, `window.okxwallet.bitcoin`,
 * `window.btc`) into a butr `WalletAdapter`.
 *
 * The UniSat shape is consistent enough that one adapter handles every
 * derivative. Differences (network names, `sendBitcoin` presence) are
 * gated by feature detection per call.
 */
const buildUnisatAdapter = (id: string, name: string, provider: UnisatProvider): WalletAdapter => {
  let chain: ChainBase = BITCOIN_CHAINS.mainnet;
  const listenersSet = new Set<(event: ConnectorEvent) => void>();

  const refreshChain = async () => {
    if (typeof provider.getNetwork !== "function") {
      return;
    }
    try {
      const network = await provider.getNetwork();
      if (network === "testnet") {
        chain = BITCOIN_CHAINS.testnet;
      } else if (network === "signet") {
        chain = BITCOIN_CHAINS.signet;
      } else {
        chain = BITCOIN_CHAINS.mainnet;
      }
    } catch {
      // Network probe failed — keep the current chain. The next call
      // will retry through whichever path next invokes refreshChain.
    }
  };

  return {
    capabilities: CAPS_UNISAT,
    chainPlatform: "bitcoin",

    async connect(opts) {
      if (opts?.silent) {
        const accounts = await provider.getAccounts();
        if (accounts.length === 0) {
          throw new Error("No authorized accounts for silent reconnect");
        }
        await refreshChain();
        return;
      }
      await provider.requestAccounts();
      await refreshChain();
    },

    disconnect() {
      // No portable disconnect across UniSat-shaped wallets. butr's
      // reducer marks the wallet disconnected on its side regardless.
      return Promise.resolve();
    },

    async getAccount() {
      const accounts = await provider.getAccounts();
      const first = accounts[0];
      if (!first) {
        return null;
      }
      await refreshChain();
      return buildAccount(first, chain);
    },

    async getAccounts() {
      const accounts = await provider.getAccounts();
      if (accounts.length === 0) {
        return [];
      }
      await refreshChain();
      return accounts.map((a) => buildAccount(a, chain));
    },

    getBalance() {
      return Promise.resolve({
        decimals: 8,
        formatted: "0",
        symbol: "BTC",
        value: 0n,
      });
    },

    getSigner() {
      return Promise.resolve(provider);
    },

    getTransactionReceipt() {
      return Promise.resolve({ status: "Pending" as const });
    },

    icon: GENERIC_BITCOIN_ICON,
    id,
    name,

    async requestAccounts() {
      await provider.requestAccounts();
      await refreshChain();
    },

    sendTx(tx) {
      if (typeof provider.sendBitcoin !== "function") {
        throw new TypeError(`Wallet ${name} does not expose sendBitcoin`);
      }
      if (
        !tx ||
        typeof tx !== "object" ||
        typeof (tx as { recipient?: unknown }).recipient !== "string" ||
        typeof (tx as { amount?: unknown }).amount !== "bigint"
      ) {
        throw new TypeError(
          "Bitcoin sendTx expects { amount: bigint, recipient: string } — amount in satoshis",
        );
      }
      const { amount, recipient } = tx as { amount: bigint; recipient: string };
      // UniSat's sendBitcoin takes a JS number for satoshis. Values
      // above 2^53 aren't representable; that's 90+ million BTC, which
      // would never appear in practice.
      const sats = Number(amount);
      return provider.sendBitcoin(recipient, sats);
    },

    sendTxToChain(tx, _targetChainIdDecimal, _account, cb) {
      cb?.();
      return this.sendTx(tx);
    },

    async signMessage(msg) {
      // UniSat takes a UTF-8 message and returns a base64 signature.
      // We return the raw signature bytes (decoded from base64) and the
      // bytes the wallet signed (pass-through of the input). UniSat
      // doesn't expose a "pre-image" so the input itself is the signed
      // message from butr's perspective.
      const text = new TextDecoder().decode(msg);
      const signatureB64 = await provider.signMessage(text);
      return { signature: base64ToBytes(signatureB64), signedMessage: msg };
    },

    async signTransaction(tx) {
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "Bitcoin signTransaction expects a PSBT as Uint8Array (e.g. psbt.toBuffer())",
        );
      }
      const signedHex = await provider.signPsbt(bytesToHex(tx));
      return hexToBytes(signedHex);
    },

    subscribe(listener) {
      listenersSet.add(listener);
      const onAccountsChanged = (...args: ReadonlyArray<unknown>) => {
        const accounts = (args[0] as ReadonlyArray<string> | undefined) ?? [];
        if (accounts.length === 0) {
          listener({ type: "disconnected" });
          return;
        }
        const built = accounts.map((a) => buildAccount(a, chain));
        const first = built[0];
        if (!first) {
          return;
        }
        listener({ account: first, accounts: built, type: "accountChanged" });
      };
      const onNetworkChanged = () => {
        void refreshChain();
      };
      provider.on?.("accountsChanged", onAccountsChanged);
      provider.on?.("networkChanged", onNetworkChanged);
      return () => {
        provider.removeListener?.("accountsChanged", onAccountsChanged);
        provider.removeListener?.("networkChanged", onNetworkChanged);
        listenersSet.delete(listener);
      };
    },

    switchChain(target) {
      if (target.namespace !== "bip122") {
        throw new Error(
          `Bitcoin adapter received non-Bitcoin chain "${target.id}". Pass a chain with namespace "bip122".`,
        );
      }
      // UniSat-shaped wallets pick their network via the user's
      // extension UI; we update local state so consumers see it, but
      // the wallet itself doesn't switch.
      chain = target;
      void refreshChain();
      return Promise.resolve();
    },
  };
};

export type { UnisatProvider };
export { buildUnisatAdapter };
