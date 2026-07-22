import type { Account, ChainBase, SuiAdapter, WalletCapabilities } from "@usebutr/core";
import { base64ToBytes, buildAccount, bytesToBase64, logWarn } from "@usebutr/core";

import {
  CAIP_WC_CAPABILITIES,
  buildCaipChain,
  parseCaip10Address,
  readNamespaceAccounts,
} from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";

const SUI_NAMESPACE = "sui";
const SUI_DECIMALS = 9;

// Sui Wallet Standard wallets advertise chains as the short
// `sui:mainnet` / `sui:testnet` / `sui:devnet` rather than the strict
// CAIP-2 form (genesis-checkpoint hash). Phantom (Sui), Sui Wallet,
// Suiet and the WC Dappkit reference all exchange these names; we
// follow suit here so the pairing handshake matches what wallets
// expect.
const DEFAULT_CHAINS: ReadonlyArray<string> = ["sui:mainnet"];

const DEFAULT_METHODS: ReadonlyArray<string> = [
  "sui_signTransaction",
  "sui_signAndExecuteTransaction",
  "sui_signPersonalMessage",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

/** Shared CAIP-WC capability surface (rationale on `CAIP_WC_CAPABILITIES`);
 *  the true flags map to the `sui_*` sign/send methods requested at pairing. */
const WALLETCONNECT_SUI_CAPABILITIES: WalletCapabilities = { ...CAIP_WC_CAPABILITIES };

/**
 * Sui (CAIP `sui:*`) namespace builder. Wraps the paired
 * `UniversalProvider` and routes calls through the WalletConnect v2
 * Sui RPC methods:
 *
 *  - `sui_signPersonalMessage`       → `signMessage`
 *  - `sui_signTransaction`           → `signTransaction`
 *  - `sui_signAndExecuteTransaction` → `sendTx` / `sendTxToChain`
 *
 * **Caveats.** Mobile-wallet support for these methods varies. The Sui
 * WC reference (Reown docs + Mysten's Dappkit) defines a stable shape,
 * but wallets drift on response keys (`transactionBytes` vs
 * `transactionBlockBytes`, `{ signature, bytes }` vs `{ signature }`).
 * The adapter is lenient about response shapes; verify end-to-end
 * against your target wallets before relying on this in production.
 *
 * `signTransaction` returns the signed transaction BYTES (base64-decoded).
 * butr ships no Sui RPC, so the consumer broadcasts those bytes through
 * `@mysten/sui`'s `SuiClient`.
 *
 * `subscribe` is a no-op for v0; wallet events over WC are mediated by
 * the provider and need per-wallet quirks the namespace builder
 * shouldn't own. Consumers wire native events themselves until we
 * land a follow-up.
 */
/** Coerce butr's `unknown` tx into the base64 string the Sui WC methods
 *  expect. Consumers pass either a base64 string (already BCS-serialized
 *  by `@mysten/sui`) or a `Uint8Array` of BCS bytes. */
const coerceTransactionToBase64 = (tx: unknown): string => {
  if (typeof tx === "string") {
    return tx;
  }
  if (tx instanceof Uint8Array) {
    return bytesToBase64(tx);
  }
  throw new TypeError(
    "Sui sendTx/signTransaction expects a base64-encoded string or Uint8Array of BCS bytes",
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readStringField = (value: unknown, key: string): string | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }
  const field = value[key];
  return typeof field === "string" ? field : undefined;
};

const suiNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider }) {
    let currentChainId = chains[0] ?? DEFAULT_CHAINS[0] ?? "sui:mainnet";
    const currentChain = (): ChainBase => buildCaipChain(currentChainId, name, SUI_NAMESPACE);

    const resolveAccounts = (): Array<Account> => {
      const chain = currentChain();
      return readNamespaceAccounts(provider, SUI_NAMESPACE).map((caip10) =>
        buildAccount(parseCaip10Address(caip10), chain),
      );
    };

    /** Pick the WC account address to route a call through. Falls back
     *  to the first session account when the caller doesn't specify one. */
    const resolveAddress = (account?: Account): string => {
      if (account) {
        return account.walletAddress;
      }
      const first = resolveAccounts()[0];
      if (first === undefined) {
        throw new Error("No connected Sui account");
      }
      return first.walletAddress;
    };

    const executeTx = async (tx: unknown, account?: Account): Promise<string> => {
      const address = resolveAddress(account);
      const transaction = coerceTransactionToBase64(tx);
      const result: unknown = await provider.request({
        method: "sui_signAndExecuteTransaction",
        params: { address, transaction },
      });
      // Spec says `{ digest }`. Tolerate a bare string too; some wallets
      // short-circuit to the digest directly.
      const digest = typeof result === "string" ? result : readStringField(result, "digest");
      if (digest === undefined || digest === "") {
        throw new Error("sui_signAndExecuteTransaction returned no digest");
      }
      return digest;
    };

    const adapter: SuiAdapter = {
      capabilities: WALLETCONNECT_SUI_CAPABILITIES,
      chainPlatform: "sui",

      async connect(opts) {
        // Live session across reloads → skip the pairing handshake.
        if (provider.session) {
          return;
        }
        if (opts?.silent === true) {
          throw new Error("No WalletConnect session for silent reconnect");
        }
        await provider.connect({
          namespaces: {
            sui: {
              chains: [...chains],
              events: [...DEFAULT_EVENTS],
              methods: [...DEFAULT_METHODS],
            },
          },
        });
      },

      async disconnect() {
        if (!provider.session) {
          return;
        }
        try {
          await provider.disconnect();
        } catch (error) {
          // The relay may already have dropped the session (mobile
          // wallet uninstalled, etc.). Don't propagate; butr's
          // reducer marks the wallet disconnected on its side
          // regardless.
          logWarn("[butr/walletconnect] disconnect threw:", error);
        }
      },

      getAccount: () => {
        const first = resolveAccounts()[0] ?? null;
        return Promise.resolve(first);
      },

      getAccounts: () => Promise.resolve(resolveAccounts()),

      getBalance: () =>
        Promise.resolve({
          decimals: SUI_DECIMALS,
          formatted: "0",
          symbol: "SUI",
          value: 0n,
        }),

      getSigner: () => Promise.resolve(provider),

      getTransactionReceipt: () => Promise.resolve({ status: "Pending" as const }),

      icon,
      id,
      name,

      sendTx: (tx, account) => executeTx(tx, account),

      sendTxToChain: (tx, _targetChainId, account, cb) => {
        // WC Sui's signAndExecute doesn't take a per-call chain
        // parameter; the cluster is baked into the pairing. Honour
        // the current chain and let consumers route per-chain higher
        // up if they need multi-cluster support.
        cb?.();
        return executeTx(tx, account);
      },

      async signMessage(msg, account) {
        const address = resolveAddress(account);
        // Encode as base64: WC mobile wallets expect it, and plain-text wallets still decode (base64 ⊂ UTF-8).
        const result: unknown = await provider.request({
          method: "sui_signPersonalMessage",
          params: { address, message: bytesToBase64(msg) },
        });
        const signatureB64 =
          typeof result === "string" ? result : readStringField(result, "signature");
        if (signatureB64 === undefined || signatureB64 === "") {
          throw new Error("sui_signPersonalMessage returned no signature");
        }
        // Wallets are inconsistent: some echo the signed bytes back
        // (Wallet Standard's `signPersonalMessage` does); WC's reference
        // spec lists only `signature`. Prefer the wallet's `bytes` if
        // present (lets verifiers check against what the wallet actually
        // signed), otherwise fall through to the original input.
        const echoedBytes = readStringField(result, "bytes");
        const echoed = echoedBytes === undefined ? msg : base64ToBytes(echoedBytes);
        return { signature: base64ToBytes(signatureB64), signedMessage: echoed };
      },

      async signTransaction(tx, account) {
        const address = resolveAddress(account);
        const transaction = coerceTransactionToBase64(tx);
        const result: unknown = await provider.request({
          method: "sui_signTransaction",
          params: { address, transaction },
        });
        if (isRecord(result)) {
          // The Reown docs spell the key `transactionBytes`. The older
          // Mysten Dappkit reference (and some wallets) use
          // `transactionBlockBytes`. Accept either; both are the
          // base64-encoded signed transaction bytes butr's
          // `SuiWallet.signTransaction` contract returns.
          const bytesB64 =
            readStringField(result, "transactionBytes") ??
            readStringField(result, "transactionBlockBytes");
          if (bytesB64 !== undefined) {
            return base64ToBytes(bytesB64);
          }
        }
        const signatureB64 =
          typeof result === "string" ? result : readStringField(result, "signature");
        if (signatureB64 === undefined || signatureB64 === "") {
          throw new Error("sui_signTransaction returned no transaction or signature");
        }
        // Fallback: a few wallets return just the signature. That's not
        // the signed transaction, but it's all we got; pass it through
        // as bytes and let the consumer reconcile.
        return base64ToBytes(signatureB64);
      },

      subscribe: () => () => {},

      switchChain: (chain) => {
        if (chain.namespace !== "sui") {
          throw new Error(
            `Sui WC adapter received non-Sui chain "${chain.id}". Pass a chain with namespace "sui".`,
          );
        }
        // Local state only; the WC session's chain list is fixed at
        // pair time, so this updates butr's view of "active cluster"
        // without re-negotiating with the wallet.
        currentChainId = chain.id;
        return Promise.resolve();
      },
    };

    return adapter;
  },
  caipPrefix: "sui",
  chainPlatform: "sui",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { WALLETCONNECT_SUI_CAPABILITIES, suiNamespace };
