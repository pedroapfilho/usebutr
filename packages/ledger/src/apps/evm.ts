import type { Account, ChainBase, WalletAdapter } from "@usebutr/core";
import { bytesToHex, hexToBytes } from "@usebutr/core";

import { createLedgerAdapterCore } from "../adapter-core";
import { LEDGER_CAPABILITIES } from "../capabilities";
import type { TransportFactory } from "../transport";

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
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- untyped optional peer-dep module boundary
  const mod = (await import("@ledgerhq/hw-app-eth")) as unknown as {
    default?: EthAppConstructor;
    Eth?: EthAppConstructor;
  };
  const ctor = mod.default ?? mod.Eth;
  if (!ctor) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-app-eth: install it as an optional peer dep",
    );
  }
  return ctor;
};

/**
 * EVM-specific Ledger adapter options. Each option is **fully typed
 * for the EVM platform**; no opaque DI bag, no `unknown` chain hints.
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
   * EIP-155 chain id the adapter signs against. Stored locally;
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

const buildEvmChain = (chainId: number, walletName: string): ChainBase => ({
  id: `eip155:${chainId}`,
  name: walletName,
  namespace: "eip155",
  reference: chainId.toString(),
});

const buildEvmAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address.toLowerCase()}`,
  walletAddress: address,
});

/**
 * Build a Ledger hardware-wallet adapter wired to the **EVM Ethereum
 * app**. The returned adapter is fully-formed but UN-paired; pairing
 * happens when butr's runtime calls `adapter.connect()`, at which point
 * the browser shows the WebUSB permission prompt and the user unlocks
 * their Ledger.
 *
 * Direct callers can use this; most consumers go through
 * `createLedgerAdapter` in `adapter.ts`, which dispatches by platform.
 */
const createEvmLedgerAdapter = (options: EvmLedgerOptions): Promise<WalletAdapter> => {
  let chainId = options.chainId ?? DEFAULT_CHAIN_ID;

  const core = createLedgerAdapterCore<EthAppLike>({
    accountCount: options.accountCount,
    addressAt: async (eth, path) => {
      const result = await eth.getAddress(path);
      return result.address;
    },
    addressesEqual: (a, b) => a.toLowerCase() === b.toLowerCase(),
    derivationPathPrefix: options.derivationPathPrefix ?? DEFAULT_DERIVATION_PATH_PREFIX,
    getBalanceHint: "Use viem/ethers with your own RPC URL.",
    icon: options.icon,
    id: options.id,
    loadApp: async () => {
      const EthApp = options.eth ?? (await loadEth());
      return (transport) => new EthApp(transport);
    },
    name: options.name,
    pathAt: (prefix, index) => `${prefix}/${index}`,
    sendTxHint: "Use `getSigner()` + viem/ethers.",
    switchAccountHint: "signMessage(msg, account)",
    transport: options.transport,
  });

  const currentChain = (): ChainBase => buildEvmChain(chainId, core.name);

  const adapter: WalletAdapter = {
    capabilities: LEDGER_CAPABILITIES,
    chainPlatform: "evm",
    connect: core.connect,
    disconnect: core.disconnect,

    getAccount: () => {
      const address = core.currentAddress();
      return Promise.resolve(address === null ? null : buildEvmAccount(address, currentChain()));
    },

    async getAccounts() {
      const chain = currentChain();
      const addresses = await core.listAddresses();
      return addresses.map((address) => buildEvmAccount(address, chain));
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
      const eth = core.requireApp();
      const path = await core.resolvePath(account);
      const { r, s, v } = await eth.signPersonalMessage(path, bytesToHex(message));
      const sigHex = `${r.padStart(64, "0")}${s.padStart(64, "0")}${v.toString(16).padStart(2, "0")}`;
      return { signature: hexToBytes(sigHex), signedMessage: message };
    },

    subscribe: core.subscribe,
    switchAccount: core.switchAccount,

    switchChain: (chain) => {
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
export { LEDGER_ICON as LEDGER_DEFAULT_ICON } from "../adapter-core";
export { createEvmLedgerAdapter };
