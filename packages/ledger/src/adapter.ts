import type { WalletAdapter } from "@usebutr/core";

import type { BitcoinLedgerOptions } from "./apps/bitcoin";
import { createBitcoinLedgerAdapter } from "./apps/bitcoin";
import type { EvmLedgerOptions } from "./apps/evm";
import { createEvmLedgerAdapter } from "./apps/evm";
import type { SuiLedgerOptions } from "./apps/sui";
import { createSuiLedgerAdapter } from "./apps/sui";
import type { SvmLedgerOptions } from "./apps/svm";
import { createSvmLedgerAdapter } from "./apps/svm";

/**
 * Discriminated-union options for the unified `createLedgerAdapter`
 * factory. Each variant is **fully typed for its platform**; no
 * opaque DI bag.
 *
 * All four supported platforms ship today: EVM, SVM, Sui, Bitcoin.
 * Every caller passes `platform` explicitly; the discriminant is the
 * only safe way to route the heterogeneous option types past TypeScript.
 *
 * Adding a new platform is three touches:
 *   1. Create `src/apps/<platform>.ts` with a `createXxxLedgerAdapter`
 *      and its own `XxxLedgerOptions` type.
 *   2. Extend this union with `| XxxLedgerOptions`.
 *   3. Add a `case` in the dispatch below.
 */
type LedgerOptions = EvmLedgerOptions | SvmLedgerOptions | SuiLedgerOptions | BitcoinLedgerOptions;

/**
 * Unified Ledger adapter factory. Dispatches to the per-platform
 * factory based on `options.platform`.
 *
 * @example
 * ```ts
 * // EVM
 * const ledger = await createLedgerAdapter({ platform: "evm", chainId: 1 });
 *
 * // Solana
 * const ledger = await createLedgerAdapter({ platform: "svm", cluster: "mainnet" });
 *
 * // Sui
 * const ledger = await createLedgerAdapter({ platform: "sui", cluster: "mainnet" });
 *
 * // Bitcoin
 * const ledger = await createLedgerAdapter({
 *   platform: "bitcoin",
 *   addressFormat: "bech32",
 * });
 * ```
 *
 * **Why the dispatch lives here.** Each platform's factory has its own
 * fully-typed options (no `unknown`, no opaque DI bag). The dispatch
 * is the only place that observes the heterogeneous union. Adding a
 * new platform: write the factory in `apps/<platform>.ts`, extend
 * `LedgerOptions`, add the `case`. Three touches.
 *
 * **Browser support.** WebUSB works in Chromium-based browsers
 * (Chrome, Edge, Brave, Arc). Firefox and Safari don't ship WebUSB.
 *
 * **Signing only.** Ledger signs but doesn't broadcast. `sendTx` /
 * `sendTxToChain` / `getBalance` / `getTransactionReceipt` throw;
 * capability flags are `false`. Wrap the signer (via `getSigner()`)
 * with viem / ethers / @solana/kit / @mysten/sui / bitcoinjs-lib and
 * your own RPC client to complete the send.
 */
const createLedgerAdapter = (options: LedgerOptions): Promise<WalletAdapter> => {
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
      // Exhaustiveness check; every `ChainPlatform` variant ships a
      // Ledger app today. Adding a new platform to `ChainPlatform`
      // turns this into a typecheck error until the case is added.
      const _exhaustive: never = options;
      void _exhaustive;
      return Promise.reject(
        new Error("[butr/ledger] no Ledger app builder for the given platform."),
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
