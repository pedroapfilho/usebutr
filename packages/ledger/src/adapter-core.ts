import type {
  ChainBase,
  ChainTarget,
  Connector,
  TransactionOptions,
  WalletSigner,
} from "@usebutr/core";
import {
  buildAccount,
  createFixedChainTarget,
  hexToBytes,
  logWarn,
  resolveChain,
  toConnectionError,
} from "@usebutr/core";

/** Generic Ledger device glyph, shared by every app adapter. */
const LEDGER_DEFAULT_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwMCI+PHJlY3QgeD0iMyIgeT0iNyIgd2lkdGg9IjEzIiBoZWlnaHQ9IjEwIiByeD0iMSIvPjxyZWN0IHg9IjE3IiB5PSI3IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTciIHk9IjE0IiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI3IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";

type TransportLike = {
  close: () => Promise<void>;
};

/** The static side of `@ledgerhq/hw-transport-webusb`'s default export. */
type TransportFactory = {
  create: (timeout?: number) => Promise<TransportLike>;
};

/** Options every Ledger app adapter takes. */
type LedgerBaseOptions = {
  /** Accounts to expose, read from consecutive derivation paths during
   *  `connect()`. Each read is a device round trip (~1-2 s). Default: 1. */
  accountCount?: number;
  /** CAIP-2 id the accounts are reported on, e.g. `SVM_CHAINS.devnet.id`.
   *  Ledger apps have no network switch (Bitcoin testnet is its own device
   *  app), so build one adapter per chain. Default: the platform's mainnet. */
  chainId?: string;
  /** BIP-32 path the account index is appended to as the last segment. */
  derivationPathPrefix?: string;
  /** Default: `LEDGER_DEFAULT_ICON`. */
  icon?: string;
  /** Default: `"ledger"`. */
  id?: string;
  /** Default: `"Ledger"`. */
  name?: string;
  /** DI override for the WebUSB transport (tests). Default: a dynamic import
   *  of `@ledgerhq/hw-transport-webusb`. */
  transport?: TransportFactory;
};

type LedgerAppSpec<TApp> = {
  /** Every app has its own address instruction and encoding. */
  addressAt: (app: TApp, path: string) => Promise<string>;
  /** The platform's registry, for chain names. */
  chains: ReadonlyArray<ChainBase>;
  defaultChain: ChainBase;
  defaultPathPrefix: string;
  /** ed25519 (SLIP-0010) derives hardened indices only. */
  hardenedIndex: boolean;
  /** Resolves the app class, then binds it to the opened transport. Two
   *  phases so a missing peer fails before the browser's WebUSB picker. */
  loadApp: () => Promise<(transport: TransportLike) => TApp>;
  signer: (app: TApp) => WalletSigner;
};

type LedgerAdapterCore<TApp> = {
  /** Spread into the adapter. */
  base: Pick<Connector, "connect" | "disconnect" | "getAccounts" | "icon" | "id" | "name"> & {
    getSigner: () => Promise<WalletSigner>;
  };
  /** The device app, derivation path and address a call signs with.
   *  Rejections are the chain target's. */
  resolve: (options?: TransactionOptions) => { address: string; app: TApp; path: string };
};

/** The device state between a successful `connect()` and `disconnect()`, as
 *  one value so no reader sees an open transport without its addresses. */
type LedgerSession<TApp> = {
  addresses: ReadonlyArray<string>;
  app: TApp;
  transport: TransportLike;
};

/**
 * Optional peers, loaded on demand and checked so a bad install fails before
 * the WebUSB picker opens. The class is the default export, one hop deeper
 * when Node's ESM-to-CJS interop wraps a CJS build's `exports` object.
 */
const loadPeer = async <T>(
  imported: Promise<unknown>,
  peer: string,
  isExport: (value: unknown) => value is T,
): Promise<T> => {
  const mod = await imported;

  const outer =
    typeof mod === "object" && mod !== null && "default" in mod ? mod.default : undefined;

  const exported =
    typeof outer === "object" && outer !== null && "default" in outer ? outer.default : outer;

  if (!isExport(exported)) {
    throw new Error(`[butr/ledger] ${peer} did not load: install a supported version`);
  }

  return exported;
};

/** A dynamic import carries no constructor type, so the prototype's methods
 *  are the evidence that the export is the class the app declares. */
const isClassWith =
  <TClass extends abstract new (...args: never) => object>(
    ...methods: ReadonlyArray<keyof InstanceType<TClass> & string>
  ) =>
  (value: unknown): value is TClass => {
    if (typeof value !== "function") {
      return false;
    }

    const prototype: unknown = value.prototype;

    return (
      typeof prototype === "object" &&
      prototype !== null &&
      methods.every((method) => method in prototype)
    );
  };

const isTransportFactory = (value: unknown): value is TransportFactory =>
  typeof value === "function" && "create" in value && typeof value.create === "function";

/** Ledger apps return `r` and `s` as hex with leading zero bytes dropped. */
const rsBytes = (r: string, s: string): Uint8Array =>
  hexToBytes(`${r.padStart(64, "0")}${s.padStart(64, "0")}`);

const closeTransport = async (transport: TransportLike): Promise<void> => {
  try {
    await transport.close();
  } catch (error) {
    logWarn("[butr/ledger] transport.close threw:", error);
  }
};

/**
 * Device plumbing every Ledger app shares. A Ledger signs but has no RPC and
 * pushes no events: no `sendTx`, `getBalance` or `subscribe`. Accounts are
 * read once per session, as each read is a device round trip.
 */
const createLedgerAdapterCore = <TApp>(
  options: LedgerBaseOptions,
  spec: LedgerAppSpec<TApp>,
): Promise<LedgerAdapterCore<TApp>> => {
  const chain = resolveChain(options.chainId ?? spec.defaultChain.id, spec.chains);
  const name = options.name ?? "Ledger";
  let target: ChainTarget<string>;

  try {
    target = createFixedChainTarget({
      chain,
      namespace: spec.defaultChain.namespace,
      wallet: name,
    });
  } catch (error) {
    return Promise.reject(toConnectionError(error));
  }

  const accountCount = Math.max(1, options.accountCount ?? 1);
  const prefix = options.derivationPathPrefix ?? spec.defaultPathPrefix;
  const pathAt = (index: number) => `${prefix}/${index}${spec.hardenedIndex ? "'" : ""}`;

  let session: LedgerSession<TApp> | null = null;
  let connecting: { generation: number; promise: Promise<void> } | null = null;
  /** Bumped by every `disconnect()`. An in-flight `connect()` compares it
   *  across its awaits and discards its transport when it moved, so a
   *  disconnect issued mid-connect can't be undone by the late addresses. */
  let generation = 0;

  const openSession = async (): Promise<void> => {
    const openedAt = generation;

    const [factory, bindApp] = await Promise.all([
      options.transport ??
        loadPeer(
          import("@ledgerhq/hw-transport-webusb"),
          "@ledgerhq/hw-transport-webusb",
          isTransportFactory,
        ),
      spec.loadApp(),
    ]);

    const transport = await factory.create();

    try {
      const app = bindApp(transport);
      const addresses: Array<string> = [];

      for (let index = 0; index < accountCount; index += 1) {
        addresses.push(await spec.addressAt(app, pathAt(index)));
      }

      if (generation !== openedAt) {
        await closeTransport(transport);

        return;
      }

      session = { addresses, app, transport };
    } catch (error) {
      await closeTransport(transport);
      throw error;
    }
  };

  return Promise.resolve({
    base: {
      async connect(connectOptions) {
        if (connectOptions?.silent === true) {
          throw new Error("[butr/ledger] a Ledger needs an interactive connect");
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
      async disconnect() {
        generation += 1;
        const active = session;
        session = null;

        if (active !== null) {
          await closeTransport(active.transport);
        }
      },
      getAccounts: () =>
        Promise.resolve(session?.addresses.map((address) => buildAccount(address, chain)) ?? []),
      async getSigner() {
        const { app } = target.connected(session);
        await Promise.resolve();

        return spec.signer(app);
      },
      icon: options.icon ?? LEDGER_DEFAULT_ICON,
      id: options.id ?? "ledger",
      name,
    },
    resolve: (callOptions) => {
      const { addresses, app } = target.connected(session);
      target.chain(callOptions?.chain);
      const address = target.account(addresses, callOptions?.account);

      return { address, app, path: pathAt(addresses.indexOf(address)) };
    },
  });
};

export type { LedgerBaseOptions, TransportFactory, TransportLike };

export { createLedgerAdapterCore, isClassWith, LEDGER_DEFAULT_ICON, loadPeer, rsBytes };
