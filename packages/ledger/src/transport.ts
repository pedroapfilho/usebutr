type TransportLike = {
  close: () => Promise<void>;
};

type TransportFactory = {
  create: (timeout?: number) => Promise<TransportLike>;
};

const loadTransport = async (): Promise<TransportFactory> => {
  const imported: unknown = await import("@ledgerhq/hw-transport-webusb");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: The supported peer range exports a WebUSB transport class with the static create contract.
  const moduleValue = imported as {
    default?: TransportFactory;
  };
  if (!moduleValue.default) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-transport-webusb: install it as an optional peer dep",
    );
  }
  return moduleValue.default;
};

export type { TransportFactory, TransportLike };
export { loadTransport };
