import type { Account, BitcoinAdapter, ChainBase, WalletCapabilities } from "@usebutr/core";
import { logWarn } from "@usebutr/core";

import type { UniversalProviderLike } from "../loader";

import type { WalletConnectNamespaceBuilder } from "./types";

const BITCOIN_PREFIX = "bip122:";
const BITCOIN_DECIMALS = 8;

// Canonical CAIP-2 chain references for Bitcoin (genesis block hash,
// truncated to 32 chars per CAIP-122). Sourced from Reown's bip122
// namespace docs and matches what mobile wallets exchange today.
//   mainnet: bip122:000000000019d6689c085ae165831e93
//   testnet: bip122:000000000933ea01ad0ee984209779ba
//   regtest: bip122:0f9188f13cb7b2c71f2a335e3a4fc328
const BITCOIN_MAINNET = "bip122:000000000019d6689c085ae165831e93";

const DEFAULT_CHAINS: ReadonlyArray<string> = [BITCOIN_MAINNET];

// Reown's bip122 methods are unprefixed camelCase (`signMessage`,
// `signPsbt`, `sendTransfer`, `getAccountAddresses`) — verified against
// the Bitcoin RPC reference at
// https://docs.reown.com/advanced/multichain/rpc-reference/bitcoin-rpc.
// The event channel uses a `bip122_` prefix (`bip122_addressesChanged`),
// which is why methods and events look asymmetric.
const DEFAULT_METHODS: ReadonlyArray<string> = [
  "signMessage",
  "signPsbt",
  "sendTransfer",
  "getAccountAddresses",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["bip122_addressesChanged"];

/**
 * Runtime capability flags for a Bitcoin adapter speaking WalletConnect v2.
 *
 *  - `sendTransaction` / `signMessage` / `signTransaction`: true — all
 *    three bip122 methods are advertised at pairing time. Per-wallet
 *    method support varies; callers that hit a wallet without the method
 *    will get a JSON-RPC error back from the request.
 *  - `signIn`: false — no Sign-In-With-Bitcoin RPC method on
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
const WALLETCONNECT_BITCOIN_CAPABILITIES: WalletCapabilities = {
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

/** Cross-platform base64 → Uint8Array (used to decode the signed PSBT
 *  bytes returned by `signPsbt`). */
const base64ToBytes = (input: string): Uint8Array => {
  const binary = atob(input);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.codePointAt(i) ?? 0;
  }
  return out;
};

/** Decode a hex string (with or without a leading `0x`) into raw bytes.
 *  Used to turn `signMessage`'s hex signature response into the
 *  `Uint8Array` butr's contract returns. */
const hexToBytes = (input: string): Uint8Array => {
  const clean = input.startsWith("0x") ? input.slice(2) : input;
  if (clean.length % 2 !== 0) {
    throw new TypeError("Invalid hex: odd length");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    const byte = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) {
      throw new TypeError(`Invalid hex character at offset ${i * 2}`);
    }
    out[i] = byte;
  }
  return out;
};

/** Parse a CAIP-10 string (`bip122:<chain>:<address>`) into the address
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
  return session?.namespaces?.["bip122"]?.accounts ?? [];
};

const buildBitcoinChain = (chainId: string, walletName: string): ChainBase => ({
  id: chainId,
  // Same posture as the EVM / SVM / Sui sides: butr doesn't ship a
  // chain-id → name table. Consumers overlay via structural typing.
  name: walletName,
  namespace: "bip122",
  reference: chainId.slice(BITCOIN_PREFIX.length),
});

const buildBitcoinAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

/** Coerce butr's `unknown` tx into the base64 PSBT string the bip122
 *  `signPsbt` method expects. Consumers pass either a base64 string
 *  (already serialized by their PSBT library) or a `Uint8Array` of raw
 *  PSBT bytes (e.g. `psbt.toBuffer()` from bitcoinjs-lib). */
const coercePsbtToBase64 = (tx: unknown): string => {
  if (typeof tx === "string") {
    return tx;
  }
  if (tx instanceof Uint8Array) {
    return bytesToBase64(tx);
  }
  throw new TypeError(
    "Bitcoin signTransaction expects a base64-encoded PSBT string or Uint8Array of PSBT bytes",
  );
};

/**
 * Bitcoin (CAIP `bip122:*`) namespace builder. Wraps the paired
 * `UniversalProvider` and routes calls through the WalletConnect v2
 * Bitcoin RPC methods:
 *
 *  - `signMessage`  → `signMessage`     (returns hex signature)
 *  - `signPsbt`     → `signTransaction` (PSBT in, signed PSBT out)
 *  - `signPsbt`     → `sendTx` (with `broadcast: true`, returns txid)
 *
 * **Caveats.** The bip122 namespace is younger than eip155/solana/sui
 * and the wire format is still settling. Reown's reference uses
 * unprefixed camelCase methods (`signPsbt`, not `bip122_signPsbt`) but
 * a prefixed event channel (`bip122_addressesChanged`). The adapter
 * follows the Reown spec; verify end-to-end against your target
 * wallets before relying on this in production.
 *
 * `signTransaction` returns the signed PSBT bytes (base64-decoded).
 * butr ships no Bitcoin RPC, so the consumer finalises and broadcasts
 * those bytes through their own Esplora / Electrum client.
 *
 * `sendTx` is mapped to `signPsbt` with `broadcast: true` rather than
 * `sendTransfer` — `sendTransfer` is a high-level "build + send N sats
 * to address" UX flow that takes recipient/amount, not a raw tx the
 * consumer has already built. `signPsbt` with broadcast preserves
 * butr's `sendTx(tx: unknown) → txid` contract for consumers that
 * built the PSBT themselves.
 *
 * `subscribe` is a no-op for v0 — wallet events over WC are mediated by
 * the provider and need per-wallet quirks the namespace builder
 * shouldn't own. Consumers wire native events themselves until we
 * land a follow-up.
 *
 * **Out of scope.** UTXO selection, fee estimation, address discovery
 * (via `getAccountAddresses` for ordinal/payment intents), and xpub /
 * multi-address sessions are tracked follow-ups; the namespace builder
 * here exposes the address from the WC session as-is.
 */
const bitcoinNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider }) {
    let currentChainId = chains[0] ?? DEFAULT_CHAINS[0] ?? BITCOIN_MAINNET;
    const currentChain = (): ChainBase => buildBitcoinChain(currentChainId, name);

    const resolveAccounts = (): Array<Account> => {
      const chain = currentChain();
      return readSessionAccounts(provider).map((caip10) =>
        buildBitcoinAccount(parseCaip10Address(caip10), chain),
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
        throw new Error("No connected Bitcoin account");
      }
      return first.walletAddress;
    };

    const adapter: BitcoinAdapter = {
      capabilities: WALLETCONNECT_BITCOIN_CAPABILITIES,
      chainPlatform: "bitcoin",

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
            bip122: {
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
        // Consumers wrap their own Esplora / Electrum client for real
        // balances.
        return Promise.resolve({
          decimals: BITCOIN_DECIMALS,
          formatted: "0",
          symbol: "BTC",
          value: 0n,
        });
      },

      getSigner() {
        // Hand back the raw provider; consumers narrow at use sites.
        return Promise.resolve(provider);
      },

      getTransactionReceipt() {
        // No RPC. Mirror the wallet-standard Bitcoin adapter's stance.
        return Promise.resolve({ status: "Pending" as const });
      },

      icon,
      id,
      name,

      async sendTx(tx, account) {
        const address = resolveAddress(account);
        const psbt = coercePsbtToBase64(tx);
        // Map sendTx → signPsbt with broadcast:true. `sendTransfer` is
        // the wrong primitive here; it asks for a recipient + amount
        // rather than a pre-built tx, which doesn't fit butr's
        // `sendTx(tx: unknown)` contract. See namespace docblock.
        const result = (await provider.request({
          method: "signPsbt",
          params: { account: address, broadcast: true, psbt, signInputs: [] },
        })) as { psbt?: string; txid?: string } | string;
        // Spec says `{ psbt, txid? }`. Tolerate a bare string too —
        // some wallets short-circuit to the txid directly.
        const txid = typeof result === "string" ? result : result?.txid;
        if (!txid) {
          throw new Error("signPsbt with broadcast:true returned no txid");
        }
        return txid;
      },

      sendTxToChain(tx, _targetChainId, account, cb) {
        // WC Bitcoin's signPsbt doesn't take a per-call chain
        // parameter — the network is baked into the pairing. Honour
        // the current chain and let consumers route per-chain higher
        // up if they need multi-network support.
        cb?.();
        return this.sendTx(tx, account);
      },

      async signMessage(msg, account) {
        const address = resolveAddress(account);
        // bip122 `signMessage` takes a plain string `message`. butr's
        // contract is `Uint8Array`; encode to a UTF-8 string when the
        // bytes are valid UTF-8, otherwise fall back to base64 so the
        // wallet can still receive arbitrary binary input.
        let message: string;
        try {
          message = new TextDecoder("utf-8", { fatal: true }).decode(msg);
        } catch {
          message = bytesToBase64(msg);
        }
        const result = (await provider.request({
          method: "signMessage",
          params: { account: address, address, message },
        })) as { address?: string; signature?: string } | string;
        const signatureHex = typeof result === "string" ? result : result?.signature;
        if (!signatureHex) {
          throw new Error("signMessage returned no signature");
        }
        return { signature: hexToBytes(signatureHex), signedMessage: msg };
      },

      async signTransaction(tx, account) {
        const address = resolveAddress(account);
        const psbt = coercePsbtToBase64(tx);
        // signInputs left empty: wallets default to signing every
        // input the active address owns. Callers that need fine-
        // grained per-input control can pre-encode the PSBT with the
        // appropriate inputs and route through `getSigner()` later.
        const result = (await provider.request({
          method: "signPsbt",
          params: { account: address, broadcast: false, psbt, signInputs: [] },
        })) as { psbt?: string; txid?: string } | string;
        const signedPsbt = typeof result === "string" ? result : result?.psbt;
        if (!signedPsbt) {
          throw new Error("signPsbt returned no psbt");
        }
        return base64ToBytes(signedPsbt);
      },

      subscribe() {
        // v0: no-op. WC wallet-side events are mediated by the provider
        // and need per-wallet quirks the namespace builder shouldn't own.
        return () => {};
      },

      switchChain(chain) {
        if (chain.namespace !== "bip122") {
          throw new Error(
            `Bitcoin WC adapter received non-Bitcoin chain "${chain.id}". Pass a chain with namespace "bip122".`,
          );
        }
        // Local state only — the WC session's chain list is fixed at
        // pair time, so this updates butr's view of "active network"
        // without re-negotiating with the wallet.
        currentChainId = chain.id;
        return Promise.resolve();
      },
    };

    return adapter;
  },
  caipPrefix: "bip122",
  chainPlatform: "bitcoin",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { WALLETCONNECT_BITCOIN_CAPABILITIES, bitcoinNamespace };
