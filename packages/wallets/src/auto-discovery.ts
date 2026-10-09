import {
  buildBitcoinAdapter,
  discoverInjectedBitcoinAdapter,
  discoverLegacyBitcoinAdapter,
} from "@usebutr/bitcoin";
import type { ChainPlatform, WalletSource } from "@usebutr/core";
import { CHAIN_PLATFORMS, logWarn } from "@usebutr/core";
import { discoverEvmAdapters, discoverInjectedAdapter } from "@usebutr/evm";
import {
  buildPolkadotWalletStandardAdapter,
  discoverInjectedPolkadotAdapters,
} from "@usebutr/polkadot";
import { buildSuiAdapter } from "@usebutr/sui";
import { buildSvmAdapter } from "@usebutr/svm";
import type {
  WalletStandardAdapterBuilder,
  WalletStandardModuleLoader,
  WalletStandardRoute,
} from "@usebutr/wallet-standard-shared";
import { discoverWalletStandard } from "@usebutr/wallet-standard-shared";

import type { Lane } from "./discovery-bus";
import { createDiscoveryBus } from "./discovery-bus";

/** Wallet Standard channels share one registry subscription. */
type Channel = { lane: Lane } & (
  | { source: WalletSource }
  | { walletStandard: WalletStandardAdapterBuilder }
);

const CHANNELS: Readonly<Record<ChainPlatform, ReadonlyArray<Channel>>> = {
  bitcoin: [
    { lane: "primary", walletStandard: buildBitcoinAdapter },
    { lane: "fallback", source: discoverInjectedBitcoinAdapter },
    { lane: "anonymousFallback", source: discoverLegacyBitcoinAdapter },
  ],
  evm: [
    { lane: "primary", source: discoverEvmAdapters },
    { lane: "anonymousFallback", source: discoverInjectedAdapter },
  ],
  polkadot: [
    { lane: "primary", source: discoverInjectedPolkadotAdapters },
    { lane: "fallback", walletStandard: buildPolkadotWalletStandardAdapter },
  ],
  sui: [{ lane: "primary", walletStandard: buildSuiAdapter }],
  svm: [{ lane: "primary", walletStandard: buildSvmAdapter }],
};

type AutoDiscoveryOptions = {
  /** Skips `window.ethereum`, the injected Bitcoin wallets and Polkadot's
   *  Wallet Standard channel. Defaults to `true`. */
  fallbacks?: boolean;
  /** Replaces the dynamic import of `@wallet-standard/app` (tests). */
  loadModule?: WalletStandardModuleLoader;
};

/**
 * The one-call source for `WalletManagerConfig.sources`, listing each wallet
 * once. A single-platform app can pass that package's `discover*Adapters`
 * instead and keep the other platforms out of its bundle.
 */
const autoDiscovery =
  (
    platforms: ReadonlyArray<ChainPlatform> = CHAIN_PLATFORMS,
    { fallbacks = true, loadModule }: AutoDiscoveryOptions = {},
  ): WalletSource =>
  (onAdapter) => {
    if (platforms.length === 0) {
      logWarn(
        "[butr] autoDiscovery was given an empty platform list, so no wallets will be discovered. Omit it to discover every platform.",
      );
    }
    const bus = createDiscoveryBus(onAdapter);
    const routes: Array<WalletStandardRoute> = [];
    const unsubscribes: Array<() => void> = [bus.stop];
    for (const platform of CHAIN_PLATFORMS) {
      if (!platforms.includes(platform)) {
        continue;
      }
      for (const channel of CHANNELS[platform]) {
        if (!fallbacks && channel.lane !== "primary") {
          continue;
        }
        if ("source" in channel) {
          unsubscribes.push(channel.source(bus[channel.lane]));
        } else {
          routes.push({ build: channel.walletStandard, onAdapter: bus[channel.lane] });
        }
      }
    }
    if (routes.length === 0) {
      bus.ready();
    } else {
      unsubscribes.push(discoverWalletStandard(routes, { loadModule, onReady: bus.ready }));
    }

    return () => {
      for (const unsubscribe of unsubscribes.splice(0)) {
        try {
          unsubscribe();
        } catch (error) {
          logWarn("[butr] discovery unsubscribe threw:", error);
        }
      }
    };
  };

export type { AutoDiscoveryOptions };
export { autoDiscovery };
