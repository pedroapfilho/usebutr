import type { WalletAdapterFor } from "@usebutr/core";

import type { BitcoinLedgerOptions } from "./apps/bitcoin";
import { createBitcoinLedgerAdapter } from "./apps/bitcoin";
import type { EvmLedgerOptions } from "./apps/evm";
import { createEvmLedgerAdapter } from "./apps/evm";
import type { SuiLedgerOptions } from "./apps/sui";
import { createSuiLedgerAdapter } from "./apps/sui";
import type { SvmLedgerOptions } from "./apps/svm";
import { createSvmLedgerAdapter } from "./apps/svm";

type LedgerOptions = BitcoinLedgerOptions | EvmLedgerOptions | SuiLedgerOptions | SvmLedgerOptions;

/**
 * Requires a Chromium-based browser: Firefox and Safari ship no WebUSB.
 * `platform` picks the device app. The per-platform factories resolve the
 * narrower adapter type.
 */
const createLedgerAdapter = (
  options: LedgerOptions,
): Promise<WalletAdapterFor<LedgerOptions["platform"]>> => {
  const { platform } = options;
  switch (options.platform) {
    case "bitcoin": {
      return createBitcoinLedgerAdapter(options);
    }
    case "evm": {
      return createEvmLedgerAdapter(options);
    }
    case "sui": {
      return createSuiLedgerAdapter(options);
    }
    case "svm": {
      return createSvmLedgerAdapter(options);
    }
    default: {
      // Reachable only from untyped callers.
      return Promise.reject(new Error(`[butr/ledger] no Ledger app for platform "${platform}"`));
    }
  }
};

export type { LedgerOptions };
export { createLedgerAdapter };
