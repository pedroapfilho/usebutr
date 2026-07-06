import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";

import { LEDGER_CAPABILITIES } from "../capabilities";
import type { TransportFactory, TransportLike } from "../transport";
import { loadTransport } from "../transport";

/**
 * Minimal type surface for `@ledgerhq/hw-app-eth`. Declared inline so
 * butr's typecheck pipeline doesn't depend on the optional peer dep
 * being installed. Real Ledger Eth app instances satisfy this shape.
 */
type EthAppLike = {
  getAddress: (
    path: string,
    boolDisplay?: boolean,
    boolChaincode?: boolean,
  ) => Promise<{ address: string; publicKey: string }>;
  signPersonalMessage: (
    path: string,
    messageHex: string,
  ) => Promise<{ r: string; s: string; v: number }>;
  signTransaction: (
    path: string,
    rawTxHex: string,
    resolution?: unknown,
  ) => Promise<{ r: string; s: string; v: string }>;
};

type EthAppConstructor = new (transport: unknown) => EthAppLike;

const DEFAULT_DERIVATION_PATH_PREFIX = "44'/60'/0'/0";
const DEFAULT_CHAIN_ID = 1;

const loadEth = async (): Promise<EthAppConstructor> => {
  const mod = (await import("@ledgerhq/hw-app-eth")) as unknown as {
    default?: EthAppConstructor;
    Eth?: EthAppConstructor;
  };
  const ctor = mod.default ?? mod.Eth;
  if (!ctor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-eth — install it as an optional peer dep",
    );
  }
  return ctor;
};

/**
 * EVM-specific Ledger adapter options. Each option is **fully typed
 * for the EVM platform** — no opaque DI bag, no `unknown` chain hints.
 * Other platforms (`createSvmLedgerAdapter`, etc., as they're added)
 * will have their own option types.
 */
type EvmLedgerOptions = {
  /**
   * How many accounts to enumerate via `getAccounts()`. Each path walk
   * hits the device (~1-2 s per address), so larger values are slow.
   * Default: 1.
   */
  accountCount?: number;
  /**
   * EIP-155 chain id the adapter signs against. Stored locally —
   * Ledger has no internal "current chain" concept; `chainId` enters
   * the signing pipeline per-tx. `switchChain` updates this value.
   * Default: 1 (Ethereum mainnet).
   */
  chainId?: number;
  /**
   * BIP-32 derivation path *prefix*. `getAccounts(n)` appends the
   * account index. Default: `"44'/60'/0'/0"` (standard Ethereum).
   */
  derivationPathPrefix?: string;
  /**
   * DI override for the `Eth` app constructor (tests). When omitted,
   * the factory dynamic-imports `@ledgerhq/hw-app-eth`.
   */
  eth?: EthAppConstructor;
  /** Override the wallet icon shown in pickers. */
  icon?: string;
  /** Override the connector id. Default `"ledger"`. */
  id?: string;
  /** Override the wallet name. Default `"Ledger"`. */
  name?: string;
  /** Discriminant for the main `createLedgerAdapter` dispatch. */
  platform: "evm";
  /**
   * DI override for the WebUSB transport factory (tests). When
   * omitted, the factory dynamic-imports `@ledgerhq/hw-transport-webusb`.
   */
  transport?: TransportFactory;
};

const DEFAULT_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwMCI+PHJlY3QgeD0iMyIgeT0iNyIgd2lkdGg9IjEzIiBoZWlnaHQ9IjEwIiByeD0iMSIvPjxyZWN0IHg9IjE3IiB5PSI3IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTciIHk9IjE0IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI3IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";

const buildEvmChain = (chainId: number, walletName: string): ChainBase => ({
  id: `eip155:${chainId}`,
  // Same stance as the EIP-6963 adapter — butr doesn't ship a chain
  // id → name table. Consumers overlay via structural typing.
  name: walletName,
  namespace: "eip155",
  reference: chainId.toString(),
});

const buildEvmAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address.toLowerCase()}`,
  walletAddress: address,
});

const SUBSCRIBE_NOT_AVAILABLE =
  "[butr/ledger] subscribe is not implemented — device emits no events";

/**
 * Build a Ledger hardware-wallet adapter wired to the **EVM Ethereum
 * app**. The returned adapter is fully-formed but UN-paired — pairing
 * happens when butr's runtime calls `adapter.connect()`, at which point
 * the browser shows the WebUSB permission prompt and the user unlocks
 * their Ledger.
 *
 * Direct callers can use this; most consumers go through
 * `createLedgerAdapter` in `adapter.ts`, which dispatches by platform.
 */
const createEvmLedgerAdapter = (options: EvmLedgerOptions): Promise<WalletAdapter> => {
  const id = options.id ?? "ledger";
  const name = options.name ?? "Ledger";
  const icon = options.icon ?? DEFAULT_ICON;
  const derivationPathPrefix = options.derivationPathPrefix ?? DEFAULT_DERIVATION_PATH_PREFIX;
  const accountCount = Math.max(1, options.accountCount ?? 1);

  let chainId = options.chainId ?? DEFAULT_CHAIN_ID;
  let transport: TransportLike | null = null;
  let eth: EthAppLike | null = null;
  let currentAddress: string | null = null;

  const pathAt = (index: number): string => `${derivationPathPrefix}/${index}`;

  const adapter: WalletAdapter = {
    capabilities: LEDGER_CAPABILITIES,
    chainPlatform: "evm",

    async connect(opts) {
      if (opts?.silent) {
        // Ledger connect always shows the browser's WebUSB device
        // picker — there is no silent reconnect. Reject so eager
        // hydration doesn't pop the chooser on page load.
        throw new Error("Ledger requires an interactive connect");
      }
      const TransportFactoryImpl = options.transport ?? (await loadTransport());
      const EthApp = options.eth ?? (await loadEth());
      transport = await TransportFactoryImpl.create();
      eth = new EthApp(transport);
      const { address } = await eth.getAddress(pathAt(0));
      currentAddress = address;
    },

    async disconnect() {
      try {
        await transport?.close();
      } catch (error) {
        logWarn("[butr/ledger] transport.close threw:", error);
      }
      transport = null;
      eth = null;
      currentAddress = null;
    },

    getAccount() {
      if (!currentAddress) {
        return Promise.resolve(null);
      }
      return Promise.resolve(buildEvmAccount(currentAddress, buildEvmChain(chainId, name)));
    },

    async getAccounts() {
      if (!eth) {
        return [];
      }
      const chain = buildEvmChain(chainId, name);
      const accounts: Array<Account> = [];
      // Sequential walk — the device serialises USB requests; parallel
      // calls would deadlock the transport. Slow but correct.
      for (let i = 0; i < accountCount; i += 1) {
        // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
        const { address } = await eth.getAddress(pathAt(i));
        accounts.push(buildEvmAccount(address, chain));
      }
      return accounts;
    },

    getBalance() {
      // Capabilities flag is `false`; this throw is defence-in-depth.
      return Promise.reject(
        new Error(
          "[butr/ledger] getBalance not supported — Ledger has no RPC. Use viem/ethers with your own RPC URL.",
        ),
      );
    },

    getSigner() {
      // Hands the raw Eth app to consumers who want to wrap it.
      return Promise.resolve(eth);
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
          "[butr/ledger] sendTx not supported — Ledger signs but doesn't broadcast. Use `getSigner()` + viem/ethers.",
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
      if (!eth) {
        throw new Error("[butr/ledger] not connected — call connect() first");
      }
      let path = pathAt(0);
      if (account && account.walletAddress.toLowerCase() !== currentAddress?.toLowerCase()) {
        let matched = false;
        for (let i = 0; i < accountCount; i += 1) {
          const candidatePath = pathAt(i);
          // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
          const { address } = await eth.getAddress(candidatePath);
          if (address.toLowerCase() === account.walletAddress.toLowerCase()) {
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
      const hex = [...message].map((b) => b.toString(16).padStart(2, "0")).join("");
      const { r, s, v } = await eth.signPersonalMessage(path, hex);
      const sigHex = `${r.padStart(64, "0")}${s.padStart(64, "0")}${v.toString(16).padStart(2, "0")}`;
      const signature = new Uint8Array(sigHex.length / 2);
      for (let i = 0; i < signature.length; i += 1) {
        signature[i] = Number.parseInt(sigHex.slice(i * 2, i * 2 + 2), 16);
      }
      return { signature, signedMessage: message };
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
      if (chain.namespace !== "eip155") {
        return Promise.reject(
          new Error(
            `[butr/ledger] received non-EVM chain "${chain.id}". Pass a chain with namespace "eip155".`,
          ),
        );
      }
      const next = Math.trunc(Number(chain.reference));
      if (!Number.isFinite(next)) {
        return Promise.reject(
          new TypeError(`[butr/ledger] chain reference is not a number: ${chain.reference}`),
        );
      }
      chainId = next;
      return Promise.resolve();
    },
  };

  return Promise.resolve(adapter);
};

export type { EthAppConstructor, EthAppLike, EvmLedgerOptions };
export { DEFAULT_ICON as LEDGER_DEFAULT_ICON, createEvmLedgerAdapter };
