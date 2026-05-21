import type { ChainPlatform, WalletAdapter } from "@usebutr/core";

import type {
  BitcoinAddressFormat,
  BitcoinLedgerOptions,
  BtcAppConstructor,
  BtcAppLike,
} from "./apps/bitcoin";
import { createBitcoinLedgerAdapter, LEDGER_BITCOIN_DEFAULT_ICON } from "./apps/bitcoin";
import type { EthAppConstructor, EthAppLike, EvmLedgerOptions } from "./apps/evm";
import { createEvmLedgerAdapter, LEDGER_DEFAULT_ICON } from "./apps/evm";
import type { SuiAppConstructor, SuiAppLike, SuiCluster, SuiLedgerOptions } from "./apps/sui";
import { createSuiLedgerAdapter, LEDGER_SUI_DEFAULT_ICON } from "./apps/sui";
import type {
  SolanaAppConstructor,
  SolanaAppLike,
  SolanaCluster,
  SvmLedgerOptions,
} from "./apps/svm";
import { createSvmLedgerAdapter } from "./apps/svm";
import type { TransportFactory, TransportLike } from "./transport";

/**
 * Discriminated-union options for the unified `createLedgerAdapter`
 * factory. Each variant is **fully typed for its platform** — no
 * opaque DI bag.
 *
 * All four supported platforms ship today: EVM, SVM, Sui, Bitcoin.
 * Adding a new platform is three touches:
 *   1. Create `src/apps/<platform>.ts` with a `createXxxLedgerAdapter`
 *      and its own `XxxLedgerOptions` type.
 *   2. Extend this union with `| XxxLedgerOptions`.
 *   3. Add a `case` in the dispatch below.
 *
 * **Back-compat.** The EVM variant's `platform` field is optional, so
 * existing callers writing `createLedgerAdapter({ chainId: 1 })` keep
 * working — the dispatch defaults to EVM. The SVM, Sui, and Bitcoin
 * variants require `platform: "svm"` / `platform: "sui"` /
 * `platform: "bitcoin"` explicitly, since the option types share field
 * names (`accountCount`, `derivationPathPrefix`, …) and the discriminant
 * is the only safe way to route an EVM-looking options bag past
 * TypeScript.
 */
type LedgerOptions = EvmLedgerOptions | SvmLedgerOptions | SuiLedgerOptions | BitcoinLedgerOptions;

/**
 * Unified Ledger adapter factory. Dispatches to the per-platform
 * factory based on `options.platform`. Defaults to EVM for back-compat.
 *
 * @example
 * ```ts
 * // EVM (default — same shape as before this refactor)
 * const ledger = await createLedgerAdapter({ chainId: 1, accountCount: 3 });
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
const createLedgerAdapter = (options: LedgerOptions = {}): Promise<WalletAdapter> => {
  const platform: ChainPlatform = options.platform ?? "evm";

  switch (platform) {
    case "evm": {
      return createEvmLedgerAdapter(options as EvmLedgerOptions);
    }
    case "svm": {
      return createSvmLedgerAdapter(options as SvmLedgerOptions);
    }
    case "sui": {
      return createSuiLedgerAdapter(options as SuiLedgerOptions);
    }
    case "bitcoin": {
      return createBitcoinLedgerAdapter(options as BitcoinLedgerOptions);
    }
    default: {
      // Exhaustiveness check — every `ChainPlatform` variant ships a
      // Ledger app today. Adding a new platform to `ChainPlatform`
      // turns this into a typecheck error until the case is added.
      const _exhaustive: never = platform;
      void _exhaustive;
      return Promise.reject(
        new Error(`[butr/ledger] no Ledger app builder for platform "${platform as string}".`),
      );
    }
  }
};

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
};
export {
  LEDGER_BITCOIN_DEFAULT_ICON,
  LEDGER_DEFAULT_ICON,
  LEDGER_SUI_DEFAULT_ICON,
  createBitcoinLedgerAdapter,
  createEvmLedgerAdapter,
  createLedgerAdapter,
  createSuiLedgerAdapter,
  createSvmLedgerAdapter,
};
