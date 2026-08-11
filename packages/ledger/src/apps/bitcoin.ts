import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { bytesToHex, hexToBytes } from "@usebutr/core";

import { createLedgerAdapterCore } from "../adapter-core";
import { LEDGER_SIGN_TRANSACTION_CAPABILITIES } from "../capabilities";
import type { TransportFactory } from "../transport";

/**
 * Bitcoin address format, mirroring `@ledgerhq/hw-app-btc`'s `AddressFormat`.
 * Re-declared inline so butr's typecheck doesn't depend on the optional peer
 * dep being installed.
 *
 *  - `"legacy"`   → P2PKH, BIP-44, paths like `44'/0'/0'/0/0`
 *  - `"p2sh"`     → P2SH-wrapped SegWit, BIP-49, paths like `49'/0'/0'/0/0`
 *  - `"bech32"`   → native SegWit (P2WPKH), BIP-84, paths like `84'/0'/0'/0/0`
 *  - `"bech32m"`  → Taproot (P2TR), BIP-86, paths like `86'/0'/0'/0/0`
 */
type BitcoinAddressFormat = "legacy" | "p2sh" | "bech32" | "bech32m";

/**
 * Options for the Bitcoin app's PSBT signing entry point. Mirrors the public
 * surface of `@ledgerhq/hw-app-btc`'s `signPsbtBuffer` so we don't depend on
 * the peer dep's types at typecheck time. Bitcoin-protocol bytes (Buffer)
 * are typed as `Uint8Array` because `Buffer extends Uint8Array` in Node and
 * the package's runtime polyfills Buffer in browsers via standard bundler
 * shims.
 */
type BitcoinSignPsbtOptions = {
  /** BIP-32 account path, e.g. `"m/84'/0'/0'"` or `"84'/0'/0'"`. */
  accountPath: string;
  /** Address format the device should use when deriving signing keys. */
  addressFormat: BitcoinAddressFormat;
  /**
   * When `true`, the device returns a fully-signed transaction in `tx`. When
   * `false`, only the partially-signed PSBT is returned and the consumer
   * finalises + broadcasts via their own Bitcoin client.
   */
  finalizePsbt: boolean;
  /**
   * Map from scriptPubKey hash (hex) to `{ pubkey, path }`. Only consulted
   * when the PSBT is missing BIP-32 derivation data. Well-formed PSBTs
   * supply derivations via `PSBT_IN_BIP32_DERIVATION`, so passing an empty
   * Map (the default) is fine for consumers using wallets that populate the
   * PSBT correctly.
   */
  knownAddressDerivations: Map<string, { path: Array<number>; pubkey: Uint8Array }>;
};

/**
 * Minimal type surface for `@ledgerhq/hw-app-btc`. Declared inline so butr's
 * typecheck pipeline doesn't depend on the optional peer dep being installed.
 * Real Ledger Btc app instances satisfy this shape.
 *
 * Notes:
 *  - The constructor changed in v10+ from `new Btc(transport)` to
 *    `new Btc({ transport, currency })`. We use the modern form.
 *  - `signMessage` takes a HEX-encoded message string (legacy Bitcoin
 *    convention) and returns `{ v, r, s }` as hex strings.
 *  - `signPsbtBuffer` is the modern (Bitcoin app v2.1+) PSBT signing entry.
 *    It takes a raw PSBT (v0 or v2) and returns `{ psbt, tx? }` where `psbt`
 *    is the signed PSBT bytes. We default `finalizePsbt: false` so the
 *    consumer finalises + broadcasts through their own client (matches the
 *    WalletConnect `bitcoin:signPsbt` contract).
 */
type BtcAppLike = {
  getWalletPublicKey: (
    path: string,
    opts?: { format?: BitcoinAddressFormat; verify?: boolean },
  ) => Promise<{ bitcoinAddress: string; chainCode: string; publicKey: string }>;
  signMessage: (path: string, messageHex: string) => Promise<{ r: string; s: string; v: number }>;
  signPsbtBuffer: (
    psbtBuffer: Uint8Array,
    options: BitcoinSignPsbtOptions,
  ) => Promise<{ psbt: Uint8Array; tx?: string }>;
};

type BtcAppConstructor = new (args: { currency?: string; transport: unknown }) => BtcAppLike;

/**
 * Default Bitcoin chain CAIP-2 reference (mainnet genesis block hash). The
 * `bip122:<32-hex>` shape is what BIP-122 / CAIP-2 standardised for Bitcoin.
 */
const DEFAULT_CHAIN_ID = "bip122:000000000019d6689c085ae165831e93";

/**
 * Native SegWit (BIP-84) mainnet derivation prefix. The factory appends the
 * account index as the last (non-hardened) segment so `0` → `84'/0'/0'/0/0`.
 * Override via `derivationPathPrefix` for legacy / Taproot / testnet paths.
 */
const DEFAULT_DERIVATION_PATH_PREFIX = "84'/0'/0'/0";
const DEFAULT_ADDRESS_FORMAT: BitcoinAddressFormat = "bech32";

const loadBtc = async (): Promise<BtcAppConstructor> => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- untyped optional peer-dep module boundary
  const mod = (await import("@ledgerhq/hw-app-btc")) as unknown as {
    Btc?: BtcAppConstructor;
    default?: BtcAppConstructor;
  };
  const ctor = mod.default ?? mod.Btc;
  if (!ctor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-btc: install it as an optional peer dep",
    );
  }
  return ctor;
};

/**
 * Bitcoin-specific Ledger adapter options. Each option is **fully typed for
 * the Bitcoin platform**; no opaque DI bag, no `unknown` chain hints.
 */
type BitcoinLedgerOptions = {
  /**
   * How many accounts to enumerate via `getAccounts()`. Each path walk hits
   * the device (~1-2 s per address), so larger values are slow. Default: 1.
   */
  accountCount?: number;
  /**
   * Address format the device derives. Default `"bech32"` (native SegWit,
   * pairs with BIP-84 `84'/0'` paths). Use `"legacy"` for BIP-44 `44'/0'`,
   * `"p2sh"` for BIP-49 `49'/0'`, or `"bech32m"` for Taproot BIP-86
   * `86'/0'`. The format and the derivation path prefix should agree per
   * BIP convention, but the adapter doesn't police that; the device will.
   */
  addressFormat?: BitcoinAddressFormat;
  /**
   * DI override for the `Btc` app constructor (tests). When omitted, the
   * factory dynamic-imports `@ledgerhq/hw-app-btc`.
   */
  btc?: BtcAppConstructor;
  /**
   * CAIP-2 chain id this adapter signs against. Stored locally; Ledger has
   * no internal "current chain" concept; the chain only affects the
   * ChainBase id butr surfaces. `switchChain` updates this value. Default:
   * mainnet (`"bip122:000000000019d6689c085ae165831e93"`).
   */
  chainId?: string;
  /**
   * BIP-32 derivation path *prefix*. `getAccounts(n)` appends the account
   * index as the last (non-hardened) segment. Default:
   * `"84'/0'/0'/0"` (BIP-84 native SegWit mainnet). Override for legacy
   * / p2sh / taproot / testnet paths.
   */
  derivationPathPrefix?: string;
  /** Override the wallet icon shown in pickers. */
  icon?: string;
  /** Override the connector id. Default `"ledger"`. */
  id?: string;
  /**
   * DI override for the Btc app loader (tests / custom packaging). Takes
   * precedence over `btc`.
   */
  loadBtc?: () => Promise<BtcAppConstructor>;
  /** Override the wallet name. Default `"Ledger"`. */
  name?: string;
  /** Discriminant for the main `createLedgerAdapter` dispatch. */
  platform: "bitcoin";
  /**
   * DI override for the WebUSB transport factory (tests). When omitted, the
   * factory dynamic-imports `@ledgerhq/hw-transport-webusb`.
   */
  transport?: TransportFactory;
};

const buildBitcoinChain = (chainId: string, walletName: string): ChainBase => {
  const colonIndex = chainId.indexOf(":");
  const namespace = colonIndex === -1 ? "bip122" : chainId.slice(0, colonIndex);
  const reference = colonIndex === -1 ? chainId : chainId.slice(colonIndex + 1);
  return {
    id: chainId,
    name: walletName,
    namespace,
    reference,
  };
};

const buildBitcoinAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

/**
 * Build a Ledger hardware-wallet adapter wired to the **Bitcoin app**. The
 * returned adapter is fully-formed but UN-paired; pairing happens when
 * butr's runtime calls `adapter.connect()`, at which point the browser shows
 * the WebUSB permission prompt and the user unlocks their Ledger and opens
 * the Bitcoin app.
 *
 * Most consumers go through `createLedgerAdapter` in `adapter.ts`, which
 * dispatches by `platform` field.
 *
 * **Signing model.** `signMessage` routes through the Bitcoin app's
 * `signMessage` instruction (the message is hex-encoded internally; Ledger's
 * Bitcoin app pre-dates the canonical "signMessage takes bytes" convention).
 * The returned `{ v, r, s }` is repacked into a 65-byte `r||s||v` signature
 * blob to match butr's `signMessage` surface.
 *
 * `signTransaction` routes through `signPsbtBuffer` (Bitcoin app v2.1+) and
 * returns the signed PSBT bytes; the consumer finalises + broadcasts
 * through their own Esplora / Electrum client. `finalizePsbt: false` so the
 * round-trip mirrors the WalletConnect `bitcoin:signPsbt` contract. The PSBT
 * itself must carry the necessary BIP-32 derivation paths
 * (`PSBT_IN_BIP32_DERIVATION`) for the device to know which key to sign
 * with; well-formed PSBTs produced by `bitcoinjs-lib`, Sparrow, Bitcoin Core,
 * etc. include these. Adapters that want to back-fill missing derivations
 * can populate `loadKnownAddressDerivations` via the Btc app directly (out
 * of scope for this factory).
 *
 * **No broadcast.** `sendTx` rejects; Ledger has no RPC. The consumer
 * broadcasts the signed PSBT (or finalised tx) through their own Bitcoin
 * client.
 *
 * **Known limitations.**
 *  - `signTransaction` does not back-fill `knownAddressDerivations` for the
 *    consumer. PSBTs without derivation hints will reject at the device.
 *  - The address format and derivation prefix must agree per BIP convention.
 *    The adapter doesn't police that; the device will produce an error if
 *    they disagree.
 */
const createBitcoinLedgerAdapter = (options: BitcoinLedgerOptions): Promise<WalletAdapter> => {
  const derivationPathPrefix = options.derivationPathPrefix ?? DEFAULT_DERIVATION_PATH_PREFIX;
  const addressFormat = options.addressFormat ?? DEFAULT_ADDRESS_FORMAT;

  let chainId = options.chainId ?? DEFAULT_CHAIN_ID;

  const core = createLedgerAdapterCore<BtcAppLike>({
    accountCount: options.accountCount,
    addressAt: async (btc, path) => {
      const result = await btc.getWalletPublicKey(path, { format: addressFormat });
      return result.bitcoinAddress;
    },
    derivationPathPrefix,
    getBalanceHint: "Use bitcoinjs-lib with an Esplora / Electrum client.",
    icon: options.icon,
    id: options.id,
    loadApp: async () => {
      const BtcApp = options.btc ?? (await (options.loadBtc ?? loadBtc)());
      return (transport) => new BtcApp({ currency: "bitcoin", transport });
    },
    name: options.name,
    pathAt: (prefix, index) => `${prefix}/${index}`,
    sendTxHint: "Use signTransaction + an Esplora / Electrum client.",
    switchAccountHint: "signMessage(msg, account)",
    transport: options.transport,
  });

  const accountPath = (): string => {
    const lastSlash = derivationPathPrefix.lastIndexOf("/");
    return lastSlash === -1 ? derivationPathPrefix : derivationPathPrefix.slice(0, lastSlash);
  };

  const currentChain = (): ChainBase => buildBitcoinChain(chainId, core.name);

  const adapter: WalletAdapter = {
    capabilities: LEDGER_SIGN_TRANSACTION_CAPABILITIES,
    chainPlatform: "bitcoin",
    connect: core.connect,
    disconnect: core.disconnect,

    getAccount: () => {
      const address = core.currentAddress();
      return Promise.resolve(
        address === null ? null : buildBitcoinAccount(address, currentChain()),
      );
    },

    async getAccounts() {
      const chain = currentChain();
      const addresses = await core.listAddresses();
      return addresses.map((address) => buildBitcoinAccount(address, chain));
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
      const btc = core.requireApp();
      const path = await core.resolvePath(account);
      const { r, s, v } = await btc.signMessage(path, bytesToHex(message));
      const sigHex = `${r.padStart(64, "0")}${s.padStart(64, "0")}${v.toString(16).padStart(2, "0")}`;
      return { signature: hexToBytes(sigHex), signedMessage: message };
    },

    /**
     * Sign a serialized PSBT (v0 or v2). Returns the signed PSBT bytes;
     * `finalizePsbt: false`, so the consumer finalises + broadcasts via
     * their own Bitcoin client. Mirrors the WalletConnect
     * `bitcoin:signPsbt` contract.
     *
     * The PSBT must carry BIP-32 derivation paths
     * (`PSBT_IN_BIP32_DERIVATION`) for every input the device should sign.
     * Well-formed PSBTs from `bitcoinjs-lib`, Sparrow, Bitcoin Core, etc.
     * include these by default. PSBTs without them will reject at the
     * device (the factory passes an empty `knownAddressDerivations` Map).
     */
    async signTransaction(tx, account) {
      const btc = core.requireApp();
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "[butr/ledger] signTransaction expects a Uint8Array (serialized PSBT v0 or v2).",
        );
      }
      await core.resolvePath(account);
      const result = await btc.signPsbtBuffer(tx, {
        accountPath: accountPath(),
        addressFormat,
        finalizePsbt: false,
        knownAddressDerivations: new Map(),
      });
      return new Uint8Array(result.psbt);
    },

    subscribe: core.subscribe,
    switchAccount: core.switchAccount,

    switchChain: (chain) => {
      if (chain.namespace !== "bip122") {
        return Promise.reject(
          new Error(
            `[butr/ledger] received non-Bitcoin chain "${chain.id}". Pass a chain with namespace "bip122".`,
          ),
        );
      }
      chainId = chain.id;
      return Promise.resolve();
    },
  };

  return Promise.resolve(adapter);
};

export type { BitcoinAddressFormat, BitcoinLedgerOptions, BtcAppConstructor, BtcAppLike };
export { LEDGER_ICON as LEDGER_BITCOIN_DEFAULT_ICON } from "../adapter-core";
export { createBitcoinLedgerAdapter };
