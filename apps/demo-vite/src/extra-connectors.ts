import type { WalletSource } from "@usebutr/core";
import { fromAdapters } from "@usebutr/core";
import { createLedgerAdapter } from "@usebutr/ledger";
import { createWalletConnectAdapters } from "@usebutr/walletconnect";

import { setPairingUri } from "./pairing-store";

const LEDGER_PLATFORMS = ["evm", "svm", "sui", "bitcoin"] as const;

const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID;

/**
 * One source per factory: `fromAdapters` logs a rejected promise and
 * contributes nothing, so a Ledger app that fails to load, or a WalletConnect
 * relay that is down, never hides the other connectors.
 */
const extraSources: ReadonlyArray<WalletSource> = [
  ...LEDGER_PLATFORMS.map((platform) =>
    fromAdapters(createLedgerAdapter({ id: `ledger-${platform}`, platform })),
  ),
  ...(WC_PROJECT_ID === undefined || WC_PROJECT_ID === ""
    ? []
    : [
        fromAdapters(
          createWalletConnectAdapters({
            // oxlint-disable-next-line react-doctor/no-unguarded-browser-global-at-module-scope -- a Vite SPA: this module never runs on a server
            metadata: { name: "butr · Vite demo", url: window.location.origin },
            namespaces: { bitcoin: [], evm: [], sui: [], svm: [] },
            onPairingUri: setPairingUri,
            projectId: WC_PROJECT_ID,
          }),
        ),
      ]),
];

export { extraSources };
