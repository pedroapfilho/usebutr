import type { BtcAppLike } from "./apps/bitcoin";
import type { EthAppLike } from "./apps/evm";
import type { SuiAppLike } from "./apps/sui";
import type { SolanaAppLike } from "./apps/svm";

/** Each Ledger adapter hands back its device app, bound to the open
 *  transport. The derivation path is `derivationPathPrefix` plus the
 *  account's index in `getAccounts()`. */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface WalletSignerRegistry {
    "ledger-bitcoin": { app: BtcAppLike };
    "ledger-evm": { app: EthAppLike };
    "ledger-sui": { app: SuiAppLike };
    "ledger-svm": { app: SolanaAppLike };
  }
}
