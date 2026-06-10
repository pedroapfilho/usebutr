import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderResult,
} from "@testing-library/react";
import type { WalletAdapter, WalletManagerConfig, WalletPersistence } from "@usebutr/core";
import { createFakePersistence } from "@usebutr/testing";
import React, { type PropsWithChildren, type ReactElement } from "react";

import { WalletManagerProvider } from "../context";

type ConfigOpts = {
  adapters?: ReadonlyArray<WalletAdapter>;
  config?: Partial<WalletManagerConfig>;
  storage?: WalletPersistence;
};

const buildConfig = ({
  adapters = [],
  config = {},
  storage,
}: ConfigOpts = {}): WalletManagerConfig => {
  const byId = new Map<string, WalletAdapter>(adapters.map((a) => [a.id, a]));
  return {
    connectors: [],
    createConnector: (id) => byId.get(id) ?? null,
    storage: storage ?? createFakePersistence(),
    ...config,
  };
};

/** Translate an internal WalletManagerConfig into the provider's flat props. */
const configToProps = (config: WalletManagerConfig) => ({
  connectors: config.connectors,
  createConnector: config.createConnector,
  onConnect: config.onConnect,
  onConnectError: config.onConnectError,
  onDisconnect: config.onDisconnect,
  onHydrated: config.onHydrated,
  onReset: config.onReset,
  onSlowConnect: config.onSlowConnect,
  onStorageError: config.onStorageError,
  slowConnectThresholdMs: config.slowConnectThresholdMs,
  storage: config.storage,
  storageKeyPrefix: config.storageKeyPrefix,
});

// Explicit RenderResult annotations because the inferred type references
// private pnpm paths and fails declaration-emit portability checks (TS2883).
const renderWithProvider = (
  ui: ReactElement,
  opts: ConfigOpts = {},
): RenderResult & { config: WalletManagerConfig } => {
  const config = buildConfig(opts);
  const wrapper = ({ children }: PropsWithChildren) => (
    <WalletManagerProvider {...configToProps(config)}>{children}</WalletManagerProvider>
  );
  const view: RenderResult = render(ui, { wrapper });
  return { config, ...view };
};

const renderHookWithProvider = <T,>(
  hook: () => T,
  opts: ConfigOpts & Omit<RenderHookOptions<unknown>, "wrapper"> = {},
) => {
  const { adapters, config: configOverrides, storage, ...rest } = opts;
  const config = buildConfig({ adapters, config: configOverrides, storage });
  const wrapper = ({ children }: PropsWithChildren) => (
    <WalletManagerProvider {...configToProps(config)}>{children}</WalletManagerProvider>
  );
  return { config, ...renderHook(hook, { wrapper, ...rest }) };
};

export type { ConfigOpts };
export { buildConfig, configToProps, renderHookWithProvider, renderWithProvider };
