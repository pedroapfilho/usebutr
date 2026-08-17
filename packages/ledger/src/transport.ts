type TransportLike = {
  close: () => Promise<void>;
};

type TransportFactory = {
  create: (timeout?: number) => Promise<TransportLike>;
};

/**
 * The import stays dynamic so the peer dep remains optional and consumers
 * without Ledger support pay no bundle cost. WebUSB ships on Chromium-based
 * browsers only; Firefox and Safari have no transport here.
 */
const loadTransport = async (): Promise<TransportFactory> => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- untyped optional peer-dep module boundary
  const mod = (await import("@ledgerhq/hw-transport-webusb")) as unknown as {
    default?: TransportFactory;
  };
  if (!mod.default) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-transport-webusb: install it as an optional peer dep",
    );
  }
  return mod.default;
};

export type { TransportFactory, TransportLike };
export { loadTransport };
