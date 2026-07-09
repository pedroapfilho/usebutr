import type { ChainBase, WalletAdapter, WalletCapabilities } from "@usebutr/core";
import { base64ToBytes, bytesToBase64 } from "@usebutr/core";
import { buildAccount } from "@usebutr/wallet-standard-shared";

import { BITCOIN_CHAINS } from "../chains";

import { GENERIC_BITCOIN_ICON } from "./icon";

/** sats-connect (Xverse) shape — a JSON-RPC-ish `request(method, params)`. */
type SatsConnectProvider = {
  request: (
    method: string,
    params?: Record<string, unknown>,
  ) => Promise<{ error?: { message: string }; result?: unknown }>;
};

const CAPS_SATS_CONNECT: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: true,
  sendTransaction: true,
  signIn: false,
  signMessage: true,
  signTransaction: true,
  subscribe: false,
  switchAccount: false,
  switchChain: false,
};

/**
 * Wrap an Xverse-style `BitcoinProvider` (sats-connect) into a butr
 * `WalletAdapter`. sats-connect routes everything through a single
 * `request(method, params)` RPC; we shim each butr capability onto the
 * corresponding sats-connect method.
 *
 * Tested against Xverse's `getAccounts`, `signMessage`, `signPsbt`,
 * `sendTransfer` methods.
 */
const buildSatsConnectAdapter = (
  id: string,
  name: string,
  provider: SatsConnectProvider,
): WalletAdapter => {
  let chain: ChainBase = BITCOIN_CHAINS.mainnet;
  let cachedAccounts: ReadonlyArray<string> = [];

  const callRequest = async <T>(method: string, params?: Record<string, unknown>): Promise<T> => {
    const response = await provider.request(method, params);
    if (response.error) {
      throw new Error(`[butr/bitcoin] sats-connect ${method} failed: ${response.error.message}`);
    }
    return response.result as T;
  };

  const loadAccounts = async (): Promise<ReadonlyArray<string>> => {
    const result = await callRequest<{
      addresses?: ReadonlyArray<{ address: string; purpose?: string }>;
    }>("getAccounts", {
      message: "Connect to butr",
      purposes: ["payment", "ordinals"],
    });
    if (!result?.addresses) {
      return [];
    }
    const addresses = result.addresses.map((a) => a.address);
    cachedAccounts = addresses;
    return addresses;
  };

  return {
    capabilities: CAPS_SATS_CONNECT,
    chainPlatform: "bitcoin",

    async connect() {
      await loadAccounts();
    },

    disconnect() {
      cachedAccounts = [];
      return Promise.resolve();
    },

    async getAccount() {
      const first = cachedAccounts[0];
      if (first) {
        return buildAccount(first, chain);
      }
      const accounts = await loadAccounts();
      const firstFresh = accounts[0];
      return firstFresh ? buildAccount(firstFresh, chain) : null;
    },

    async getAccounts() {
      const accounts = cachedAccounts.length > 0 ? cachedAccounts : await loadAccounts();
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
      await loadAccounts();
    },

    async sendTx(tx) {
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
      const result = await callRequest<{ txid: string }>("sendTransfer", {
        recipients: [{ address: recipient, amount: amount.toString() }],
      });
      return result.txid;
    },

    sendTxToChain(tx, _targetChainId, _account, cb) {
      cb?.();
      return this.sendTx(tx);
    },

    async signMessage(msg) {
      const address = cachedAccounts[0];
      if (!address) {
        throw new Error("No connected account");
      }
      const result = await callRequest<{ messageHash?: string; signature: string }>("signMessage", {
        address,
        message: new TextDecoder().decode(msg),
      });
      return { signature: base64ToBytes(result.signature), signedMessage: msg };
    },

    async signTransaction(tx) {
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "Bitcoin signTransaction expects a PSBT as Uint8Array (e.g. psbt.toBuffer())",
        );
      }
      // sats-connect's signPsbt takes a base64 PSBT; encode our bytes
      const result = await callRequest<{ psbt: string }>("signPsbt", {
        psbt: bytesToBase64(tx),
      });
      return base64ToBytes(result.psbt);
    },

    switchChain(target) {
      if (target.namespace !== "bip122") {
        throw new Error(
          `Bitcoin adapter received non-Bitcoin chain "${target.id}". Pass a chain with namespace "bip122".`,
        );
      }
      chain = target;
      return Promise.resolve();
    },
  };
};

export type { SatsConnectProvider };
export { buildSatsConnectAdapter };
