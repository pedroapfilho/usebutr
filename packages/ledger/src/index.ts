export type { TransportFactory, TransportLike } from "./adapter-core";
export { LEDGER_DEFAULT_ICON } from "./adapter-core";

export type { LedgerOptions } from "./adapter";
export { createLedgerAdapter } from "./adapter";

export type {
  BitcoinAddressFormat,
  BitcoinLedgerOptions,
  BtcAppConstructor,
  BtcAppLike,
} from "./apps/bitcoin";
export { createBitcoinLedgerAdapter } from "./apps/bitcoin";

export type { EthAppConstructor, EthAppLike, EvmLedgerOptions } from "./apps/evm";
export { createEvmLedgerAdapter } from "./apps/evm";

export type { SuiAppConstructor, SuiAppLike, SuiLedgerOptions } from "./apps/sui";
export { createSuiLedgerAdapter } from "./apps/sui";

export type { SolanaAppConstructor, SolanaAppLike, SvmLedgerOptions } from "./apps/svm";
export { createSvmLedgerAdapter } from "./apps/svm";

import "./signer-augmentation";
