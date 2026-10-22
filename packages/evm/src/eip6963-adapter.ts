import type { Account, ChainBase, EvmAdapter, EvmTransactionValue } from "@usebutr/core";
import {
  buildAccount,
  bytesToHexPrefixed,
  createSwitchingChainTarget,
  EVM_CHAINS_LIST,
  hexToBytes,
  resolveChain,
  sanitizeIcon,
} from "@usebutr/core";

import type {
  Eip1193Listener,
  Eip1193Object,
  Eip1193Provider,
  Eip1193Value,
  Eip6963ProviderInfo,
} from "./eip1193";
import { requestString, requestStringArray } from "./eip1193";
import { readEvmBalance } from "./evm-balance";

const EVM_NAMESPACE = "eip155";

const toStringArray = (value: Eip1193Value | undefined): Array<string> =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/** JSON-RPC cannot carry a `bigint`, so quantities go out as `0x` hex. */
const encodeValue = (value: EvmTransactionValue): Eip1193Value => {
  if (typeof value === "bigint") {
    return `0x${value.toString(16)}`;
  }

  if (Array.isArray(value)) {
    return value.map(encodeValue);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  const result: Eip1193Object = {};

  for (const [key, nested] of Object.entries(value)) {
    result[key] = nested === undefined ? undefined : encodeValue(nested);
  }

  return result;
};

const chainIdHexToDecimal = (hex: string): string => BigInt(hex).toString(10);
const chainIdDecimalToHex = (dec: string): string => `0x${BigInt(dec).toString(16)}`;

const evmChainFromHex = (chainIdHex: string): ChainBase =>
  resolveChain(`${EVM_NAMESPACE}:${chainIdHexToDecimal(chainIdHex)}`, EVM_CHAINS_LIST);

/** An event may already carry the addresses or the chain; only the missing
 *  half is read back from the wallet. */
type KnownAccountState = {
  addresses?: ReadonlyArray<string>;
  chainIdHex?: string;
};

/** Rejections propagate: `getAccounts` surfaces the wallet's own provider
 *  error, while the `subscribe` bridge swallows it because a later event
 *  retries synchronization. */
const readAccounts = async (
  provider: Eip1193Provider,
  known: KnownAccountState = {},
): Promise<Array<Account>> => {
  const addresses =
    known.addresses ?? (await requestStringArray(provider, { method: "eth_accounts" }));

  if (addresses.length === 0) {
    return [];
  }

  const chainIdHex = known.chainIdHex ?? (await requestString(provider, { method: "eth_chainId" }));

  if (chainIdHex === null) {
    throw new Error("Wallet returned a malformed eth_chainId response");
  }

  const chain = evmChainFromHex(chainIdHex);

  return addresses.map((address) => buildAccount(address, chain));
};

/** EIP-1474 / JSON-RPC codes wallets use for an unimplemented method. */
const METHOD_NOT_SUPPORTED_CODES = new Set<unknown>([4200, -32_601, -32_603, -32_604]);

/** EIP-3326: the wallet does not know the chain `wallet_switchEthereumChain` names. */
const UNRECOGNIZED_CHAIN_CODE = 4902;

/** The error's own code and the one Coinbase wraps in `data.originalError`. */
const errorCodes = (cause: unknown): Array<unknown> => {
  const outer = typeof cause === "object" && cause !== null ? cause : {};
  const data = "data" in outer ? outer.data : undefined;

  const inner =
    typeof data === "object" && data !== null && "originalError" in data
      ? data.originalError
      : undefined;

  return [outer, inner].flatMap((value) =>
    typeof value === "object" && value !== null && "code" in value ? [value.code] : [],
  );
};

/**
 * `disconnect` calls `wallet_revokePermissions`, which many wallets don't
 * implement and silently ignore, so their own auto-reconnect may outlive it.
 * `getBalance()` labels the native balance `"ETH"` on every EVM chain.
 */
const buildEvmAdapter = (info: Eip6963ProviderInfo, provider: Eip1193Provider): EvmAdapter => {
  const target = createSwitchingChainTarget({
    canSwitch: (chain) => /^\d+$/v.test(chain.reference),
    current: async () => {
      const chainIdHex = await requestString(provider, { method: "eth_chainId" });

      return chainIdHex === null
        ? undefined
        : `${EVM_NAMESPACE}:${chainIdHexToDecimal(chainIdHex)}`;
    },
    namespace: EVM_NAMESPACE,
    switchTo: async (chain) => {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdDecimalToHex(chain.reference) }],
      });
    },
    unknownChain: (error) => errorCodes(error).includes(UNRECOGNIZED_CHAIN_CODE),
    wallet: info.name,
  });

  const resolveAddress = async (account?: Account): Promise<string> =>
    target.account(await requestStringArray(provider, { method: "eth_accounts" }), account);

  return {
    chainPlatform: "evm",

    async connect(options) {
      if (options?.silent === true) {
        const accounts = await requestStringArray(provider, { method: "eth_accounts" });

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

    getAccounts: () => readAccounts(provider),

    async getBalance(options) {
      return readEvmBalance(provider, await resolveAddress(options?.account), options?.token);
    },

    getSigner: () => Promise.resolve({ kind: "eip1193", provider }),

    async getTransactionReceipt(hash) {
      const receipt = await provider.request({
        method: "eth_getTransactionReceipt",
        params: [hash],
      });

      // `null` is the RPC's answer for a transaction not yet mined.
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
        if (!errorCodes(error).some((code) => METHOD_NOT_SUPPORTED_CODES.has(code))) {
          throw error;
        }

        await provider.request({ method: "eth_requestAccounts" });
      }
    },

    // EVM wallets have one global network, so a `chain` switches it before
    // the send rather than routing the one call. `from` is always the
    // resolved account, replacing any `from` inside `tx`.
    async sendTx(tx, options) {
      const from = await resolveAddress(options?.account);
      await target.chain(options?.chain);

      const hash = await requestString(provider, {
        method: "eth_sendTransaction",
        params: [encodeValue({ ...tx, from })],
      });

      if (hash === null) {
        throw new Error("Wallet returned no transaction hash");
      }

      return hash;
    },

    async signMessage(message, options) {
      const address = await resolveAddress(options?.account);

      const signatureHex = await requestString(provider, {
        method: "personal_sign",
        params: [bytesToHexPrefixed(message), address],
      });

      if (signatureHex === null) {
        throw new Error("Wallet returned a malformed personal_sign response");
      }

      return { signature: hexToBytes(signatureHex), signedMessage: message };
    },

    subscribe(listener) {
      const synchronize = async (known?: KnownAccountState) => {
        try {
          const accounts = await readAccounts(provider, known);

          if (accounts.length > 0) {
            listener({ accounts, type: "accountsChanged" });
          }
        } catch {
          // EIP-1193 event reads are best-effort; a later event retries synchronization.
        }
      };

      const onAccountsChanged: Eip1193Listener = (...args) => {
        const addresses = toStringArray(args[0]);

        if (addresses.length === 0) {
          listener({ accounts: [], type: "accountsChanged" });

          return;
        }

        void synchronize({ addresses });
      };

      const onChainChanged: Eip1193Listener = (...args) => {
        const [chainId] = args;
        // Some wallets emit a decimal number here instead of the EIP-1193
        // hex string; leaving it absent re-engages the eth_chainId read.
        const chainIdHex = typeof chainId === "string" && chainId.length > 0 ? chainId : undefined;
        void synchronize({ chainIdHex });
      };

      const onDisconnect: Eip1193Listener = () => {
        listener({ type: "disconnected" });
      };

      const onConnect: Eip1193Listener = () => {
        void synchronize();
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

    switchChain: target.chain,
  };
};

export { formatEther } from "./evm-balance";

export { buildEvmAdapter, chainIdDecimalToHex, chainIdHexToDecimal };
