import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";

import { LEDGER_CAPABILITIES } from "../capabilities";
import type { TransportFactory, TransportLike } from "../transport";
import { loadTransport } from "../transport";

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
  const mod = (await import("@ledgerhq/hw-app-solana")) as unknown as {
    default?: SolanaAppConstructor;
    Solana?: SolanaAppConstructor;
  };
  const ctor = mod.default ?? mod.Solana;
  if (!ctor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-solana — install it as an optional peer dep",
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

const DEFAULT_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwMCI+PHJlY3QgeD0iMyIgeT0iNyIgd2lkdGg9IjEzIiBoZWlnaHQ9IjEwIiByeD0iMSIvPjxyZWN0IHg9IjE3IiB5PSI3IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTciIHk9IjE0IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI3IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Base58-encode a byte array (Solana's address encoding). Copied
 * verbatim from the kit demo. Standalone so the package stays free of
 * runtime deps beyond `@usebutr/core`.
 */
const bytesToBase58 = (bytes: Uint8Array): string => {
  let intVal = 0n;
  for (const byte of bytes) {
    intVal = (intVal << 8n) | BigInt(byte);
  }
  let out = "";
  while (intVal > 0n) {
    const remainder = intVal % 58n;
    intVal /= 58n;
    out = BASE58_ALPHABET[Number(remainder)] + out;
  }
  for (const byte of bytes) {
    if (byte !== 0) {
      break;
    }
    out = `1${out}`;
  }
  return out;
};

const buildSolanaChain = (cluster: SolanaCluster, walletName: string): ChainBase => ({
  id: `solana:${cluster}`,
  // Same stance as the EVM builder; no chain-id → name table in butr;
  // we surface the wallet name and let consumers overlay structurally.
  name: walletName,
  namespace: "solana",
  reference: cluster,
});

const buildSolanaAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

const SUBSCRIBE_NOT_AVAILABLE =
  "[butr/ledger] subscribe is not implemented — device emits no events";

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
  const id = options.id ?? "ledger";
  const name = options.name ?? "Ledger";
  const icon = options.icon ?? DEFAULT_ICON;
  const derivationPathPrefix = options.derivationPathPrefix ?? DEFAULT_DERIVATION_PATH_PREFIX;
  const accountCount = Math.max(1, options.accountCount ?? 1);

  let cluster: SolanaCluster = options.cluster ?? DEFAULT_CLUSTER;
  let transport: TransportLike | null = null;
  let solana: SolanaAppLike | null = null;
  let currentAddress: string | null = null;

  const pathAt = (index: number): string => `${derivationPathPrefix}/${index}'`;

  const adapter: WalletAdapter = {
    capabilities: LEDGER_CAPABILITIES,
    chainPlatform: "svm",

    async connect(opts) {
      if (opts?.silent) {
        // Ledger connect always shows the browser's WebUSB device
        // picker; there is no silent reconnect. Reject so eager
        // hydration doesn't pop the chooser on page load.
        throw new Error("Ledger requires an interactive connect");
      }
      const TransportFactoryImpl = options.transport ?? (await loadTransport());
      const SolanaApp = options.solana ?? (await loadSolana());
      transport = await TransportFactoryImpl.create();
      solana = new SolanaApp(transport);
      const { address } = await solana.getAddress(pathAt(0));
      currentAddress = bytesToBase58(new Uint8Array(address));
    },

    async disconnect() {
      try {
        await transport?.close();
      } catch (error) {
        logWarn("[butr/ledger] transport.close threw:", error);
      }
      transport = null;
      solana = null;
      currentAddress = null;
    },

    getAccount() {
      if (!currentAddress) {
        return Promise.resolve(null);
      }
      return Promise.resolve(buildSolanaAccount(currentAddress, buildSolanaChain(cluster, name)));
    },

    async getAccounts() {
      if (!solana) {
        return [];
      }
      const chain = buildSolanaChain(cluster, name);
      const accounts: Array<Account> = [];
      // Sequential walk; the device serialises USB requests; parallel
      // calls would deadlock the transport. Slow but correct.
      for (let i = 0; i < accountCount; i += 1) {
        // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
        const { address } = await solana.getAddress(pathAt(i));
        const base58Address = bytesToBase58(new Uint8Array(address));
        accounts.push(buildSolanaAccount(base58Address, chain));
      }
      return accounts;
    },

    getBalance() {
      return Promise.reject(
        new Error(
          "[butr/ledger] getBalance not supported — Ledger has no RPC. Use @solana/kit or @solana/web3.js with your own RPC URL.",
        ),
      );
    },

    getSigner() {
      return Promise.resolve(solana);
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
          "[butr/ledger] sendTx not supported — Ledger signs but doesn't broadcast. Use signTransaction + @solana/kit / @solana/web3.js.",
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
      if (!solana) {
        throw new Error("[butr/ledger] not connected — call connect() first");
      }
      let path = pathAt(0);
      if (account && account.walletAddress !== currentAddress) {
        let matched = false;
        for (let i = 0; i < accountCount; i += 1) {
          const candidatePath = pathAt(i);
          // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
          const { address } = await solana.getAddress(candidatePath);
          const candidateAddress = bytesToBase58(new Uint8Array(address));
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
      if (!solana) {
        throw new Error("[butr/ledger] not connected — call connect() first");
      }
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "[butr/ledger] signTransaction expects a Uint8Array (serialized Solana transaction).",
        );
      }
      let path = pathAt(0);
      if (account && account.walletAddress !== currentAddress) {
        let matched = false;
        for (let i = 0; i < accountCount; i += 1) {
          const candidatePath = pathAt(i);
          // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
          const { address } = await solana.getAddress(candidatePath);
          const candidateAddress = bytesToBase58(new Uint8Array(address));
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
      const result = await solana.signTransaction(path, tx);
      return new Uint8Array(result.signature);
    },

    subscribe() {
      // No-op; Ledger emits no events. Capabilities flag is `false`.
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
export { DEFAULT_ICON as LEDGER_SVM_DEFAULT_ICON, createSvmLedgerAdapter };
