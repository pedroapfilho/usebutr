import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { bytesToHexPrefixed } from "@usebutr/core";

import { createLedgerAdapterCore } from "../adapter-core";
import { LEDGER_SIGN_TRANSACTION_CAPABILITIES } from "../capabilities";
import type { TransportFactory } from "../transport";

/**
 * Minimal type surface for `@ledgerhq/hw-app-sui` (which extends
 * `@mysten/ledgerjs-hw-app-sui`). Declared inline so butr's typecheck
 * pipeline doesn't depend on the optional peer dep being installed.
 * Real Ledger Sui app instances satisfy this shape.
 *
 * Notes:
 *  - `getPublicKey` returns BOTH the 32-byte ed25519 public key AND the
 *    32-byte Sui address. The device computes the address (blake2b of
 *    `0x00 || pubkey`) on-device, so we just hex-encode the bytes with
 *    a `0x` prefix to produce the Sui address string explorers + RPCs
 *    use. No host-side blake2b needed.
 *  - `signTransaction` signs the BCS-serialized transaction message and
 *    returns only the raw signature bytes. The adapter combines those
 *    bytes with the public key into Sui's serialized signature envelope.
 *  - There is **no `signPersonalMessage`** on the Ledger Sui app at this
 *    version; Ledger's Sui app supports transaction signing only.
 *    Capabilities reflect this with `signMessage: false`, and the
 *    adapter's `signMessage` method rejects.
 */
type SuiAppLike = {
  getPublicKey: (
    path: string,
    displayOnDevice?: boolean,
  ) => Promise<{ address: Uint8Array; publicKey: Uint8Array }>;
  signTransaction: (path: string, txn: Uint8Array) => Promise<{ signature: Uint8Array }>;
};

type SuiAppConstructor = new (transport: unknown) => SuiAppLike;

type SuiCluster = "mainnet" | "testnet" | "devnet" | "localnet";

/**
 * Sui coin type 784. Five fully-hardened segments per Sui Wallet's
 * standard convention: `44'/784'/account'/change'/address'`. The last
 * hardened segment varies with the account index in `getAccounts(n)`.
 */
const DEFAULT_DERIVATION_PATH_PREFIX = "44'/784'/0'/0'";
const DEFAULT_CLUSTER: SuiCluster = "mainnet";
const ED25519_SCHEME_FLAG = 0;
const ED25519_PUBLIC_KEY_LENGTH = 32;
const ED25519_SIGNATURE_LENGTH = 64;

const serializeEd25519Signature = (signature: Uint8Array, publicKey: Uint8Array): Uint8Array => {
  if (signature.length !== ED25519_SIGNATURE_LENGTH) {
    throw new Error(
      `[butr/ledger] Sui app returned a ${signature.length}-byte signature; expected ${ED25519_SIGNATURE_LENGTH}`,
    );
  }
  if (publicKey.length !== ED25519_PUBLIC_KEY_LENGTH) {
    throw new Error(
      `[butr/ledger] Sui app returned a ${publicKey.length}-byte public key; expected ${ED25519_PUBLIC_KEY_LENGTH}`,
    );
  }
  const serialized = new Uint8Array(1 + ED25519_SIGNATURE_LENGTH + ED25519_PUBLIC_KEY_LENGTH);
  serialized[0] = ED25519_SCHEME_FLAG;
  serialized.set(signature, 1);
  serialized.set(publicKey, 1 + ED25519_SIGNATURE_LENGTH);
  return serialized;
};

const loadSui = async (): Promise<SuiAppConstructor> => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- untyped optional peer-dep module boundary
  const mod = (await import("@ledgerhq/hw-app-sui")) as unknown as {
    default?: SuiAppConstructor;
    Sui?: SuiAppConstructor;
  };
  const ctor = mod.default ?? mod.Sui;
  if (!ctor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-sui: install it as an optional peer dep",
    );
  }
  return ctor;
};

/**
 * Sui-specific Ledger adapter options. Each option is **fully typed for
 * the Sui platform**; no opaque DI bag, no `unknown` chain hints.
 */
type SuiLedgerOptions = {
  /**
   * How many accounts to enumerate via `getAccounts()`. Each path walk
   * hits the device (~1-2 s per address), so larger values are slow.
   * Default: 1.
   */
  accountCount?: number;
  /**
   * Sui cluster shortname. Stored locally; Ledger has no internal
   * "current cluster" concept; the cluster only affects the ChainBase
   * id butr surfaces to consumers. `switchChain` updates this value.
   * Default: `"mainnet"`.
   */
  cluster?: SuiCluster;
  /**
   * BIP-32 derivation path *prefix*. `getAccounts(n)` appends `/N'`
   * (fully-hardened per Sui Wallet convention).
   * Default: `"44'/784'/0'/0'"`.
   */
  derivationPathPrefix?: string;
  /** Override the wallet icon shown in pickers. */
  icon?: string;
  /** Override the connector id. Default `"ledger"`. */
  id?: string;
  /** Override the wallet name. Default `"Ledger"`. */
  name?: string;
  /** Discriminant for the main `createLedgerAdapter` dispatch. */
  platform: "sui";
  /**
   * DI override for the `Sui` app constructor (tests). When omitted,
   * the factory dynamic-imports `@ledgerhq/hw-app-sui`.
   */
  sui?: SuiAppConstructor;
  /**
   * DI override for the WebUSB transport factory (tests). When
   * omitted, the factory dynamic-imports `@ledgerhq/hw-transport-webusb`.
   */
  transport?: TransportFactory;
};

const buildSuiChain = (cluster: SuiCluster, walletName: string): ChainBase => ({
  id: `sui:${cluster}`,
  name: walletName,
  namespace: "sui",
  reference: cluster,
});

const buildSuiAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

/**
 * Build a Ledger hardware-wallet adapter wired to the **Sui app**. The
 * returned adapter is fully-formed but UN-paired; pairing happens when
 * butr's runtime calls `adapter.connect()`, at which point the browser
 * shows the WebUSB permission prompt and the user unlocks their Ledger
 * and opens the Sui app.
 *
 * Most consumers go through `createLedgerAdapter` in `adapter.ts`,
 * which dispatches by `platform` field.
 *
 * **Signing model.** `signTransaction` signs BCS-serialized Sui
 * transaction bytes and returns the bytes with Sui's serialized Ed25519
 * signature envelope.
 *
 * **No off-chain signing.** Ledger's Sui app does NOT implement a
 * `signPersonalMessage` instruction at this app version, so
 * `capabilities.signMessage` is `false` and the adapter's `signMessage`
 * rejects. Off-chain auth flows should fall back to a non-hardware
 * wallet.
 *
 * **No broadcast.** `sendTx` rejects; Ledger has no RPC. The consumer
 * broadcasts the assembled transaction through their own Sui RPC client.
 */
const createSuiLedgerAdapter = (options: SuiLedgerOptions): Promise<WalletAdapter> => {
  const capabilities = { ...LEDGER_SIGN_TRANSACTION_CAPABILITIES, signMessage: false };

  let cluster: SuiCluster = options.cluster ?? DEFAULT_CLUSTER;

  const core = createLedgerAdapterCore<SuiAppLike>({
    accountCount: options.accountCount,
    addressAt: async (sui, path) => {
      const result = await sui.getPublicKey(path);
      return bytesToHexPrefixed(new Uint8Array(result.address));
    },
    derivationPathPrefix: options.derivationPathPrefix ?? DEFAULT_DERIVATION_PATH_PREFIX,
    getBalanceHint: "Use @mysten/sui's SuiClient with your own RPC URL.",
    icon: options.icon,
    id: options.id,
    loadApp: async () => {
      const SuiApp = options.sui ?? (await loadSui());
      return (transport) => new SuiApp(transport);
    },
    name: options.name,
    pathAt: (prefix, index) => `${prefix}/${index}'`,
    sendTxHint: "Use signTransaction + @mysten/sui's SuiClient.",
    switchAccountHint: "signTransaction(tx, account)",
    transport: options.transport,
  });

  const currentChain = (): ChainBase => buildSuiChain(cluster, core.name);

  const adapter: WalletAdapter = {
    capabilities,
    chainPlatform: "sui",
    connect: core.connect,
    disconnect: core.disconnect,

    getAccount: () => {
      const address = core.currentAddress();
      return Promise.resolve(address === null ? null : buildSuiAccount(address, currentChain()));
    },

    async getAccounts() {
      const chain = currentChain();
      const addresses = await core.listAddresses();
      return addresses.map((address) => buildSuiAccount(address, chain));
    },

    getBalance: core.getBalance,
    getSigner: core.getSigner,
    getTransactionReceipt: core.getTransactionReceipt,
    icon: core.icon,
    id: core.id,
    name: core.name,
    sendTx: core.sendTx,
    sendTxToChain: core.sendTxToChain,

    signMessage: () =>
      Promise.reject(
        new Error(
          "[butr/ledger] signMessage not supported: Ledger's Sui app exposes no off-chain message signing instruction. Use a non-hardware wallet for off-chain auth flows.",
        ),
      ),

    async signTransaction(tx, account) {
      const sui = core.requireApp();
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "[butr/ledger] signTransaction expects a Uint8Array (BCS-serialized Sui transaction).",
        );
      }
      const path = await core.resolvePath(account);
      const publicKey = await sui.getPublicKey(path);
      const result = await sui.signTransaction(path, tx);
      return {
        bytes: tx,
        signature: serializeEd25519Signature(
          new Uint8Array(result.signature),
          new Uint8Array(publicKey.publicKey),
        ),
      };
    },

    subscribe: core.subscribe,
    switchAccount: core.switchAccount,

    switchChain: (chain) => {
      if (chain.namespace !== "sui") {
        return Promise.reject(
          new Error(
            `[butr/ledger] received non-Sui chain "${chain.id}". Pass a chain with namespace "sui".`,
          ),
        );
      }
      if (
        chain.reference !== "mainnet" &&
        chain.reference !== "testnet" &&
        chain.reference !== "devnet" &&
        chain.reference !== "localnet"
      ) {
        return Promise.reject(
          new Error(
            `[butr/ledger] unsupported Sui cluster "${chain.reference}". Expected "mainnet" | "testnet" | "devnet" | "localnet".`,
          ),
        );
      }
      cluster = chain.reference;
      return Promise.resolve();
    },
  };

  return Promise.resolve(adapter);
};

export type { SuiAppConstructor, SuiAppLike, SuiCluster, SuiLedgerOptions };
export { LEDGER_ICON as LEDGER_SUI_DEFAULT_ICON } from "../adapter-core";
export { createSuiLedgerAdapter, serializeEd25519Signature };
