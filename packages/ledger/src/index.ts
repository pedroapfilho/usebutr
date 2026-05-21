// @usebutr/ledger — Ledger hardware wallet adapter (WebUSB transport).
//
// Requires the optional peer dep `@ledgerhq/hw-transport-webusb` plus
// the per-platform Ledger app module:
//   - `@ledgerhq/hw-app-eth` for EVM
//   - `@ledgerhq/hw-app-solana` for SVM
//   - `@ledgerhq/hw-app-sui` for Sui
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
// Usage (Solana):
//
// ```ts
// import { createLedgerAdapter } from "@usebutr/ledger";
//
// const ledger = await createLedgerAdapter({
//   platform: "svm",
//   cluster: "mainnet",
//   accountCount: 3,
// });
// ```
//
// Usage (Sui):
//
// ```ts
// import { createLedgerAdapter } from "@usebutr/ledger";
//
// const ledger = await createLedgerAdapter({
//   platform: "sui",
//   cluster: "mainnet",
//   accountCount: 3,
// });
// ```
//
// Direct per-platform factories (also exported):
//
// ```ts
// import {
//   createEvmLedgerAdapter,
//   createSvmLedgerAdapter,
//   createSuiLedgerAdapter,
// } from "@usebutr/ledger";
//
// const evm = await createEvmLedgerAdapter({ chainId: 1 });
// const svm = await createSvmLedgerAdapter({ platform: "svm" });
// const sui = await createSuiLedgerAdapter({ platform: "sui" });
// ```

export type {
  EthAppConstructor,
  EthAppLike,
  EvmLedgerOptions,
  LedgerOptions,
  SolanaAppConstructor,
  SolanaAppLike,
  SolanaCluster,
  SuiAppConstructor,
  SuiAppLike,
  SuiCluster,
  SuiLedgerOptions,
  SvmLedgerOptions,
  TransportFactory,
  TransportLike,
} from "./adapter";
export {
  LEDGER_DEFAULT_ICON,
  LEDGER_SUI_DEFAULT_ICON,
  createEvmLedgerAdapter,
  createLedgerAdapter,
  createSuiLedgerAdapter,
  createSvmLedgerAdapter,
} from "./adapter";
export { LEDGER_CAPABILITIES } from "./capabilities";
