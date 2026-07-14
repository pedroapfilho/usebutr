/**
 * WebUSB transport loading + minimal type surface.
 *
 * Every Ledger app (the Ethereum app, the Solana app, the Sui app, the
 * Bitcoin app) talks to the device through one of these transports.
 * Only the per-app instructions (`@ledgerhq/hw-app-eth`, `hw-app-solana`,
 * `hw-app-sui`, `hw-app-btc`) differ. Pulling the transport out of the
 * monolithic adapter lets each per-platform builder share the same
 * open/close lifecycle.
 */

type TransportLike = {
  close: () => Promise<void>;
};

type TransportFactory = {
  create: (timeout?: number) => Promise<TransportLike>;
};

/**
 * Dynamic-import `@ledgerhq/hw-transport-webusb`. Kept dynamic so the
 * peer dep stays optional; consumers who don't ship Ledger support
 * pay no bundle cost.
 *
 * Browser support: Chromium-based (Chrome, Edge, Brave, Arc). Firefox
 * and Safari don't ship WebUSB. A future WebHID transport would cover
 * Safari but isn't wired here.
 */
const loadTransport = async (): Promise<TransportFactory> => {
  const mod = (await import("@ledgerhq/hw-transport-webusb")) as unknown as {
    default?: TransportFactory;
  };
  if (!mod.default) {
    throw new Error(
      "[butr/ledger] failed to load @ledgerhq/hw-transport-webusb — install it as an optional peer dep",
    );
  }
  return mod.default;
};

export type { TransportFactory, TransportLike };
export { loadTransport };
