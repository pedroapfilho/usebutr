import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { bytesToBase58 } from "@usebutr/core";

import { createLedgerAdapterCore } from "../adapter-core";
import { LEDGER_SIGN_TRANSACTION_CAPABILITIES } from "../capabilities";
import type { TransportFactory, TransportLike } from "../transport";

/**
 * Declared inline so butr's typecheck doesn't depend on the optional peer dep.
 * The SDK's Node `Buffer`s are typed as `Uint8Array` so this browser-first
 * package needs no `@types/node`. `getAddress` yields a raw 32-byte key.
 */
type SolanaAppLike = {
  getAddress: (path: string, display?: boolean) => Promise<{ address: Uint8Array }>;
  signOffchainMessage: (path: string, message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction: (path: string, txBuffer: Uint8Array) => Promise<{ signature: Uint8Array }>;
};

type SolanaAppConstructor = new (transport: TransportLike) => SolanaAppLike;

type SolanaCluster = "mainnet" | "devnet" | "testnet";

/** Solana coin type 501; full-hardened path per Solana convention. */
const DEFAULT_DERIVATION_PATH_PREFIX = "44'/501'/0'";
const DEFAULT_CLUSTER: SolanaCluster = "mainnet";

const loadSolana = async (): Promise<SolanaAppConstructor> => {
  const imported: unknown = await import("@ledgerhq/hw-app-solana");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: The supported peer range exports the Solana app constructor under default or Solana.
  const moduleValue = imported as {
    default?: SolanaAppConstructor;
    Solana?: SolanaAppConstructor;
  };
  const constructor = moduleValue.default ?? moduleValue.Solana;
  if (!constructor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-solana: install it as an optional peer dep",
    );
  }
  return constructor;
};

/** SVM-specific Ledger adapter options. */
type SvmLedgerOptions = {
  /** Each path walk hits the device (~1-2 s per address), so larger values are
   *  slow. Default: 1. */
  accountCount?: number;
  /** Ledger has no internal "current cluster", so this is stored locally and
   *  only affects the ChainBase id butr surfaces. Default: `"mainnet"`. */
  cluster?: SolanaCluster;
  /** `getAccounts(n)` appends `/N'`, fully-hardened per Solana convention.
   *  Default: `"44'/501'/0'"`. */
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
 * The returned adapter is UN-paired: pairing happens on `adapter.connect()`,
 * when the browser prompts for WebUSB and the user opens the Solana app.
 * Ledger has no RPC, so `sendTx` rejects and the consumer broadcasts.
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
     * Returns only the raw 64-byte ed25519 signature, as Ledger Live and every
     * Solana wallet do. The consumer assembles the signed transaction by
     * slotting it into the signatures array.
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
export { createSvmLedgerAdapter };
