// @usebutr/ledger — Ledger hardware wallet adapter (WebUSB transport).
//
// Requires the optional peer dep `@ledgerhq/hw-transport-webusb` plus
// the per-platform Ledger app module:
//   - `@ledgerhq/hw-app-eth` for EVM (ships today)
//   - (future) `@ledgerhq/hw-app-solana` for SVM
//   - (future) `@ledgerhq/hw-app-sui` for Sui
//   - (future) `@ledgerhq/hw-app-btc` for Bitcoin
//
// Usage (EVM — default, back-compat):
//
// ```ts
// import { createLedgerAdapter } from "@usebutr/ledger";
//
// const ledger = await createLedgerAdapter({
//   chainId: 1,
//   accountCount: 3,
// });
// ```
//
// Direct per-platform factory (also exported):
//
// ```ts
// import { createEvmLedgerAdapter } from "@usebutr/ledger";
//
// const ledger = await createEvmLedgerAdapter({ chainId: 1 });
// ```

export type {
  EthAppConstructor,
  EthAppLike,
  EvmLedgerOptions,
  LedgerOptions,
  TransportFactory,
  TransportLike,
} from "./adapter";
export { LEDGER_DEFAULT_ICON, createEvmLedgerAdapter, createLedgerAdapter } from "./adapter";
export { LEDGER_CAPABILITIES } from "./capabilities";
