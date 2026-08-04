import { logWarn } from "@usebutr/core";

import type { TransportFactory, TransportLike } from "./transport";
import { loadTransport } from "./transport";

/** Generic Ledger device glyph, shared by every app adapter. Each app
 *  re-exports it under its own public name. */
const LEDGER_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwMCI+PHJlY3QgeD0iMyIgeT0iNyIgd2lkdGg9IjEzIiBoZWlnaHQ9IjEwIiByeD0iMSIvPjxyZWN0IHg9IjE3IiB5PSI3IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTciIHk9IjE0IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI3IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";

const NOT_CONNECTED = "[butr/ledger] not connected: call connect() first";

type LedgerAdapterCoreInput<TApp> = {
  accountCount?: number;
  /** Read the address the device derives at `path`. Every Ledger app has its
   *  own instruction (`getAddress`, `getPublicKey`, `getWalletPublicKey`) and
   *  its own address encoding, so the platform file owns this call. */
  addressAt: (app: TApp, path: string) => Promise<string>;
  /** Address comparison. EVM overrides it: the device and the caller can
   *  disagree on EIP-55 checksum casing for the same address. */
  addressesEqual?: (a: string, b: string) => boolean;
  /** Already-resolved BIP-32 path prefix; the platform file owns the default
   *  because the convention is chain-specific. */
  derivationPathPrefix: string;
  /** Follows the shared "Ledger has no RPC." preamble. */
  getBalanceHint: string;
  icon?: string;
  id?: string;
  /** Resolve the app constructor BEFORE the transport opens, then bind it to
   *  the opened transport. Two phases so a missing optional peer dep fails
   *  before the browser pops its WebUSB device picker. */
  loadApp: () => Promise<(transport: TransportLike) => TApp>;
  name?: string;
  /** Build the derivation path for an account index. Hardening of the last
   *  segment differs per chain (`/0` on EVM and Bitcoin, `/0'` on Solana
   *  and Sui). */
  pathAt: (prefix: string, index: number) => string;
  /** Follows the shared "Ledger signs but doesn't broadcast." preamble. */
  sendTxHint: string;
  /** The call that routes through another derivation path, named in the
   *  `switchAccount` rejection. */
  switchAccountHint: string;
  transport?: TransportFactory;
};

type LedgerAdapterCore<TApp> = {
  connect: (opts?: { silent?: boolean }) => Promise<void>;
  /** Active address, or `null` before `connect()` / after `disconnect()`. */
  currentAddress: () => string | null;
  disconnect: () => Promise<void>;
  getBalance: () => Promise<never>;
  getSigner: () => Promise<unknown>;
  getTransactionReceipt: () => Promise<never>;
  icon: string;
  id: string;
  /** Every address within `accountCount`, in derivation order. Empty before
   *  `connect()`. */
  listAddresses: () => Promise<Array<string>>;
  name: string;
  /** The live app instance; throws when disconnected. Every signing path
   *  starts here. */
  requireApp: () => TApp;
  /** Derivation path to sign `account` with, walking the device up to
   *  `accountCount` paths when it isn't the active address. */
  resolvePath: (account?: { walletAddress: string }) => Promise<string>;
  sendTx: () => Promise<never>;
  sendTxToChain: () => Promise<never>;
  subscribe: () => () => void;
  switchAccount: () => Promise<never>;
};

/**
 * Device plumbing every Ledger app adapter repeats: the transport +
 * app-instance lifecycle, the derivation-path walk that maps a butr
 * `Account` back to the path the device signs with, and the rejections for
 * the RPC-backed methods Ledger has no answer for (it signs, it never
 * broadcasts, and it emits no events).
 *
 * App packages keep only what genuinely differs: their chain shape, the
 * device instructions they call, and how they encode addresses,
 * transactions, and signatures.
 */
const createLedgerAdapterCore = <TApp>({
  accountCount: requestedAccountCount,
  addressAt,
  addressesEqual = (a, b) => a === b,
  derivationPathPrefix,
  getBalanceHint,
  icon = LEDGER_ICON,
  id = "ledger",
  loadApp,
  name = "Ledger",
  pathAt,
  sendTxHint,
  switchAccountHint,
  transport: transportFactory,
}: LedgerAdapterCoreInput<TApp>): LedgerAdapterCore<TApp> => {
  const accountCount = Math.max(1, requestedAccountCount ?? 1);
  const pathAtIndex = (index: number): string => pathAt(derivationPathPrefix, index);

  let transport: TransportLike | null = null;
  let app: TApp | null = null;
  let currentAddress: string | null = null;

  const requireApp = (): TApp => {
    if (app === null) {
      throw new Error(NOT_CONNECTED);
    }
    return app;
  };

  const matchesCurrent = (address: string): boolean =>
    currentAddress !== null && addressesEqual(address, currentAddress);

  return {
    async connect(opts) {
      if (opts?.silent === true) {
        // Ledger connect always shows the browser's WebUSB device picker;
        // there is no silent reconnect. Reject so eager hydration doesn't
        // pop the chooser on page load.
        throw new Error("Ledger requires an interactive connect");
      }
      const factory = transportFactory ?? (await loadTransport());
      const bindApp = await loadApp();
      transport = await factory.create();
      app = bindApp(transport);
      currentAddress = await addressAt(app, pathAtIndex(0));
    },

    currentAddress: () =>
      currentAddress === null || currentAddress === "" ? null : currentAddress,

    async disconnect() {
      try {
        await transport?.close();
      } catch (error) {
        logWarn("[butr/ledger] transport.close threw:", error);
      }
      transport = null;
      app = null;
      currentAddress = null;
    },

    getBalance: () =>
      Promise.reject(
        new Error(`[butr/ledger] getBalance not supported: Ledger has no RPC. ${getBalanceHint}`),
      ),

    getSigner: () => Promise.resolve(app),

    getTransactionReceipt: () =>
      Promise.reject(
        new Error("[butr/ledger] getTransactionReceipt not supported: Ledger has no RPC."),
      ),

    icon,
    id,

    async listAddresses() {
      if (app === null) {
        return [];
      }
      const addresses: Array<string> = [];
      // Sequential walk; the device serialises USB requests; parallel
      // calls would deadlock the transport. Slow but correct.
      for (let i = 0; i < accountCount; i += 1) {
        // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
        addresses.push(await addressAt(app, pathAtIndex(i)));
      }
      return addresses;
    },

    name,
    requireApp,

    async resolvePath(account) {
      const instance = requireApp();
      if (!account || matchesCurrent(account.walletAddress)) {
        return pathAtIndex(0);
      }
      for (let i = 0; i < accountCount; i += 1) {
        const candidatePath = pathAtIndex(i);
        // eslint-disable-next-line no-await-in-loop -- Ledger device requires sequential APDU access; cannot parallelize
        const candidateAddress = await addressAt(instance, candidatePath);
        if (addressesEqual(candidateAddress, account.walletAddress)) {
          return candidatePath;
        }
      }
      throw new Error(
        `[butr/ledger] address ${account.walletAddress} not found on this device within ${accountCount} derivation paths`,
      );
    },

    sendTx: () =>
      Promise.reject(
        new Error(
          `[butr/ledger] sendTx not supported: Ledger signs but doesn't broadcast. ${sendTxHint}`,
        ),
      ),

    sendTxToChain: () =>
      Promise.reject(
        new Error("[butr/ledger] sendTxToChain not supported: Ledger signs but doesn't broadcast."),
      ),

    subscribe: () => () => {},

    switchAccount: () =>
      Promise.reject(
        new Error(
          `[butr/ledger] switchAccount not supported: pick a different account via ${switchAccountHint} using a different derivation path`,
        ),
      ),
  };
};

export type { LedgerAdapterCore, LedgerAdapterCoreInput };
export { createLedgerAdapterCore, LEDGER_ICON };
