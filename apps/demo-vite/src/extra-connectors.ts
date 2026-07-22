import type { WalletAdapter } from "@usebutr/core";
import { createLedgerAdapter } from "@usebutr/ledger";
import { createWalletConnectAdapters } from "@usebutr/walletconnect";

import { setPairingUri } from "./pairing-store";

const LEDGER_PLATFORMS = ["evm", "svm", "sui", "bitcoin"] as const;

const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID;

const hasWalletConnectProjectId = Boolean(WC_PROJECT_ID);

type OnAdapter = (adapter: WalletAdapter) => void;

const createLedgerSafe = async (
  platform: (typeof LEDGER_PLATFORMS)[number],
): Promise<Array<WalletAdapter>> => {
  try {
    // Default id is "ledger" for every platform; unique ids keep all
    // four adapters in the pool at once.
    return [await createLedgerAdapter({ id: `ledger-${platform}`, platform })];
  } catch (error) {
    console.error(`[demo] failed to create Ledger ${platform} adapter:`, error);
    return [];
  }
};

const createWalletConnectSafe = async (): Promise<Array<WalletAdapter>> => {
  if (WC_PROJECT_ID === undefined || WC_PROJECT_ID === "") {
    return [];
  }
  try {
    return await createWalletConnectAdapters({
      metadata: { name: "butr · Vite demo", url: window.location.origin },
      // Empty arrays request each namespace builder's default chains.
      namespaces: { bitcoin: [], evm: [], sui: [], svm: [] },
      onPairingUri: setPairingUri,
      projectId: WC_PROJECT_ID,
    });
  } catch (error) {
    console.error("[demo] failed to create WalletConnect adapters:", error);
    return [];
  }
};

const emitWhenReady = async (
  source: Promise<Array<WalletAdapter>>,
  onAdapter: OnAdapter,
): Promise<void> => {
  for (const adapter of await source) {
    onAdapter(adapter);
  }
};

// Factories run once per page load; repeat provider subscriptions
// (React StrictMode's double effect in dev) reuse the same promises
// instead of re-initializing the WalletConnect relay.
let extraSources: Array<Promise<Array<WalletAdapter>>> | null = null;

/**
 * Create the explicit (non-injected) connectors, Ledger and
 * WalletConnect, and emit each through `onAdapter` as it becomes
 * ready. Fire-and-forget: failures are logged, the wallet simply
 * doesn't appear in the picker.
 */
const registerExtraAdapters = (onAdapter: OnAdapter): void => {
  extraSources ??= [
    ...LEDGER_PLATFORMS.map((platform) => createLedgerSafe(platform)),
    createWalletConnectSafe(),
  ];
  for (const source of extraSources) {
    void emitWhenReady(source, onAdapter);
  }
};

export { hasWalletConnectProjectId, registerExtraAdapters };
