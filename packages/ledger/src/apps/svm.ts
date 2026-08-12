import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { bytesToBase58 } from "@usebutr/core";

import { createLedgerAdapterCore } from "../adapter-core";
import { LEDGER_SIGN_TRANSACTION_CAPABILITIES } from "../capabilities";
import type { TransportFactory } from "../transport";

/**
 * Minimal type surface for `@ledgerhq/hw-app-solana`. Declared inline so
 * butr's typecheck pipeline doesn't depend on the optional peer dep
 * being installed. Real Ledger Solana app instances satisfy this shape.
 *
 * Notes:
 *  - The real SDK returns a Node `Buffer`, but `Buffer extends Uint8Array`
 *    so the narrower `Uint8Array` type works in both browser and Node
 *    contexts without requiring `@types/node` (we ship a browser-first
 *    package; Buffer isn't a global in browsers).
 *  - `getAddress` returns the raw 32-byte Solana public key. The caller
 *    base58-encodes it to produce the wallet address string Solana RPCs /
 *    explorers use.
 *  - `signTransaction` signs a pre-serialized transaction message. The
 *    device returns ONLY the signature; assembling the final signed tx
 *    (slotting the signature into the transaction's signatures array) is
 *    on the consumer; same as Ledger Live and most Solana wallets.
 *  - `signOffchainMessage` is the off-chain message signing path; it's
 *    what `signMessage` routes through.
 */
type SolanaAppLike = {
  getAddress: (path: string, display?: boolean) => Promise<{ address: Uint8Array }>;
  signOffchainMessage: (path: string, message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction: (path: string, txBuffer: Uint8Array) => Promise<{ signature: Uint8Array }>;
};

type SolanaAppConstructor = new (transport: unknown) => SolanaAppLike;

type SolanaCluster = "mainnet" | "devnet" | "testnet";

/** Solana coin type 501; full-hardened path per Solana convention. */
const DEFAULT_DERIVATION_PATH_PREFIX = "44'/501'/0'";
const DEFAULT_CLUSTER: SolanaCluster = "mainnet";

const loadSolana = async (): Promise<SolanaAppConstructor> => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- untyped optional peer-dep module boundary
  const mod = (await import("@ledgerhq/hw-app-solana")) as unknown as {
    default?: SolanaAppConstructor;
    Solana?: SolanaAppConstructor;
  };
  const ctor = mod.default ?? mod.Solana;
  if (!ctor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-solana: install it as an optional peer dep",
    );
  }
  return ctor;
};

/**
 * SVM-specific Ledger adapter options. Each option is **fully typed
 * for the Solana platform**; no opaque DI bag, no `unknown` chain hints.
 */
type SvmLedgerOptions = {
  /**
   * How many accounts to enumerate via `getAccounts()`. Each path walk
   * hits the device (~1-2 s per address), so larger values are slow.
   * Default: 1.
   */
  accountCount?: number;
  /**
   * Solana cluster shortname. Stored locally; Ledger has no internal
   * "current cluster" concept; the cluster only affects the ChainBase
   * id butr surfaces to consumers. `switchChain` updates this value.
   * Default: `"mainnet"`.
   */
  cluster?: SolanaCluster;
  /**
   * BIP-32 derivation path *prefix*. `getAccounts(n)` appends `/N'`
   * (fully-hardened per Solana convention). Default: `"44'/501'/0'"`.
   */
  derivationPathPrefix?: string;
  /** Override the wallet icon shown in pickers. */
  icon?: string;
  /** Override the connector id. Default `"ledger"`. */
  id?: string;
  /** Override the wallet name. Default `"Ledger"`. */
  name?: string;
  /** Discriminant for the main `createLedgerAdapter` dispatch. */
  platform: "svm";
  /**
   * DI override for the `Solana` app constructor (tests). When omitted,
   * the factory dynamic-imports `@ledgerhq/hw-app-solana`.
   */
  solana?: SolanaAppConstructor;
  /**
   * DI override for the WebUSB transport factory (tests). When
   * omitted, the factory dynamic-imports `@ledgerhq/hw-transport-webusb`.
   */
  transport?: TransportFactory;
};

const buildSolanaChain = (cluster: SolanaCluster, walletName: string): ChainBase => ({
  id: `solana:${cluster}`,
  name: walletName,
  namespace: "solana",
  reference: cluster,
});

const buildSolanaAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

/**
 * Build a Ledger hardware-wallet adapter wired to the **Solana app**.
 * The returned adapter is fully-formed but UN-paired; pairing happens
 * when butr's runtime calls `adapter.connect()`, at which point the
 * browser shows the WebUSB permission prompt and the user unlocks
 * their Ledger and opens the Solana app.
 *
 * Most consumers go through `createLedgerAdapter` in `adapter.ts`,
 * which dispatches by `platform` field.
 *
 * **Signing model.** `signMessage` routes through Solana's off-chain
 * message signing (`signOffchainMessage`) and returns
 * `{ signature, signedMessage }` as butr expects. `signTransaction`
 * returns ONLY the 64-byte ed25519 signature bytes; the consumer
 * assembles the final signed transaction by slotting that signature
 * into the transaction's `signatures` array (use `@solana/kit`'s
 * `partiallySignTransaction` or the legacy `Transaction.addSignature`
 * on `@solana/web3.js`). This matches how Ledger Live and most Solana
 * wallets work.
 *
 * **No broadcast.** `sendTx` rejects; Ledger has no RPC. The consumer
 * broadcasts the assembled transaction through their own Solana RPC
 * client.
 */
const createSvmLedgerAdapter = (options: SvmLedgerOptions): Promise<WalletAdapter> => {
  let cluster: SolanaCluster = options.cluster ?? DEFAULT_CLUSTER;

  const core = createLedgerAdapterCore<SolanaAppLike>({
    accountCount: options.accountCount,
    addressAt: async (solana, path) => {
      const result = await solana.getAddress(path);
      return bytesToBase58(new Uint8Array(result.address));
    },
    derivationPathPrefix: options.derivationPathPrefix ?? DEFAULT_DERIVATION_PATH_PREFIX,
    getBalanceHint: "Use @solana/kit or @solana/web3.js with your own RPC URL.",
    icon: options.icon,
    id: options.id,
    loadApp: async () => {
      const SolanaApp = options.solana ?? (await loadSolana());
      return (transport) => new SolanaApp(transport);
    },
    name: options.name,
    pathAt: (prefix, index) => `${prefix}/${index}'`,
    sendTxHint: "Use signTransaction + @solana/kit / @solana/web3.js.",
    switchAccountHint: "signMessage(msg, account)",
    transport: options.transport,
  });

  const currentChain = (): ChainBase => buildSolanaChain(cluster, core.name);

  const adapter: WalletAdapter = {
    capabilities: LEDGER_SIGN_TRANSACTION_CAPABILITIES,
    chainPlatform: "svm",
    connect: core.connect,
    disconnect: core.disconnect,

    getAccount: () => {
      const address = core.currentAddress();
      return Promise.resolve(address === null ? null : buildSolanaAccount(address, currentChain()));
    },

    async getAccounts() {
      const chain = currentChain();
      const addresses = await core.listAddresses();
      return addresses.map((address) => buildSolanaAccount(address, chain));
    },

    getBalance: core.getBalance,
    getSigner: core.getSigner,
    getTransactionReceipt: core.getTransactionReceipt,
    icon: core.icon,
    id: core.id,
    name: core.name,
    sendTx: core.sendTx,
    sendTxToChain: core.sendTxToChain,

    async signMessage(message, account) {
      const solana = core.requireApp();
      const path = await core.resolvePath(account);
      const result = await solana.signOffchainMessage(path, message);
      return { signature: new Uint8Array(result.signature), signedMessage: message };
    },

    /**
     * Sign a serialized Solana transaction. Returns the raw 64-byte
     * ed25519 signature. The consumer is responsible for assembling
     * the final signed transaction by slotting this signature into
     * the transaction's signatures array: `@solana/kit`'s
     * `partiallySignTransaction(...)` or `@solana/web3.js`'s
     * `Transaction.addSignature` both do this. Mirrors how Ledger
     * Live + every Solana wallet ships this surface.
     */
    async signTransaction(tx, account) {
      const solana = core.requireApp();
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "[butr/ledger] signTransaction expects a Uint8Array (serialized Solana transaction).",
        );
      }
      const path = await core.resolvePath(account);
      const result = await solana.signTransaction(path, tx);
      return new Uint8Array(result.signature);
    },

    subscribe: core.subscribe,
    switchAccount: core.switchAccount,

    switchChain: (chain) => {
      if (chain.namespace !== "solana") {
        return Promise.reject(
          new Error(
            `[butr/ledger] received non-Solana chain "${chain.id}". Pass a chain with namespace "solana".`,
          ),
        );
      }
      if (
        chain.reference !== "mainnet" &&
        chain.reference !== "devnet" &&
        chain.reference !== "testnet"
      ) {
        return Promise.reject(
          new Error(
            `[butr/ledger] unsupported Solana cluster "${chain.reference}". Expected "mainnet" | "devnet" | "testnet".`,
          ),
        );
      }
      cluster = chain.reference;
      return Promise.resolve();
    },
  };

  return Promise.resolve(adapter);
};

export type { SolanaAppConstructor, SolanaAppLike, SolanaCluster, SvmLedgerOptions };
export { LEDGER_ICON as LEDGER_SVM_DEFAULT_ICON } from "../adapter-core";
export { createSvmLedgerAdapter };
