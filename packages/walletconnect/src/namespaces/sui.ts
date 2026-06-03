import type { Account, ChainBase, SuiAdapter, WalletCapabilities } from "@usebutr/core";
import { logWarn } from "@usebutr/core";

import type { UniversalProviderLike } from "../loader";

import type { WalletConnectNamespaceBuilder } from "./types";

const SUI_PREFIX = "sui:";
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

/**
 * Runtime capability flags for a Sui adapter speaking WalletConnect v2.
 *
 *  - `sendTransaction` / `signMessage` / `signTransaction`: true — all
 *    three sui_* methods are advertised at pairing time. Per-wallet
 *    method support varies (mobile wallets are inconsistent); callers
 *    that hit a wallet without the method will get a JSON-RPC error
 *    back from the request.
 *  - `signIn`: false — there is no Sign-In-With-Sui RPC method on
 *    WalletConnect today.
 *  - `subscribe`: false — wallet-side events over WC are mediated by
 *    the universal provider rather than this adapter; we leave the
 *    method a no-op for v0 and let consumers wire native events later.
 *  - `switchChain`: true — the active chain is encoded in `chains` at
 *    pair time and we update local state for subsequent calls; the
 *    wallet itself can't "switch" inside an existing session.
 *  - `switchAccount`: false — no RPC for it.
 *  - `getBalance` / `getTransactionReceipt`: false — butr ships no RPC.
 *  - `requestAccounts`: false — accounts come from the pairing only.
 */
const WALLETCONNECT_SUI_CAPABILITIES: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: true,
  signIn: false,
  signMessage: true,
  signTransaction: true,
  subscribe: false,
  switchAccount: false,
  switchChain: true,
};

/** Cross-platform Uint8Array → base64. `btoa` is available everywhere
 *  butr runs (browsers, RN since Hermes, Node 16+, Bun, Deno). */
const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  return btoa(binary);
};

/** Cross-platform base64 → Uint8Array (used to decode the signed
 *  transaction bytes / signatures returned by Sui WC methods). */
const base64ToBytes = (input: string): Uint8Array => {
  const binary = atob(input);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.codePointAt(i) ?? 0;
  }
  return out;
};

/** Parse a CAIP-10 string (`sui:mainnet:0xabc...`) into the address
 *  segment. The address is the trailing segment after the last `:`. */
const parseCaip10Address = (caip10: string): string => {
  const lastColon = caip10.lastIndexOf(":");
  return lastColon === -1 ? caip10 : caip10.slice(lastColon + 1);
};

/** Pull the namespace section of the live WC session in a way that
 *  doesn't depend on the `@walletconnect/universal-provider` types
 *  being present at build time (the dep is optional). */
const readSessionAccounts = (provider: UniversalProviderLike): ReadonlyArray<string> => {
  const session = provider.session as
    | { namespaces?: Record<string, { accounts?: ReadonlyArray<string> }> }
    | null
    | undefined;
  return session?.namespaces?.["sui"]?.accounts ?? [];
};

const buildSuiChain = (chainId: string, walletName: string): ChainBase => ({
  id: chainId,
  // Same posture as the EVM / SVM sides: butr doesn't ship a chain-id
  // → name table. Consumers overlay via structural typing.
  name: walletName,
  namespace: "sui",
  reference: chainId.slice(SUI_PREFIX.length),
});

const buildSuiAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

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
 * `subscribe` is a no-op for v0 — wallet events over WC are mediated by
 * the provider and need per-wallet quirks the namespace builder
 * shouldn't own. Consumers wire native events themselves until we
 * land a follow-up.
 */
const suiNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider }) {
    let currentChainId = chains[0] ?? DEFAULT_CHAINS[0] ?? "sui:mainnet";
    const currentChain = (): ChainBase => buildSuiChain(currentChainId, name);

    const resolveAccounts = (): Array<Account> => {
      const chain = currentChain();
      return readSessionAccounts(provider).map((caip10) =>
        buildSuiAccount(parseCaip10Address(caip10), chain),
      );
    };

    /** Pick the WC account address to route a call through. Falls back
     *  to the first session account when the caller doesn't specify one. */
    const resolveAddress = (account?: Account): string => {
      if (account) {
        return account.walletAddress;
      }
      const first = resolveAccounts()[0];
      if (!first) {
        throw new Error("No connected Sui account");
      }
      return first.walletAddress;
    };

    /** Coerce butr's `unknown` tx into the base64 string the Sui WC
     *  methods expect. Consumers pass either a base64 string (already
     *  BCS-serialized by `@mysten/sui`) or a `Uint8Array` of BCS bytes. */
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

    const adapter: SuiAdapter = {
      capabilities: WALLETCONNECT_SUI_CAPABILITIES,
      chainPlatform: "sui",

      async connect(opts) {
        // Live session across reloads → skip the pairing handshake.
        if (provider.session) {
          return;
        }
        if (opts?.silent) {
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
          // wallet uninstalled, etc.). Don't propagate — butr's
          // reducer marks the wallet disconnected on its side
          // regardless.
          logWarn("[butr/walletconnect] disconnect threw:", error);
        }
      },

      getAccount() {
        const first = resolveAccounts()[0] ?? null;
        return Promise.resolve(first);
      },

      getAccounts() {
        return Promise.resolve(resolveAccounts());
      },

      getBalance() {
        // No RPC — return a typed placeholder so the contract holds.
        // Consumers wrap their own `SuiClient` for real balances.
        return Promise.resolve({
          decimals: SUI_DECIMALS,
          formatted: "0",
          symbol: "SUI",
          value: 0n,
        });
      },

      getSigner() {
        // Hand back the raw provider; consumers narrow at use sites.
        return Promise.resolve(provider);
      },

      getTransactionReceipt() {
        // No RPC. Mirror the wallet-standard Sui adapter's stance.
        return Promise.resolve({ status: "Pending" as const });
      },

      icon,
      id,
      name,

      async sendTx(tx, account) {
        const address = resolveAddress(account);
        const transaction = coerceTransactionToBase64(tx);
        const result = (await provider.request({
          method: "sui_signAndExecuteTransaction",
          params: { address, transaction },
        })) as { digest?: string } | string;
        // Spec says `{ digest }`. Tolerate a bare string too — some
        // wallets short-circuit to the digest directly.
        const digest = typeof result === "string" ? result : result?.digest;
        if (!digest) {
          throw new Error("sui_signAndExecuteTransaction returned no digest");
        }
        return digest;
      },

      sendTxToChain(tx, _targetChainId, account, cb) {
        // WC Sui's signAndExecute doesn't take a per-call chain
        // parameter — the cluster is baked into the pairing. Honour
        // the current chain and let consumers route per-chain higher
        // up if they need multi-cluster support.
        cb?.();
        return this.sendTx(tx, account);
      },

      async signMessage(msg, account) {
        const address = resolveAddress(account);
        // Encode as base64: WC mobile wallets expect it, and plain-text wallets still decode (base64 ⊂ UTF-8).
        const result = (await provider.request({
          method: "sui_signPersonalMessage",
          params: { address, message: bytesToBase64(msg) },
        })) as { bytes?: string; signature?: string } | string;
        const signatureB64 = typeof result === "string" ? result : result?.signature;
        if (!signatureB64) {
          throw new Error("sui_signPersonalMessage returned no signature");
        }
        // Wallets are inconsistent: some echo the signed bytes back
        // (Wallet Standard's `signPersonalMessage` does); WC's reference
        // spec lists only `signature`. Prefer the wallet's `bytes` if
        // present (lets verifiers check against what the wallet actually
        // signed), otherwise fall through to the original input.
        const echoed =
          typeof result === "object" && result?.bytes ? base64ToBytes(result.bytes) : msg;
        return { signature: base64ToBytes(signatureB64), signedMessage: echoed };
      },

      async signTransaction(tx, account) {
        const address = resolveAddress(account);
        const transaction = coerceTransactionToBase64(tx);
        const result = (await provider.request({
          method: "sui_signTransaction",
          params: { address, transaction },
        })) as
          | { signature?: string; transactionBlockBytes?: string; transactionBytes?: string }
          | string;
        if (typeof result === "object") {
          // The Reown docs spell the key `transactionBytes`. The older
          // Mysten Dappkit reference (and some wallets) use
          // `transactionBlockBytes`. Accept either — both are the
          // base64-encoded signed transaction bytes butr's
          // `SuiWallet.signTransaction` contract returns.
          const bytesB64 = result?.transactionBytes ?? result?.transactionBlockBytes;
          if (bytesB64) {
            return base64ToBytes(bytesB64);
          }
        }
        const signatureB64 = typeof result === "string" ? result : result?.signature;
        if (!signatureB64) {
          throw new Error("sui_signTransaction returned no transaction or signature");
        }
        // Fallback: a few wallets return just the signature. That's not
        // the signed transaction, but it's all we got — pass it through
        // as bytes and let the consumer reconcile.
        return base64ToBytes(signatureB64);
      },

      subscribe() {
        // v0: no-op. WC wallet-side events are mediated by the provider
        // and need per-wallet quirks the namespace builder shouldn't own.
        return () => {};
      },

      switchChain(chain) {
        if (chain.namespace !== "sui") {
          throw new Error(
            `Sui WC adapter received non-Sui chain "${chain.id}". Pass a chain with namespace "sui".`,
          );
        }
        // Local state only — the WC session's chain list is fixed at
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
