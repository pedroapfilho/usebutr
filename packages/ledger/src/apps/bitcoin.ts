import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { bytesToHex, hexToBytes } from "@usebutr/core";

import { createLedgerAdapterCore } from "../adapter-core";
import { LEDGER_SIGN_TRANSACTION_CAPABILITIES } from "../capabilities";
import type { TransportFactory, TransportLike } from "../transport";

/**
 * Mirrors `@ledgerhq/hw-app-btc`'s `AddressFormat`, re-declared inline so
 * butr's typecheck doesn't depend on the optional peer dep. Each maps to a BIP
 * path convention: legacy 44', p2sh 49', bech32 84', bech32m 86'.
 */
type BitcoinAddressFormat = "legacy" | "p2sh" | "bech32" | "bech32m";

/**
 * Mirrors `@ledgerhq/hw-app-btc`'s `signPsbtBuffer` so butr's typecheck doesn't
 * depend on the optional peer dep. Its `Buffer`s are typed as `Uint8Array`,
 * which the runtime satisfies in Node and under browser bundler shims.
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
  /** Only consulted when the PSBT lacks BIP-32 derivation data. Well-formed
   *  PSBTs carry it in `PSBT_IN_BIP32_DERIVATION`, so an empty Map is
   *  normally fine. */
  knownAddressDerivations: Map<string, { path: Array<number>; pubkey: Uint8Array }>;
};

/**
 * Declared inline so butr's typecheck doesn't depend on the optional peer dep.
 * The constructor takes the v10+ `{ transport, currency }` form, `signMessage`
 * wants a HEX string, and `signPsbtBuffer` needs Bitcoin app v2.1+.
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

type BtcAppConstructor = new (args: { currency?: string; transport: TransportLike }) => BtcAppLike;

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
  const imported: unknown = await import("@ledgerhq/hw-app-btc");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: The supported peer range exports the Bitcoin app constructor under default or Btc.
  const moduleValue = imported as {
    Btc?: BtcAppConstructor;
    default?: BtcAppConstructor;
  };
  const constructor = moduleValue.default ?? moduleValue.Btc;
  if (!constructor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-btc: install it as an optional peer dep",
    );
  }
  return constructor;
};

/**
 * Bitcoin-specific Ledger adapter options. Each option is **fully typed for
 * the Bitcoin platform**; no opaque DI bag, no `unknown` chain hints.
 */
type BitcoinLedgerOptions = {
  /** Each path walk hits the device (~1-2 s per address), so larger values are
   *  slow. Default: 1. */
  accountCount?: number;
  /** Must agree with `derivationPathPrefix` per BIP convention; the adapter
   *  doesn't police that, so the device errors when they disagree. Default:
   *  `"bech32"`. */
  addressFormat?: BitcoinAddressFormat;
  /**
   * DI override for the `Btc` app constructor (tests). When omitted, the
   * factory dynamic-imports `@ledgerhq/hw-app-btc`.
   */
  btc?: BtcAppConstructor;
  /** Ledger has no internal "current chain", so this is stored locally and
   *  only affects the ChainBase id butr surfaces. Default: mainnet. */
  chainId?: string;
  /** `getAccounts(n)` appends the account index as the last, non-hardened
   *  segment. Default: `"84'/0'/0'/0"` (BIP-84 native SegWit mainnet). */
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
 * The returned adapter is UN-paired: pairing happens on `adapter.connect()`,
 * when the browser prompts for WebUSB and the user opens the Bitcoin app.
 * `signMessage` hex-encodes, as the app pre-dates the takes-bytes convention.
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
     * `finalizePsbt: false` mirrors the WalletConnect `bitcoin:signPsbt`
     * contract. The factory passes an empty `knownAddressDerivations`, so a
     * PSBT lacking `PSBT_IN_BIP32_DERIVATION` rejects at the device.
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
