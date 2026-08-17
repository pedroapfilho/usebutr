import type { ChainBase, WalletAdapter, WalletCapabilities } from "@usebutr/core";
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

const toStringArray = (value: unknown): Array<string> =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/**
 * The UniSat shape is consistent enough across `window.unisat`,
 * `window.okxwallet.bitcoin` and `window.btc` that one adapter covers all
 * three; the differences (network names, `sendBitcoin`) are probed per call.
 */
const buildUnisatAdapter = (id: string, name: string, provider: UnisatProvider): WalletAdapter => {
  let chain: ChainBase = BITCOIN_CHAINS.mainnet;

  const sendBitcoinTx = async (tx: unknown): Promise<string> => {
    if (typeof provider.sendBitcoin !== "function") {
      throw new TypeError(`Wallet ${name} does not expose sendBitcoin`);
    }
    if (
      typeof tx !== "object" ||
      tx === null ||
      !("recipient" in tx) ||
      typeof tx.recipient !== "string" ||
      !("amount" in tx) ||
      typeof tx.amount !== "bigint"
    ) {
      throw new TypeError(
        "Bitcoin sendTx expects { amount: bigint, recipient: string }: amount in satoshis",
      );
    }
    const { amount, recipient } = tx;
    const txid = await provider.sendBitcoin(recipient, Number(amount));
    return txid;
  };

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
      void 0;
    }
  };

  return {
    capabilities: CAPS_UNISAT,
    chainPlatform: "bitcoin",

    async connect(opts) {
      if (opts?.silent === true) {
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

    disconnect: () => Promise.resolve(),

    async getAccount() {
      const accounts = await provider.getAccounts();
      const first = accounts[0];
      if (first === undefined) {
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

    getBalance: () =>
      Promise.resolve({
        decimals: 8,
        formatted: "0",
        symbol: "BTC",
        value: 0n,
      }),

    getSigner: () => Promise.resolve(provider),

    getTransactionReceipt: () => Promise.resolve({ status: "Pending" as const }),

    icon: GENERIC_BITCOIN_ICON,
    id,
    name,

    async requestAccounts() {
      await provider.requestAccounts();
      await refreshChain();
    },

    sendTx: (tx) => sendBitcoinTx(tx),

    sendTxToChain: (tx, _targetChainIdDecimal, _account, cb) => {
      cb?.();
      return sendBitcoinTx(tx);
    },

    async signMessage(msg) {
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
      const onAccountsChanged = (...args: ReadonlyArray<unknown>) => {
        const accounts = toStringArray(args[0]);
        if (accounts.length === 0) {
          listener({ type: "disconnected" });
          return;
        }
        const built = accounts.map((a) => buildAccount(a, chain));
        const first = built[0];
        if (first === undefined) {
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
      };
    },

    // `capabilities.switchChain` is false: UniSat exposes no way to ask the
    // wallet to change network, so the wallet's own setting is authoritative
    // and every account read re-reads it. This validates the request and then
    // reports what the wallet actually says, rather than assigning the target
    // locally and having the next read silently contradict it.
    async switchChain(target) {
      if (target.namespace !== "bip122") {
        throw new Error(
          `Bitcoin adapter received non-Bitcoin chain "${target.id}". Pass a chain with namespace "bip122".`,
        );
      }
      chain = target;
      await refreshChain();
    },
  };
};

export type { UnisatProvider };
export { buildUnisatAdapter };
