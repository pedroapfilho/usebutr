import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { bytesToHexPrefixed as bytesToHex, hexToBytes, sanitizeIcon } from "@usebutr/core";

import { resolveEip6963Capabilities } from "./capabilities";
import type { Eip1193Listener, Eip1193Provider, Eip6963ProviderInfo } from "./eip1193";

const HEX_PREFIX = "0x";
const ETH_DECIMALS = 18n;
const ETH_UNIT = 10n ** ETH_DECIMALS;

/** `provider.request` is typed `unknown` by design; these helpers
 *  narrow the well-known EVM RPC shapes at the boundary with runtime
 *  guards so call sites stay assertion-free. Malformed responses
 *  collapse to an empty/blank value rather than throwing. */
const requestStringArray = async (
  provider: Eip1193Provider,
  args: { method: string; params?: ReadonlyArray<unknown> },
): Promise<Array<string>> => {
  const result = await provider.request(args);
  return Array.isArray(result)
    ? result.filter((item): item is string => typeof item === "string")
    : [];
};

const requestString = async (
  provider: Eip1193Provider,
  args: { method: string; params?: ReadonlyArray<unknown> },
): Promise<string> => {
  const result = await provider.request(args);
  return typeof result === "string" ? result : "";
};

const toStringArray = (value: unknown): Array<string> =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/** Merge a `from` address into a transaction object of unknown shape.
 *  butr's `sendTx` accepts `tx: unknown` (viem/ethers/raw all differ);
 *  when it's an object we overlay `from`, otherwise pass it through. */
const withFrom = (tx: unknown, from: string): unknown =>
  typeof tx === "object" && tx !== null ? { ...tx, from } : tx;

const chainIdHexToDecimal = (hex: string): string => BigInt(hex).toString(10);
const chainIdDecimalToHex = (dec: string): string => `${HEX_PREFIX}${BigInt(dec).toString(16)}`;

/** Pure 18-decimal wei → ether formatter. Trims trailing zeros so
 *  `1.0` stays `1` and `1.5` stays `1.5`. */
const formatEther = (wei: bigint): string => {
  const integer = wei / ETH_UNIT;
  const remainder = wei % ETH_UNIT;
  if (remainder === 0n) {
    return integer.toString();
  }
  const fraction = remainder.toString().padStart(Number(ETH_DECIMALS), "0").replace(/0+$/v, "");
  return fraction.length > 0 ? `${integer}.${fraction}` : integer.toString();
};

/** General-purpose `value / 10^decimals` formatter that trims trailing
 *  zeros. Mirrors `formatEther` but for arbitrary token decimals. */
const formatTokenUnits = (raw: bigint, decimals: number): string => {
  if (decimals === 0) {
    return raw.toString();
  }
  const unit = 10n ** BigInt(decimals);
  const integer = raw / unit;
  const remainder = raw % unit;
  if (remainder === 0n) {
    return integer.toString();
  }
  const fraction = remainder.toString().padStart(decimals, "0").replace(/0+$/v, "");
  return fraction.length > 0 ? `${integer}.${fraction}` : integer.toString();
};

const ERC20_BALANCE_OF_SELECTOR = "0x70a08231";
const ERC20_DECIMALS_SELECTOR = "0x313ce567";
const ERC20_SYMBOL_SELECTOR = "0x95d89b41";

const padAddressForCall = (address: string): string =>
  address.replace(/^0x/v, "").toLowerCase().padStart(64, "0");

/**
 * Decode an ABI-encoded `string` return value. Layout:
 *   bytes 0–31  : offset to the data (always 0x20 for a single string)
 *   bytes 32–63 : string length (big-endian uint256)
 *   bytes 64+   : UTF-8 bytes, right-padded to a 32-byte boundary
 *
 * Some non-standard tokens (early MakerDAO, etc.) return a `bytes32`
 * directly instead of a length-prefixed string; the fallback strips
 * trailing nulls and decodes the raw bytes.
 */
const decodeAbiString = (hex: string): string => {
  const clean = hex.startsWith(HEX_PREFIX) ? hex.slice(2) : hex;
  if (clean.length === 0) {
    return "";
  }
  if (clean.length >= 128) {
    const lengthHex = clean.slice(64, 128);
    const length = Number(BigInt(`0x${lengthHex}`));
    if (length > 0 && clean.length >= 128 + length * 2) {
      const dataHex = clean.slice(128, 128 + length * 2);
      return new TextDecoder().decode(hexToBytes(dataHex));
    }
  }
  // bytes32 fallback; trim trailing zero bytes.
  const buf = hexToBytes(clean.slice(0, 64));
  let end = buf.length;
  while (end > 0 && buf[end - 1] === 0) {
    end -= 1;
  }
  return new TextDecoder().decode(buf.subarray(0, end));
};

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

/**
 * Adapt an EIP-1193 provider (announced via EIP-6963) into a butr
 * `WalletAdapter`. The returned adapter covers the full `Connector +
 * Wallet` surface; consumers can pass it through `createConnector` like
 * any hand-written adapter.
 *
 * **Caveats**
 *
 *  - `disconnect` calls `wallet_revokePermissions`. Many wallets don't
 *    implement that method and silently ignore the call. The reducer
 *    will still mark the wallet as disconnected on butr's side; the
 *    wallet's own auto-reconnect heuristic may or may not honour it.
 *  - `switchAccount` is intentionally unimplemented because EIP-1193 has
 *    no silent "use address X" RPC. The active account is whichever one
 *    the wallet exposes first; the user changes it through the wallet's
 *    own UI. butr's `subscribe` bridge auto-updates the pool entry when
 *    `accountsChanged` fires. Call `requestAccounts` if you want the
 *    wallet to expose more accounts.
 *  - `getBalance()` returns the native ETH balance with symbol `"ETH"`
 *    regardless of which EVM chain the wallet is currently on. Consumers
 *    that target multiple EVM chains should overlay the symbol via
 *    their own logic.
 *  - `getBalance(tokenAddress)` reads the ERC20 balance for the active
 *    account on the currently-connected chain. The token's own
 *    `decimals()` and `symbol()` are queried for accurate formatting;
 *    if `symbol()` is non-standard (bytes32) it's decoded as best-
 *    effort. Routed through `eth_call` on the wallet's own provider;
 *    the demo doesn't ship a separate RPC.
 *  - `getSigner` returns the raw EIP-1193 provider. Wrap it in viem's
 *    `createWalletClient` or ethers' `BrowserProvider` at the call site.
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
      const accounts = await requestStringArray(provider, { method: "eth_accounts" });
      if (accounts.length === 0) {
        return null;
      }
      const chainIdHex = await requestString(provider, { method: "eth_chainId" });
      const chain = buildEvmChain(chainIdHex, info.name);
      const first = accounts[0];
      if (first === undefined) {
        return null;
      }
      return buildEvmAccount(first, chain);
    },

    async getAccounts() {
      const accounts = await requestStringArray(provider, { method: "eth_accounts" });
      if (accounts.length === 0) {
        return [];
      }
      const chainIdHex = await requestString(provider, { method: "eth_chainId" });
      const chain = buildEvmChain(chainIdHex, info.name);
      return accounts.map((addr) => buildEvmAccount(addr, chain));
    },

    async getBalance(mint) {
      const accounts = await requestStringArray(provider, { method: "eth_accounts" });
      const first = accounts[0];
      if (first === undefined) {
        throw new Error("No connected account");
      }
      if (mint === undefined || mint === "") {
        const balanceHex = await requestString(provider, {
          method: "eth_getBalance",
          params: [first, "latest"],
        });
        const value = BigInt(balanceHex);
        return {
          decimals: Number(ETH_DECIMALS),
          formatted: formatEther(value),
          symbol: "ETH",
          value,
        };
      }
      const balanceCallData = `${ERC20_BALANCE_OF_SELECTOR}${padAddressForCall(first)}`;
      const [balanceHex, decimalsHex, symbolHex] = await Promise.all([
        requestString(provider, {
          method: "eth_call",
          params: [{ data: balanceCallData, to: mint }, "latest"],
        }),
        requestString(provider, {
          method: "eth_call",
          params: [{ data: ERC20_DECIMALS_SELECTOR, to: mint }, "latest"],
        }),
        requestString(provider, {
          method: "eth_call",
          params: [{ data: ERC20_SYMBOL_SELECTOR, to: mint }, "latest"],
        }),
      ]);
      const value = BigInt(balanceHex);
      const decimals = Number(BigInt(decimalsHex));
      const symbol = decodeAbiString(symbolHex);
      return {
        decimals,
        formatted: formatTokenUnits(value, decimals),
        symbol,
        value,
      };
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
      // Preferred path: EIP-2255 `wallet_requestPermissions` reopens
      // the wallet's account-picker UI so the user can grant new
      // accounts. In practice, MetaMask is the only major EVM wallet
      // that actually surfaces a fresh picker; Rabby / OKX / Binance
      // / Backpack silently return existing accounts; Phantom EVM and
      // Coinbase Wallet reject with `method not supported`. The
      // `capabilities` layer (`EIP6963_RDNS_WITH_REQUEST_ACCOUNTS` in
      // `capabilities.ts`) gates the
      // demo button so users only see it where it'll do something
      // visible; this method stays callable for consumers with
      // wallet-specific flows.
      // Fallback: rejecting wallets get routed through
      // `eth_requestAccounts`, which at least doesn't throw. It won't
      // reopen the picker but surfaces newly-added accounts on the
      // next read.
      try {
        await provider.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (error: unknown) {
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
      const txWithFrom = account ? withFrom(tx, account.walletAddress) : tx;
      const hash = await requestString(provider, {
        method: "eth_sendTransaction",
        params: [txWithFrom],
      });
      return hash;
    },

    async sendTxToChain(tx, targetChainIdDecimal, account, cb) {
      const current = await requestString(provider, { method: "eth_chainId" });
      const targetHex = chainIdDecimalToHex(targetChainIdDecimal);
      if (current.toLowerCase() !== targetHex.toLowerCase()) {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetHex }],
        });
        cb?.();
      }
      const txWithFrom = account ? withFrom(tx, account.walletAddress) : tx;
      const hash = await requestString(provider, {
        method: "eth_sendTransaction",
        params: [txWithFrom],
      });
      return hash;
    },

    async signMessage(msg, account) {
      // Default to the first exposed account when the caller doesn't
      // specify one. MetaMask requires the address to be one currently
      // exposed via `eth_requestAccounts`; pass any address from
      // `ConnectedWallet.accounts` to sign with a non-active one.
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
      return { signature: hexToBytes(signatureHex), signedMessage: msg };
    },

    subscribe(listener) {
      const onAccountsChanged: Eip1193Listener = (...args) => {
        const accs = toStringArray(args[0]);
        if (accs.length === 0) {
          listener({ type: "disconnected" });
          return;
        }
        // Forward the FULL accounts array; `accountsChanged` reflects
        // the wallet's current exposure set, not an incremental add.
        // The runtime mirrors this list verbatim into the pool entry,
        // so single-account-exposure wallets (Phantom EVM) don't end
        // up with stale, non-signable addresses lingering in the array.
        void provider
          .request({ method: "eth_chainId" })
          // oxlint-disable-next-line promise/prefer-await-to-then -- callback context, not async
          .then((chainIdHex) => {
            const chain = buildEvmChain(
              typeof chainIdHex === "string" ? chainIdHex : "",
              info.name,
            );
            const accounts = accs.map((addr) => buildEvmAccount(addr, chain));
            const first = accounts[0];
            if (first === undefined) {
              return undefined;
            }
            listener({ account: first, accounts, type: "accountChanged" });
            return undefined;
          })
          // oxlint-disable-next-line promise/prefer-await-to-then -- callback context, not async
          .catch(() => {
            // Drop silently; next event will retry the read.
          });
      };

      const onChainChanged: Eip1193Listener = (...args) => {
        const chainIdHex = typeof args[0] === "string" ? args[0] : "";
        void provider
          .request({ method: "eth_accounts" })
          // oxlint-disable-next-line promise/prefer-await-to-then -- callback context, not async
          .then((accounts) => {
            const accs = toStringArray(accounts);
            if (accs.length === 0) {
              return undefined;
            }
            const chain = buildEvmChain(chainIdHex, info.name);
            const built = accs.map((addr) => buildEvmAccount(addr, chain));
            const first = built[0];
            if (first === undefined) {
              return undefined;
            }
            listener({ account: first, accounts: built, type: "accountChanged" });
            return undefined;
          })
          // oxlint-disable-next-line promise/prefer-await-to-then -- callback context, not async
          .catch(() => {
            // Drop silently.
          });
      };

      const onDisconnect: Eip1193Listener = () => {
        listener({ type: "disconnected" });
      };

      const onConnect: Eip1193Listener = () => {
        void Promise.all([
          provider.request({ method: "eth_accounts" }),
          provider.request({ method: "eth_chainId" }),
        ])
          // oxlint-disable-next-line promise/prefer-await-to-then -- callback context, not async
          .then(([accountsRaw, chainIdHex]) => {
            const accs = toStringArray(accountsRaw);
            if (accs.length === 0) {
              return undefined;
            }
            const chain = buildEvmChain(
              typeof chainIdHex === "string" ? chainIdHex : "",
              info.name,
            );
            const built = accs.map((addr) => buildEvmAccount(addr, chain));
            const first = built[0];
            if (first === undefined) {
              return undefined;
            }
            listener({ account: first, accounts: built, type: "accountChanged" });
            return undefined;
          })
          // oxlint-disable-next-line promise/prefer-await-to-then -- callback context, not async
          .catch(() => {
            // Drop silently; a later event will resync.
          });
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
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdDecimalToHex(chain.reference) }],
      });
    },
  };
};

export { bytesToHexPrefixed as bytesToHex, hexToBytes } from "@usebutr/core";
export { buildEvmAdapter, chainIdDecimalToHex, chainIdHexToDecimal, formatEther };
