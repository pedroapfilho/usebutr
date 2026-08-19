import { logWarn } from "@usebutr/core";

import type { TransportFactory, TransportLike } from "./transport";
import { loadTransport } from "./transport";

/** Generic Ledger device glyph, shared by every app adapter. Each app
 *  re-exports it under its own public name. */
const LEDGER_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwMCI+PHJlY3QgeD0iMyIgeT0iNyIgd2lkdGg9IjEzIiBoZWlnaHQ9IjEwIiByeD0iMSIvPjxyZWN0IHg9IjE3IiB5PSI3IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTciIHk9IjE0IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI3IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";

const NOT_CONNECTED = "[butr/ledger] not connected: call connect() first";

const closeTransport = async (handle: TransportLike): Promise<void> => {
  try {
    await handle.close();
  } catch (error) {
    logWarn("[butr/ledger] transport.close threw:", error);
  }
};

/** The device state that only exists between a successful `connect()` and
 *  `disconnect()`. One value so no reader can see an open transport whose
 *  address read failed, or an address whose transport is already closed. */
type LedgerSession<TApp> = {
  address: string;
  app: TApp;
  transport: TransportLike;
};

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

type LedgerAdapterCore<TApp extends object> = {
  connect: (opts?: { silent?: boolean }) => Promise<void>;
  /** Active address, or `null` before `connect()` / after `disconnect()`. */
  currentAddress: () => string | null;
  disconnect: () => Promise<void>;
  getBalance: () => Promise<never>;
  getSigner: () => Promise<TApp>;
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
 * Device plumbing every Ledger app adapter repeats. Ledger signs but never
 * broadcasts and emits no events, so the RPC-backed methods reject from here
 * rather than each app package.
 */
const createLedgerAdapterCore = <TApp extends object>({
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

  let session: LedgerSession<TApp> | null = null;
  let connecting: { generation: number; promise: Promise<void> } | null = null;
  /** Bumped by every `disconnect()`. An in-flight `connect()` compares it
   *  across its awaits and discards its transport when it moved, so a
   *  disconnect issued mid-connect can't be undone by the late address. */
  let generation = 0;

  const requireSession = (): LedgerSession<TApp> => {
    if (session === null) {
      throw new Error(NOT_CONNECTED);
    }
    return session;
  };

  const requireApp = (): TApp => requireSession().app;

  const openSession = async (): Promise<void> => {
    const openedAt = generation;
    const [factoryResult, bindAppResult] = await Promise.allSettled([
      transportFactory === undefined ? loadTransport() : Promise.resolve(transportFactory),
      loadApp(),
    ]);
    if (factoryResult.status === "rejected") {
      throw factoryResult.reason;
    }
    if (bindAppResult.status === "rejected") {
      throw bindAppResult.reason;
    }
    const factory = factoryResult.value;
    const bindApp = bindAppResult.value;
    const transport = await factory.create();
    try {
      const app = bindApp(transport);
      const address = await addressAt(app, pathAtIndex(0));
      if (generation !== openedAt) {
        await closeTransport(transport);
        return;
      }
      session = { address, app, transport };
    } catch (error) {
      await closeTransport(transport);
      throw error;
    }
  };

  return {
    async connect(opts) {
      if (opts?.silent === true) {
        throw new Error("Ledger requires an interactive connect");
      }
      if (connecting === null || connecting.generation !== generation) {
        connecting = { generation, promise: openSession() };
      }
      const inFlight = connecting;
      try {
        await inFlight.promise;
      } catch (error) {
        // A failed attempt must not be replayed: unlocking the device and
        // calling connect() again has to reach the hardware.
        if (connecting === inFlight) {
          connecting = null;
        }
        throw error;
      }
    },

    currentAddress: () => (session === null || session.address === "" ? null : session.address),

    async disconnect() {
      generation += 1;
      const active = session;
      session = null;
      if (active !== null) {
        await closeTransport(active.transport);
      }
    },

    getBalance: () =>
      Promise.reject(
        new Error(`[butr/ledger] getBalance not supported: Ledger has no RPC. ${getBalanceHint}`),
      ),

    getSigner: () => Promise.resolve(requireApp()),

    getTransactionReceipt: () =>
      Promise.reject(
        new Error("[butr/ledger] getTransactionReceipt not supported: Ledger has no RPC."),
      ),

    icon,
    id,

    async listAddresses() {
      const active = session;
      if (active === null) {
        return [];
      }
      const addresses: Array<string> = [];
      for (let i = 0; i < accountCount; i += 1) {
        // oxlint-disable-next-line react-doctor/async-await-in-loop -- Ledger transports allow one APDU exchange at a time.
        addresses.push(await addressAt(active.app, pathAtIndex(i)));
      }
      return addresses;
    },

    name,
    requireApp,

    async resolvePath(account) {
      const active = requireSession();
      if (!account || addressesEqual(account.walletAddress, active.address)) {
        return pathAtIndex(0);
      }
      for (let i = 0; i < accountCount; i += 1) {
        const candidatePath = pathAtIndex(i);
        // oxlint-disable-next-line react-doctor/async-await-in-loop -- Ledger transports allow one APDU exchange at a time.
        const candidateAddress = await addressAt(active.app, candidatePath);
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
