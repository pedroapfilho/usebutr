import type { WalletAdapter } from "@usebutr/core";

import type { BitcoinLedgerOptions } from "./apps/bitcoin";
import { createBitcoinLedgerAdapter } from "./apps/bitcoin";
import type { EvmLedgerOptions } from "./apps/evm";
import { createEvmLedgerAdapter } from "./apps/evm";
import type { SuiLedgerOptions } from "./apps/sui";
import { createSuiLedgerAdapter } from "./apps/sui";
import type { SvmLedgerOptions } from "./apps/svm";
import { createSvmLedgerAdapter } from "./apps/svm";

/** Each variant is fully typed for its platform, so `platform` is the only
 *  discriminant that routes the heterogeneous option types past TypeScript. */
type LedgerOptions = EvmLedgerOptions | SvmLedgerOptions | SuiLedgerOptions | BitcoinLedgerOptions;

/**
 * Requires a Chromium-based browser: Firefox and Safari ship no WebUSB. Ledger
 * signs but never broadcasts, so `sendTx`, `sendTxToChain`, `getBalance`, and
 * `getTransactionReceipt` throw and their capabilities are `false`.
 */
const createLedgerAdapter = (options: LedgerOptions): Promise<WalletAdapter> => {
  const requestedPlatform: string = options.platform;
  switch (options.platform) {
    case "evm": {
      return createEvmLedgerAdapter(options);
    }
    case "svm": {
      return createSvmLedgerAdapter(options);
    }
    case "sui": {
      return createSuiLedgerAdapter(options);
    }
    case "bitcoin": {
      return createBitcoinLedgerAdapter(options);
    }
    default: {
      const _exhaustive: never = options;
      void _exhaustive;
      return Promise.reject(
        new Error(`[butr/ledger] no Ledger app builder for platform "${requestedPlatform}".`),
      );
    }
  }
};

export type {
  BitcoinAddressFormat,
  BitcoinLedgerOptions,
  BtcAppConstructor,
  BtcAppLike,
} from "./apps/bitcoin";
export type { EthAppConstructor, EthAppLike, EvmLedgerOptions } from "./apps/evm";
export type {
  SolanaAppConstructor,
  SolanaAppLike,
  SolanaCluster,
  SvmLedgerOptions,
} from "./apps/svm";
export type { SuiAppConstructor, SuiAppLike, SuiCluster, SuiLedgerOptions } from "./apps/sui";
export type { TransportFactory, TransportLike } from "./transport";
export type { LedgerOptions };
export { createBitcoinLedgerAdapter, LEDGER_BITCOIN_DEFAULT_ICON } from "./apps/bitcoin";
export { createEvmLedgerAdapter, LEDGER_DEFAULT_ICON } from "./apps/evm";
export { createSuiLedgerAdapter, LEDGER_SUI_DEFAULT_ICON } from "./apps/sui";
export { createSvmLedgerAdapter, LEDGER_SVM_DEFAULT_ICON } from "./apps/svm";
export { createLedgerAdapter };
