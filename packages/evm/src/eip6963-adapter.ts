import type {
  Account,
  ChainBase,
  TransactionInput,
  TransactionValue,
  WalletAdapter,
} from "@usebutr/core";
import { bytesToHexPrefixed as bytesToHex, hexToBytes, sanitizeIcon } from "@usebutr/core";

import { resolveEip6963Capabilities } from "./capabilities";
import type {
  Eip1193Listener,
  Eip1193Object,
  Eip1193Provider,
  Eip1193Value,
  Eip6963ProviderInfo,
} from "./eip1193";
import { requestString, requestStringArray } from "./eip1193";
import { readEvmBalance } from "./evm-balance";

const HEX_PREFIX = "0x";

const toStringArray = (value: Eip1193Value | undefined): Array<string> =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const toEip1193Value = (value: TransactionValue): Eip1193Value => {
  if (typeof value === "function") {
    throw new TypeError("EVM transactions cannot contain functions");
  }
  if (Array.isArray(value)) {
    return value.map(toEip1193Value);
  }
  if (value instanceof Uint8Array) {
    return value;
  }
  if (typeof value === "object" && value !== null) {
    const result: Eip1193Object = {};
    for (const [key, nested] of Object.entries(value)) {
      result[key] = nested === undefined ? undefined : toEip1193Value(nested);
    }
    return result;
  }
  return value;
};

const withFrom = (tx: TransactionInput, from?: string): Eip1193Value => {
  if (typeof tx === "string" || tx instanceof Uint8Array) {
    return tx;
  }
  const result: Eip1193Object = {};
  for (const [key, value] of Object.entries(tx)) {
    result[key] = value === undefined ? undefined : toEip1193Value(value);
  }
  if (from !== undefined) {
    result.from = from;
  }
  return result;
};

const chainIdHexToDecimal = (hex: string): string => BigInt(hex).toString(10);
const chainIdDecimalToHex = (dec: string): string => `${HEX_PREFIX}${BigInt(dec).toString(16)}`;

const buildEvmChain = (chainIdHex: string, walletName: string): ChainBase => {
  const reference = chainIdHexToDecimal(chainIdHex);
  return {
    id: `eip155:${reference}`,
    name: walletName,
    namespace: "eip155",
    reference,
  };
};

const buildEvmAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address.toLowerCase()}`,
  walletAddress: address,
});

type AccountStateOptions = {
  accounts?: Array<string>;
  chainIdHex?: string;
};

/** Rejections propagate: `getAccount`/`getAccounts` surface the wallet's
 *  own provider error, while the `subscribe` bridge swallows it because a
 *  later event retries synchronization. */
const readAccountState = async (
  provider: Eip1193Provider,
  walletName: string,
  options: AccountStateOptions = {},
) => {
  const accounts =
    options.accounts ?? (await requestStringArray(provider, { method: "eth_accounts" }));
  if (accounts.length === 0) {
    return null;
  }
  const chainIdHex =
    options.chainIdHex ?? (await requestString(provider, { method: "eth_chainId" }));
  if (chainIdHex === null) {
    throw new Error("Wallet returned a malformed eth_chainId response");
  }
  const chain = buildEvmChain(chainIdHex, walletName);
  const builtAccounts = accounts.map((address) => buildEvmAccount(address, chain));
  const account = builtAccounts[0];
  return account === undefined ? null : { account, accounts: builtAccounts };
};

/**
 * `disconnect` calls `wallet_revokePermissions`, which many wallets don't
 * implement and silently ignore, so their own auto-reconnect may outlive it.
 * `getBalance()` labels the native balance `"ETH"` on every EVM chain.
 */
const buildEvmAdapter = (info: Eip6963ProviderInfo, provider: Eip1193Provider): WalletAdapter => {
  return {
    capabilities: resolveEip6963Capabilities({ rdns: info.rdns }),
    chainPlatform: "evm",

    async connect(opts) {
      if (opts?.silent === true) {
        const accounts = await requestStringArray(provider, {
          method: "eth_accounts",
        });
        if (accounts.length === 0) {
          throw new Error("No authorized accounts for silent reconnect");
        }
        return;
      }
      await provider.request({ method: "eth_requestAccounts" });
    },

    async disconnect() {
      try {
        await provider.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch {
        // Many wallets don't implement wallet_revokePermissions yet;
        // not a failure.
      }
    },

    async getAccount() {
      const state = await readAccountState(provider, info.name);
      return state?.account ?? null;
    },

    async getAccounts() {
      const state = await readAccountState(provider, info.name);
      return state?.accounts ?? [];
    },

    async getBalance(mint) {
      const accounts = await requestStringArray(provider, { method: "eth_accounts" });
      const first = accounts[0];
      if (first === undefined) {
        throw new Error("No connected account");
      }
      return readEvmBalance(provider, first, mint);
    },

    getSigner: () => Promise.resolve(provider),

    async getTransactionReceipt(tx) {
      const receipt = await provider.request({
        method: "eth_getTransactionReceipt",
        params: [tx],
      });
      if (receipt === null || typeof receipt !== "object" || !("status" in receipt)) {
        return { status: "Pending" };
      }
      return { status: receipt.status === "0x1" ? "Success" : "Error" };
    },

    icon: sanitizeIcon(info.icon),
    id: info.rdns,
    name: info.name,

    async requestAccounts() {
      try {
        await provider.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (error) {
        const outerCode =
          typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
        const errData =
          typeof error === "object" && error !== null && "data" in error ? error.data : undefined;
        const originalError =
          typeof errData === "object" && errData !== null && "originalError" in errData
            ? errData.originalError
            : undefined;
        const innerCode =
          typeof originalError === "object" && originalError !== null && "code" in originalError
            ? originalError.code
            : undefined;
        const isMethodNotSupported =
          outerCode === 4200 || // EIP-1474 "method not supported"
          outerCode === -32_601 || // JSON-RPC "method not found"
          outerCode === -32_603 || // JSON-RPC "internal error" (Coinbase wraps -32604 here)
          innerCode === 4200 ||
          innerCode === -32_601 ||
          innerCode === -32_604; // Coinbase's custom "method not supported"
        if (isMethodNotSupported) {
          await provider.request({ method: "eth_requestAccounts" });
          return;
        }
        throw error;
      }
    },

    async sendTx(tx, account) {
      const txWithFrom = withFrom(tx, account?.walletAddress);
      const hash = await requestString(provider, {
        method: "eth_sendTransaction",
        params: [txWithFrom],
      });
      if (hash === null) {
        throw new Error("Wallet returned no transaction hash");
      }
      return hash;
    },

    async sendTxToChain(tx, targetChainIdDecimal, account, cb) {
      const current = await requestString(provider, { method: "eth_chainId" });
      const targetHex = chainIdDecimalToHex(targetChainIdDecimal);
      if (current?.toLowerCase() !== targetHex.toLowerCase()) {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetHex }],
        });
        cb?.();
      }
      const txWithFrom = withFrom(tx, account?.walletAddress);
      const hash = await requestString(provider, {
        method: "eth_sendTransaction",
        params: [txWithFrom],
      });
      if (hash === null) {
        throw new Error("Wallet returned no transaction hash");
      }
      return hash;
    },

    async signMessage(msg, account) {
      let signer = account?.walletAddress;
      if (signer === undefined || signer === "") {
        const accounts = await requestStringArray(provider, { method: "eth_accounts" });
        signer = accounts[0];
      }
      if (signer === undefined || signer === "") {
        throw new Error("No connected account");
      }
      const signatureHex = await requestString(provider, {
        method: "personal_sign",
        params: [bytesToHex(msg), signer],
      });
      if (signatureHex === null) {
        throw new Error("Wallet returned a malformed personal_sign response");
      }
      return { signature: hexToBytes(signatureHex), signedMessage: msg };
    },

    subscribe(listener) {
      const synchronizeAccount = async (options?: AccountStateOptions) => {
        try {
          const state = await readAccountState(provider, info.name, options);
          if (state !== null) {
            listener({ ...state, type: "accountChanged" });
          }
        } catch {
          // EIP-1193 event reads are best-effort; a later event retries synchronization.
        }
      };

      const onAccountsChanged: Eip1193Listener = (...args) => {
        const accs = toStringArray(args[0]);
        if (accs.length === 0) {
          listener({ type: "disconnected" });
          return;
        }
        void synchronizeAccount({ accounts: accs });
      };

      const onChainChanged: Eip1193Listener = (...args) => {
        const [chainId] = args;
        // Some wallets emit a decimal number here instead of the EIP-1193
        // hex string; leaving it absent re-engages the eth_chainId read.
        const chainIdHex = typeof chainId === "string" && chainId.length > 0 ? chainId : undefined;
        void synchronizeAccount({ chainIdHex });
      };

      const onDisconnect: Eip1193Listener = () => {
        listener({ type: "disconnected" });
      };

      const onConnect: Eip1193Listener = () => {
        void synchronizeAccount();
      };

      provider.on("accountsChanged", onAccountsChanged);
      provider.on("chainChanged", onChainChanged);
      provider.on("connect", onConnect);
      provider.on("disconnect", onDisconnect);

      return () => {
        provider.removeListener("accountsChanged", onAccountsChanged);
        provider.removeListener("chainChanged", onChainChanged);
        provider.removeListener("connect", onConnect);
        provider.removeListener("disconnect", onDisconnect);
      };
    },

    async switchChain(chain) {
      const targetHex = chainIdDecimalToHex(chain.reference);
      const current = await requestString(provider, { method: "eth_chainId" });
      if (current?.toLowerCase() === targetHex.toLowerCase()) {
        return;
      }
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetHex }],
      });
    },
  };
};

export { bytesToHexPrefixed as bytesToHex, hexToBytes } from "@usebutr/core";
export { formatEther } from "./evm-balance";
export { buildEvmAdapter, chainIdDecimalToHex, chainIdHexToDecimal };
