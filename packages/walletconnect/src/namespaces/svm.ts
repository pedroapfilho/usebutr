import type { Account, ChainBase, SvmAdapter, WalletCapabilities } from "@usebutr/core";
import { base64ToBytes, bytesToBase64, logWarn } from "@usebutr/core";

import type { UniversalProviderLike } from "../loader";

import type { WalletConnectNamespaceBuilder } from "./types";

const SOLANA_PREFIX = "solana:";
const SOLANA_DECIMALS = 9;

const DEFAULT_CHAINS: ReadonlyArray<string> = ["solana:mainnet"];

const DEFAULT_METHODS: ReadonlyArray<string> = [
  "solana_signMessage",
  "solana_signTransaction",
  "solana_signAndSendTransaction",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

/**
 * Runtime capability flags for an SVM adapter speaking WalletConnect v2.
 *
 *  - `sendTransaction` / `signMessage` / `signTransaction`: true; all
 *    three solana_* methods are advertised at pairing time. Per-wallet
 *    method support varies (mobile wallets are inconsistent); callers
 *    that hit a wallet without the method will get a JSON-RPC error
 *    back from the request.
 *  - `signIn`: false; there is no Sign-In-With-Solana RPC method on
 *    WalletConnect today.
 *  - `subscribe`: false; wallet-side events over WC are mediated by
 *    the universal provider rather than this adapter; we leave the
 *    method a no-op for v0 and let consumers wire native events later.
 *  - `switchChain`: true; the active chain is encoded in `chains` at
 *    pair time and we update local state for subsequent calls; the
 *    wallet itself can't "switch" inside an existing session.
 *  - `switchAccount`: false; no RPC for it.
 *  - `getBalance` / `getTransactionReceipt`: false; butr ships no RPC.
 *  - `requestAccounts`: false; accounts come from the pairing only.
 */
const WALLETCONNECT_SVM_CAPABILITIES: WalletCapabilities = {
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

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_INDEX = new Map<string, number>();
for (let i = 0; i < BASE58_ALPHABET.length; i += 1) {
  BASE58_INDEX.set(BASE58_ALPHABET[i] ?? "", i);
}

/** Decode a base58 string into raw bytes. Used to turn WC's base58
 *  signature responses into the `Uint8Array` butr's contract returns. */
const base58ToBytes = (input: string): Uint8Array => {
  let intVal = 0n;
  let leadingZeros = 0;
  let stillLeading = true;
  for (const char of input) {
    if (stillLeading && char === "1") {
      leadingZeros += 1;
    } else {
      stillLeading = false;
    }
    const digit = BASE58_INDEX.get(char);
    if (digit === undefined) {
      throw new Error(`Invalid base58 character "${char}"`);
    }
    intVal = intVal * 58n + BigInt(digit);
  }
  const bytes: Array<number> = [];
  // Decimal literal (= 0xFF) sidesteps an oxfmt/lint conflict on hex BigInt casing.
  const byteMask = 255n;
  while (intVal > 0n) {
    bytes.unshift(Number(intVal & byteMask));
    intVal >>= 8n;
  }
  for (let i = 0; i < leadingZeros; i += 1) {
    bytes.unshift(0);
  }
  return Uint8Array.from(bytes);
};

/** Parse a CAIP-10 string (`solana:mainnet:Bg9LkP...`) into its
 *  components. The address is the trailing segment after the last `:`. */
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
  return session?.namespaces?.["solana"]?.accounts ?? [];
};

const buildSolanaChain = (chainId: string, walletName: string): ChainBase => ({
  id: chainId,
  // Same posture as the EIP-6963 / Wallet Standard sides: butr doesn't
  name: walletName,
  namespace: "solana",
  reference: chainId.slice(SOLANA_PREFIX.length),
});

const buildSolanaAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

/**
 * Solana (CAIP `solana:*`) namespace builder. Wraps the paired
 * `UniversalProvider` and routes calls through the WalletConnect v2
 * Solana RPC methods:
 *
 *  - `solana_signMessage`            → `signMessage`
 *  - `solana_signTransaction`        → `signTransaction`
 *  - `solana_signAndSendTransaction` → `sendTx` / `sendTxToChain`
 *
 * **Caveats.** Mobile-wallet support for these methods varies; Phantom
 * and Solflare advertise them today, but the response shapes (base58
 * signatures vs. base64 transactions) drift between releases. Verify
 * end-to-end against your target wallets before relying on this in
 * production. There is no Sign-In-With-Solana over WC today, so
 * `capabilities.signIn` is `false`.
 *
 * `subscribe` is a no-op for v0; wallet events over WC are mediated by
 * the provider and need per-wallet quirks the namespace builder
 * shouldn't own. Consumers wire native events themselves until we
 * land a follow-up.
 */
const solanaNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider }) {
    let currentChainId = chains[0] ?? DEFAULT_CHAINS[0] ?? "solana:mainnet";
    const currentChain = (): ChainBase => buildSolanaChain(currentChainId, name);

    const resolveAccounts = (): Array<Account> => {
      const chain = currentChain();
      return readSessionAccounts(provider).map((caip10) =>
        buildSolanaAccount(parseCaip10Address(caip10), chain),
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
        throw new Error("No connected Solana account");
      }
      return first.walletAddress;
    };

    const adapter: SvmAdapter = {
      capabilities: WALLETCONNECT_SVM_CAPABILITIES,
      chainPlatform: "svm",

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
            solana: {
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
        return Promise.resolve({
          decimals: SOLANA_DECIMALS,
          formatted: "0",
          symbol: "SOL",
          value: 0n,
        });
      },

      getSigner() {
        return Promise.resolve(provider);
      },

      getTransactionReceipt() {
        return Promise.resolve({ status: "Pending" as const });
      },

      icon,
      id,
      name,

      async sendTx(tx, account) {
        if (!(tx instanceof Uint8Array)) {
          throw new TypeError("SVM sendTx expects a serialized transaction (Uint8Array)");
        }
        const pubkey = resolveAddress(account);
        const result = (await provider.request({
          method: "solana_signAndSendTransaction",
          params: {
            pubkey,
            transaction: bytesToBase64(tx),
          },
        })) as { signature?: string } | string;
        const signature = typeof result === "string" ? result : result?.signature;
        if (!signature) {
          throw new Error("solana_signAndSendTransaction returned no signature");
        }
        return signature;
      },

      sendTxToChain(tx, _targetChainId, account, cb) {
        // WC Solana's signAndSendTransaction doesn't take a chain
        // parameter; the cluster is baked into the pairing. Honour the
        cb?.();
        return this.sendTx(tx, account);
      },

      async signMessage(msg, account) {
        const pubkey = resolveAddress(account);
        const result = (await provider.request({
          method: "solana_signMessage",
          params: {
            message: bytesToBase64(msg),
            pubkey,
          },
        })) as { signature?: string } | string;
        const signatureB58 = typeof result === "string" ? result : result?.signature;
        if (!signatureB58) {
          throw new Error("solana_signMessage returned no signature");
        }
        // butr's contract returns the raw signature bytes. WC speaks
        // base58 for Solana signatures; decode here so consumers don't
        return { signature: base58ToBytes(signatureB58), signedMessage: msg };
      },

      async signTransaction(tx, account) {
        if (!(tx instanceof Uint8Array)) {
          throw new TypeError("SVM signTransaction expects a serialized transaction (Uint8Array)");
        }
        const pubkey = resolveAddress(account);
        const result = (await provider.request({
          method: "solana_signTransaction",
          params: {
            pubkey,
            transaction: bytesToBase64(tx),
          },
        })) as { signature?: string; transaction?: string } | string;
        // The Solana WC spec leaves room for two return shapes: a base64
        // `transaction` (the fully-signed bytes) or a base58 `signature`
        // alone. Prefer the base64 transaction; that's the contract
        if (typeof result === "object" && result?.transaction) {
          return base64ToBytes(result.transaction);
        }
        const signatureB58 = typeof result === "string" ? result : result?.signature;
        if (!signatureB58) {
          throw new Error("solana_signTransaction returned no transaction or signature");
        }
        // Fallback: a few wallets return just the signature. That's not
        return base58ToBytes(signatureB58);
      },

      subscribe() {
        // v0: no-op. WC wallet-side events are mediated by the provider
        // and need per-wallet quirks the namespace builder shouldn't own.
        return () => {};
      },

      switchChain(chain) {
        if (chain.namespace !== "solana") {
          throw new Error(
            `SVM WC adapter received non-Solana chain "${chain.id}". Pass a chain with namespace "solana".`,
          );
        }
        // Local state only; the WC session's chain list is fixed at
        // without re-negotiating with the wallet.
        currentChainId = chain.id;
        return Promise.resolve();
      },
    };

    return adapter;
  },
  caipPrefix: "solana",
  chainPlatform: "svm",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { WALLETCONNECT_SVM_CAPABILITIES, solanaNamespace };
