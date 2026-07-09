import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { bytesToHex, hexToBytes, logWarn } from "@usebutr/core";

import { LEDGER_CAPABILITIES } from "../capabilities";
import type { TransportFactory, TransportLike } from "../transport";
import { loadTransport } from "../transport";

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
  const mod = (await import("@ledgerhq/hw-app-btc")) as unknown as {
    Btc?: BtcAppConstructor;
    default?: BtcAppConstructor;
  };
  const ctor = mod.default ?? mod.Btc;
  if (!ctor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-btc — install it as an optional peer dep",
    );
  }
  return ctor;
};

/**
 * Bitcoin-specific Ledger adapter options. Each option is **fully typed for
 * the Bitcoin platform** — no opaque DI bag, no `unknown` chain hints.
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
   * BIP convention, but the adapter doesn't police that — the device will.
   */
  addressFormat?: BitcoinAddressFormat;
  /**
   * DI override for the `Btc` app constructor (tests). When omitted, the
   * factory dynamic-imports `@ledgerhq/hw-app-btc`.
   */
  btc?: BtcAppConstructor;
  /**
   * CAIP-2 chain id this adapter signs against. Stored locally — Ledger has
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

const DEFAULT_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwMCI+PHJlY3QgeD0iMyIgeT0iNyIgd2lkdGg9IjEzIiBoZWlnaHQ9IjEwIiByeD0iMSIvPjxyZWN0IHg9IjE3IiB5PSI3IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTciIHk9IjE0IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI3IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";

const buildBitcoinChain = (chainId: string, walletName: string): ChainBase => {
  // Reference is the part after the `bip122:` (or other) namespace prefix.
  // don't crash the chain builder.
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

const SUBSCRIBE_NOT_AVAILABLE =
  "[butr/ledger] subscribe is not implemented — device emits no events";

/**
 * Build a Ledger hardware-wallet adapter wired to the **Bitcoin app**. The
 * returned adapter is fully-formed but UN-paired — pairing happens when
 * butr's runtime calls `adapter.connect()`, at which point the browser shows
 * the WebUSB permission prompt and the user unlocks their Ledger and opens
 * the Bitcoin app.
 *
 * Most consumers go through `createLedgerAdapter` in `adapter.ts`, which
 * dispatches by `platform` field.
 *
 * **Signing model.** `signMessage` routes through the Bitcoin app's
 * `signMessage` instruction (the message is hex-encoded internally — Ledger's
 * Bitcoin app pre-dates the canonical "signMessage takes bytes" convention).
 * The returned `{ v, r, s }` is repacked into a 65-byte `r||s||v` signature
 * blob to match butr's `signMessage` surface.
 *
 * `signTransaction` routes through `signPsbtBuffer` (Bitcoin app v2.1+) and
 * returns the signed PSBT bytes — the consumer finalises + broadcasts
 * through their own Esplora / Electrum client. `finalizePsbt: false` so the
 * round-trip mirrors the WalletConnect `bitcoin:signPsbt` contract. The PSBT
 * itself must carry the necessary BIP-32 derivation paths
 * (`PSBT_IN_BIP32_DERIVATION`) for the device to know which key to sign
 * with; well-formed PSBTs produced by `bitcoinjs-lib`, Sparrow, Bitcoin Core,
 * etc. include these. Adapters that want to back-fill missing derivations
 * can populate `loadKnownAddressDerivations` via the Btc app directly (out
 * of scope for this factory).
 *
 * **No broadcast.** `sendTx` rejects — Ledger has no RPC. The consumer
 * broadcasts the signed PSBT (or finalised tx) through their own Bitcoin
 * client.
 *
 * **Known limitations.**
 *  - `signTransaction` does not back-fill `knownAddressDerivations` for the
 *    consumer. PSBTs without derivation hints will reject at the device.
 *  - The address format and derivation prefix must agree per BIP convention.
 *    The adapter doesn't police that — the device will produce an error if
 *    they disagree.
 */
const createBitcoinLedgerAdapter = (options: BitcoinLedgerOptions): Promise<WalletAdapter> => {
  const id = options.id ?? "ledger";
  const name = options.name ?? "Ledger";
  const icon = options.icon ?? DEFAULT_ICON;
  const derivationPathPrefix = options.derivationPathPrefix ?? DEFAULT_DERIVATION_PATH_PREFIX;
  const accountCount = Math.max(1, options.accountCount ?? 1);
  const addressFormat = options.addressFormat ?? DEFAULT_ADDRESS_FORMAT;

  let chainId = options.chainId ?? DEFAULT_CHAIN_ID;
  let transport: TransportLike | null = null;
  let btc: BtcAppLike | null = null;
  let currentAddress: string | null = null;

  const pathAt = (index: number): string => `${derivationPathPrefix}/${index}`;
  const accountPath = (): string => {
    const lastSlash = derivationPathPrefix.lastIndexOf("/");
    return lastSlash === -1 ? derivationPathPrefix : derivationPathPrefix.slice(0, lastSlash);
  };

  const adapter: WalletAdapter = {
    capabilities: LEDGER_CAPABILITIES,
    chainPlatform: "bitcoin",

    async connect(opts) {
      if (opts?.silent) {
        // Ledger connect always shows the browser's WebUSB device picker —
        // there is no silent reconnect. Reject so eager hydration doesn't
        throw new Error("Ledger requires an interactive connect");
      }
      const TransportFactoryImpl = options.transport ?? (await loadTransport());
      const BtcApp = options.btc ?? (await (options.loadBtc ?? loadBtc)());
      transport = await TransportFactoryImpl.create();
      btc = new BtcApp({ currency: "bitcoin", transport });
      const { bitcoinAddress } = await btc.getWalletPublicKey(pathAt(0), {
        format: addressFormat,
      });
      currentAddress = bitcoinAddress;
    },

    async disconnect() {
      try {
        await transport?.close();
      } catch (error) {
        logWarn("[butr/ledger] transport.close threw:", error);
      }
      transport = null;
      btc = null;
      currentAddress = null;
    },

    getAccount() {
      if (!currentAddress) {
        return Promise.resolve(null);
      }
      return Promise.resolve(buildBitcoinAccount(currentAddress, buildBitcoinChain(chainId, name)));
    },

    async getAccounts() {
      if (!btc) {
        return [];
      }
      const chain = buildBitcoinChain(chainId, name);
      const accounts: Array<Account> = [];
      // Sequential walk — the device serialises USB requests; parallel
      for (let i = 0; i < accountCount; i += 1) {
        // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
        const { bitcoinAddress } = await btc.getWalletPublicKey(pathAt(i), {
          format: addressFormat,
        });
        accounts.push(buildBitcoinAccount(bitcoinAddress, chain));
      }
      return accounts;
    },

    getBalance() {
      return Promise.reject(
        new Error(
          "[butr/ledger] getBalance not supported — Ledger has no RPC. Use bitcoinjs-lib with an Esplora / Electrum client.",
        ),
      );
    },

    getSigner() {
      return Promise.resolve(btc);
    },

    getTransactionReceipt() {
      return Promise.reject(
        new Error("[butr/ledger] getTransactionReceipt not supported — Ledger has no RPC."),
      );
    },

    icon,
    id,
    name,

    sendTx() {
      return Promise.reject(
        new Error(
          "[butr/ledger] sendTx not supported — Ledger signs but doesn't broadcast. Use signTransaction + an Esplora / Electrum client.",
        ),
      );
    },

    sendTxToChain() {
      return Promise.reject(
        new Error(
          "[butr/ledger] sendTxToChain not supported — Ledger signs but doesn't broadcast.",
        ),
      );
    },

    async signMessage(message, account) {
      if (!btc) {
        throw new Error("[butr/ledger] not connected — call connect() first");
      }
      let path = pathAt(0);
      if (account && account.walletAddress !== currentAddress) {
        let matched = false;
        for (let i = 0; i < accountCount; i += 1) {
          const candidatePath = pathAt(i);
          // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
          const { bitcoinAddress } = await btc.getWalletPublicKey(candidatePath, {
            format: addressFormat,
          });
          if (bitcoinAddress === account.walletAddress) {
            path = candidatePath;
            matched = true;
            break;
          }
        }
        if (!matched) {
          throw new Error(
            `[butr/ledger] address ${account.walletAddress} not found on this device within ${accountCount} derivation paths`,
          );
        }
      }
      const messageHex = bytesToHex(message);
      const { r, s, v } = await btc.signMessage(path, messageHex);
      const sigHex = `${r.padStart(64, "0")}${s.padStart(64, "0")}${v.toString(16).padStart(2, "0")}`;
      const signature = hexToBytes(sigHex);
      return { signature, signedMessage: message };
    },

    /**
     * Sign a serialized PSBT (v0 or v2). Returns the signed PSBT bytes —
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
      if (!btc) {
        throw new Error("[butr/ledger] not connected — call connect() first");
      }
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "[butr/ledger] signTransaction expects a Uint8Array (serialized PSBT v0 or v2).",
        );
      }
      if (account && account.walletAddress !== currentAddress) {
        let matched = false;
        for (let i = 0; i < accountCount; i += 1) {
          const candidatePath = pathAt(i);
          // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
          const { bitcoinAddress } = await btc.getWalletPublicKey(candidatePath, {
            format: addressFormat,
          });
          if (bitcoinAddress === account.walletAddress) {
            matched = true;
            break;
          }
        }
        if (!matched) {
          throw new Error(
            `[butr/ledger] address ${account.walletAddress} not found on this device within ${accountCount} derivation paths`,
          );
        }
      }
      const result = await btc.signPsbtBuffer(tx, {
        accountPath: accountPath(),
        addressFormat,
        finalizePsbt: false,
        knownAddressDerivations: new Map(),
      });
      return new Uint8Array(result.psbt);
    },

    subscribe() {
      // No-op — Ledger emits no events. Capabilities flag is `false`.
      void SUBSCRIBE_NOT_AVAILABLE;
      return () => {};
    },

    switchAccount() {
      return Promise.reject(
        new Error(
          "[butr/ledger] switchAccount not supported — pick a different account via signMessage(msg, account) using a different derivation path",
        ),
      );
    },

    switchChain(chain) {
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
export { DEFAULT_ICON as LEDGER_BITCOIN_DEFAULT_ICON, createBitcoinLedgerAdapter };
