// @usebutr/ledger — Ledger hardware wallet adapter (WebUSB transport).
//
// Requires the optional peer dep `@ledgerhq/hw-transport-webusb` plus
// the per-platform Ledger app module:
//   - `@ledgerhq/hw-app-eth` for EVM
//   - `@ledgerhq/hw-app-solana` for SVM
//   - `@ledgerhq/hw-app-sui` for Sui
//   - `@ledgerhq/hw-app-btc` for Bitcoin
//
// Usage (EVM):
//
// ```ts
// import { createLedgerAdapter } from "@usebutr/ledger";
//
// const ledger = await createLedgerAdapter({
//   platform: "evm",
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
// Usage (Bitcoin):
//
// ```ts
// import { createLedgerAdapter } from "@usebutr/ledger";
//
// const ledger = await createLedgerAdapter({
//   platform: "bitcoin",
//   addressFormat: "bech32",
//   accountCount: 3,
// });
// ```
//
// Direct per-platform factories (also exported):
//
// ```ts
// import {
//   createBitcoinLedgerAdapter,
//   createEvmLedgerAdapter,
//   createSuiLedgerAdapter,
//   createSvmLedgerAdapter,
// } from "@usebutr/ledger";
//
// const evm = await createEvmLedgerAdapter({ chainId: 1 });
// const svm = await createSvmLedgerAdapter({ platform: "svm" });
// const sui = await createSuiLedgerAdapter({ platform: "sui" });
// const btc = await createBitcoinLedgerAdapter({ platform: "bitcoin" });
// ```

export type {
  BitcoinAddressFormat,
  BitcoinLedgerOptions,
  BtcAppConstructor,
  BtcAppLike,
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
  LEDGER_BITCOIN_DEFAULT_ICON,
  LEDGER_DEFAULT_ICON,
  LEDGER_SUI_DEFAULT_ICON,
  LEDGER_SVM_DEFAULT_ICON,
  createBitcoinLedgerAdapter,
  createEvmLedgerAdapter,
  createLedgerAdapter,
  createSuiLedgerAdapter,
  createSvmLedgerAdapter,
} from "./adapter";
export { LEDGER_CAPABILITIES } from "./capabilities";
