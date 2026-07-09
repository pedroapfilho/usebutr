import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";

import { LEDGER_CAPABILITIES } from "../capabilities";
import type { TransportFactory, TransportLike } from "../transport";
import { loadTransport } from "../transport";

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
 *    returns ONLY the signature bytes; assembling the final signed
 *    transaction (wrapping signature + pubkey into the Sui transaction
 *    signature envelope) is on the consumer — same as Suiet, Sui Wallet,
 *    and `@mysten/sui`'s own flows.
 *  - There is **no `signPersonalMessage`** on the Ledger Sui app at this
 *    version — Ledger's Sui app supports transaction signing only.
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

const loadSui = async (): Promise<SuiAppConstructor> => {
  const mod = (await import("@ledgerhq/hw-app-sui")) as unknown as {
    default?: SuiAppConstructor;
    Sui?: SuiAppConstructor;
  };
  const ctor = mod.default ?? mod.Sui;
  if (!ctor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-sui — install it as an optional peer dep",
    );
  }
  return ctor;
};

/**
 * Sui-specific Ledger adapter options. Each option is **fully typed for
 * the Sui platform** — no opaque DI bag, no `unknown` chain hints.
 */
type SuiLedgerOptions = {
  /**
   * How many accounts to enumerate via `getAccounts()`. Each path walk
   * hits the device (~1-2 s per address), so larger values are slow.
   * Default: 1.
   */
  accountCount?: number;
  /**
   * Sui cluster shortname. Stored locally — Ledger has no internal
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

const DEFAULT_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwMCI+PHJlY3QgeD0iMyIgeT0iNyIgd2lkdGg9IjEzIiBoZWlnaHQ9IjEwIiByeD0iMSIvPjxyZWN0IHg9IjE3IiB5PSI3IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTciIHk9IjE0IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI3IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";

/**
 * Hex-encode the 32 address bytes returned by the device into a Sui
 * address string. Sui addresses are 32-byte values displayed as
 * `0x`-prefixed lowercase hex — the same format `@mysten/sui` and
 * explorers exchange.
 */
const bytesToSuiAddress = (bytes: Uint8Array): string => {
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return `0x${hex}`;
};

const buildSuiChain = (cluster: SuiCluster, walletName: string): ChainBase => ({
  id: `sui:${cluster}`,
  // butr; we surface the wallet name and let consumers overlay structurally.
  name: walletName,
  namespace: "sui",
  reference: cluster,
});

const buildSuiAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

const SUBSCRIBE_NOT_AVAILABLE =
  "[butr/ledger] subscribe is not implemented — device emits no events";

/**
 * Build a Ledger hardware-wallet adapter wired to the **Sui app**. The
 * returned adapter is fully-formed but UN-paired — pairing happens when
 * butr's runtime calls `adapter.connect()`, at which point the browser
 * shows the WebUSB permission prompt and the user unlocks their Ledger
 * and opens the Sui app.
 *
 * Most consumers go through `createLedgerAdapter` in `adapter.ts`,
 * which dispatches by `platform` field.
 *
 * **Signing model.** `signTransaction` signs BCS-serialized Sui
 * transaction bytes and returns ONLY the 64-byte ed25519 signature —
 * the consumer assembles the final signed transaction by wrapping that
 * signature with the public key into Sui's signature envelope (use
 * `@mysten/sui`'s `Ed25519PublicKey.toSuiBytes()` / signature helpers).
 * This matches how Suiet and Sui Wallet ship the same surface.
 *
 * **No off-chain signing.** Ledger's Sui app does NOT implement a
 * `signPersonalMessage` instruction at this app version, so
 * `capabilities.signMessage` is `false` and the adapter's `signMessage`
 * rejects. Off-chain auth flows should fall back to a non-hardware
 * wallet.
 *
 * **No broadcast.** `sendTx` rejects — Ledger has no RPC. The consumer
 * broadcasts the assembled transaction through their own Sui RPC client.
 */
const createSuiLedgerAdapter = (options: SuiLedgerOptions): Promise<WalletAdapter> => {
  const id = options.id ?? "ledger";
  const name = options.name ?? "Ledger";
  const icon = options.icon ?? DEFAULT_ICON;
  const derivationPathPrefix = options.derivationPathPrefix ?? DEFAULT_DERIVATION_PATH_PREFIX;
  const accountCount = Math.max(1, options.accountCount ?? 1);

  // Sui's signMessage capability differs from EVM/SVM — the Ledger
  // Sui app doesn't expose an off-chain message signing instruction.
  const capabilities = { ...LEDGER_CAPABILITIES, signMessage: false };

  let cluster: SuiCluster = options.cluster ?? DEFAULT_CLUSTER;
  let transport: TransportLike | null = null;
  let sui: SuiAppLike | null = null;
  let currentAddress: string | null = null;

  // Sui paths are fully-hardened per Sui Wallet convention — every
  const pathAt = (index: number): string => `${derivationPathPrefix}/${index}'`;

  const adapter: WalletAdapter = {
    capabilities,
    chainPlatform: "sui",

    async connect(opts) {
      if (opts?.silent) {
        // Ledger connect always shows the browser's WebUSB device
        // picker — there is no silent reconnect. Reject so eager
        // hydration doesn't pop the chooser on page load.
        throw new Error("Ledger requires an interactive connect");
      }
      const TransportFactoryImpl = options.transport ?? (await loadTransport());
      const SuiApp = options.sui ?? (await loadSui());
      transport = await TransportFactoryImpl.create();
      sui = new SuiApp(transport);
      const { address } = await sui.getPublicKey(pathAt(0));
      currentAddress = bytesToSuiAddress(new Uint8Array(address));
    },

    async disconnect() {
      try {
        await transport?.close();
      } catch (error) {
        logWarn("[butr/ledger] transport.close threw:", error);
      }
      transport = null;
      sui = null;
      currentAddress = null;
    },

    getAccount() {
      if (!currentAddress) {
        return Promise.resolve(null);
      }
      return Promise.resolve(buildSuiAccount(currentAddress, buildSuiChain(cluster, name)));
    },

    async getAccounts() {
      if (!sui) {
        return [];
      }
      const chain = buildSuiChain(cluster, name);
      const accounts: Array<Account> = [];
      // Sequential walk — the device serialises USB requests; parallel
      for (let i = 0; i < accountCount; i += 1) {
        // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
        const { address } = await sui.getPublicKey(pathAt(i));
        const suiAddress = bytesToSuiAddress(new Uint8Array(address));
        accounts.push(buildSuiAccount(suiAddress, chain));
      }
      return accounts;
    },

    getBalance() {
      return Promise.reject(
        new Error(
          "[butr/ledger] getBalance not supported — Ledger has no RPC. Use @mysten/sui's SuiClient with your own RPC URL.",
        ),
      );
    },

    getSigner() {
      return Promise.resolve(sui);
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
          "[butr/ledger] sendTx not supported — Ledger signs but doesn't broadcast. Use signTransaction + @mysten/sui's SuiClient.",
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

    signMessage() {
      // Ledger's Sui app exposes no signPersonalMessage / off-chain
      return Promise.reject(
        new Error(
          "[butr/ledger] signMessage not supported — Ledger's Sui app exposes no off-chain message signing instruction. Use a non-hardware wallet for off-chain auth flows.",
        ),
      );
    },

    /**
     * Sign a serialized Sui transaction. Returns the raw 64-byte ed25519
     * signature. The consumer is responsible for assembling the final
     * signed transaction by wrapping this signature with the public key
     * into Sui's signature envelope — use `@mysten/sui`'s signature
     * helpers. Mirrors how Suiet + every Sui wallet ships this surface.
     */
    async signTransaction(tx, account) {
      if (!sui) {
        throw new Error("[butr/ledger] not connected — call connect() first");
      }
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "[butr/ledger] signTransaction expects a Uint8Array (BCS-serialized Sui transaction).",
        );
      }
      let path = pathAt(0);
      if (account && account.walletAddress !== currentAddress) {
        let matched = false;
        for (let i = 0; i < accountCount; i += 1) {
          const candidatePath = pathAt(i);
          // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
          const { address } = await sui.getPublicKey(candidatePath);
          const candidateAddress = bytesToSuiAddress(new Uint8Array(address));
          if (candidateAddress === account.walletAddress) {
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
      const result = await sui.signTransaction(path, tx);
      return new Uint8Array(result.signature);
    },

    subscribe() {
      // No-op — Ledger emits no events. Capabilities flag is `false`.
      void SUBSCRIBE_NOT_AVAILABLE;
      return () => {};
    },

    switchAccount() {
      return Promise.reject(
        new Error(
          "[butr/ledger] switchAccount not supported — pick a different account via signTransaction(tx, account) using a different derivation path",
        ),
      );
    },

    switchChain(chain) {
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
export { DEFAULT_ICON as LEDGER_SUI_DEFAULT_ICON, createSuiLedgerAdapter };
