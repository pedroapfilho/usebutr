import type { Account, SuiAdapter, WalletCapabilities } from "@usebutr/core";
import { base64ToBytes, bytesToBase64 } from "@usebutr/core";

import { CAIP_WC_CAPABILITIES, createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readStringField } from "./wallet-response";

const SUI_NAMESPACE = "sui";
const SUI_DECIMALS = 9;
const SUI_MAINNET = "sui:mainnet";

const DEFAULT_CHAINS: ReadonlyArray<string> = [SUI_MAINNET];

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

const suiNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider, session }) {
    const { resolveAddress, ...core } = createCaipAdapterCore({
      chains,
      events: DEFAULT_EVENTS,
      fallbackChainId: SUI_MAINNET,
      label: "Sui",
      methods: DEFAULT_METHODS,
      name,
      namespace: SUI_NAMESPACE,
      platform: "Sui",
      provider,
      session,
    });

    const executeTx = async (tx: unknown, account?: Account): Promise<string> => {
      const address = resolveAddress(account);
      const transaction = coerceTransactionToBase64(tx);
      const result: unknown = await provider.request({
        method: "sui_signAndExecuteTransaction",
        params: { address, transaction },
      });
      const digest = typeof result === "string" ? result : readStringField(result, "digest");
      if (digest === undefined || digest === "") {
        throw new Error("sui_signAndExecuteTransaction returned no digest");
      }
      return digest;
    };

    const adapter: SuiAdapter = {
      ...core,
      capabilities: WALLETCONNECT_SUI_CAPABILITIES,
      chainPlatform: "sui",

      getBalance: () =>
        Promise.resolve({
          decimals: SUI_DECIMALS,
          formatted: "0",
          symbol: "SUI",
          value: 0n,
        }),

      icon,
      id,
      name,

      sendTx: (tx, account) => executeTx(tx, account),

      sendTxToChain: (tx, _targetChainId, account, cb) => {
        cb?.();
        return executeTx(tx, account);
      },

      async signMessage(msg, account) {
        const address = resolveAddress(account);
        const result: unknown = await provider.request({
          method: "sui_signPersonalMessage",
          params: { address, message: bytesToBase64(msg) },
        });
        const signatureB64 =
          typeof result === "string" ? result : readStringField(result, "signature");
        if (signatureB64 === undefined || signatureB64 === "") {
          throw new Error("sui_signPersonalMessage returned no signature");
        }
        const echoedBytes = readStringField(result, "bytes");
        const echoed =
          echoedBytes === undefined || echoedBytes === "" ? msg : base64ToBytes(echoedBytes);
        return { signature: base64ToBytes(signatureB64), signedMessage: echoed };
      },

      async signTransaction(tx, account) {
        const address = resolveAddress(account);
        const transaction = coerceTransactionToBase64(tx);
        const result: unknown = await provider.request({
          method: "sui_signTransaction",
          params: { address, transaction },
        });
        const signatureB64 =
          typeof result === "string" ? result : readStringField(result, "signature");
        if (signatureB64 === undefined || signatureB64 === "") {
          throw new Error("sui_signTransaction returned no signature");
        }
        // Wallets vary on the key, and some echo no bytes at all. The bytes the
        // signature covers are the ones we submitted, so fall back to those
        // rather than returning a pair whose halves disagree.
        const bytesB64 =
          readStringField(result, "transactionBytes") ??
          readStringField(result, "transactionBlockBytes");
        return {
          bytes: base64ToBytes(bytesB64 === undefined || bytesB64 === "" ? transaction : bytesB64),
          signature: base64ToBytes(signatureB64),
        };
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
