import type { ChainPlatform, WalletAdapter } from "@usebutr/core";

import type { EthAppConstructor, EthAppLike, EvmLedgerOptions } from "./apps/evm";
import { createEvmLedgerAdapter, LEDGER_DEFAULT_ICON } from "./apps/evm";
import type { TransportFactory, TransportLike } from "./transport";

/**
 * Discriminated-union options for the unified `createLedgerAdapter`
 * factory. Each variant is **fully typed for its platform** — no
 * opaque DI bag.
 *
 * Today only the EVM variant is implemented. Future variants (SVM /
 * Sui / Bitcoin) are added by:
 *   1. Creating `src/apps/<platform>.ts` with a `createXxxLedgerAdapter`
 *      and its own `XxxLedgerOptions` type.
 *   2. Extending this union with `| XxxLedgerOptions`.
 *   3. Adding a `case` in the dispatch below.
 *
 * Three touch points, no shared interface that has to keep up.
 *
 * **Back-compat.** The EVM variant's `platform` field is optional, so
 * existing callers writing `createLedgerAdapter({ chainId: 1 })` keep
 * working — the dispatch defaults to EVM.
 */
type LedgerOptions = EvmLedgerOptions;
// Future:
// type LedgerOptions = EvmLedgerOptions | SvmLedgerOptions | SuiLedgerOptions | BitcoinLedgerOptions;

/**
 * Unified Ledger adapter factory. Dispatches to the per-platform
 * factory based on `options.platform`. Defaults to EVM for back-compat.
 *
 * @example
 * ```ts
 * // EVM (default — same shape as before this refactor)
 * const ledger = await createLedgerAdapter({ chainId: 1, accountCount: 3 });
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
 * with viem / ethers and your own RPC client to complete the send.
 */
const createLedgerAdapter = (options: LedgerOptions = {}): Promise<WalletAdapter> => {
  const platform: ChainPlatform = options.platform ?? "evm";

  switch (platform) {
    case "evm": {
      return createEvmLedgerAdapter(options);
    }
    // Future cases:
    // case "svm":      return createSvmLedgerAdapter(options);
    // case "sui":      return createSuiLedgerAdapter(options);
    // case "bitcoin":  return createBitcoinLedgerAdapter(options);
    default: {
      // Exhaustiveness check — once all four platforms land, this
      // becomes a `const _: never = platform`. For now the EVM-only
      // implementation accepts only `"evm"`, and TS narrows
      // `LedgerOptions["platform"]` to `"evm" | undefined`, so this
      // branch is unreachable through the type.
      return Promise.reject(
        new Error(
          `[butr/ledger] no Ledger app builder for platform "${platform}". Today only "evm" ships; SVM / Sui / Bitcoin builders are tracked follow-ups.`,
        ),
      );
    }
  }
};

export type {
  EthAppConstructor,
  EthAppLike,
  EvmLedgerOptions,
  LedgerOptions,
  TransportFactory,
  TransportLike,
};
export { LEDGER_DEFAULT_ICON, createEvmLedgerAdapter, createLedgerAdapter };
