import React, { type PropsWithChildren, type ReactElement } from "react";
import { render, renderHook, type RenderHookOptions } from "@testing-library/react";
import type { WalletAdapter, WalletManagerConfig, WalletPersistence } from "@butr/core";
import { createFakePersistence } from "@butr/testing";
import { WalletManagerProvider } from "../context";

/** Helper config builder: empty adapters by default, overridable via opts. */
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

/** Render a component tree inside a fresh WalletManagerProvider. */
const renderWithProvider = (ui: ReactElement, opts: ConfigOpts = {}) => {
  const config = buildConfig(opts);
  const wrapper = ({ children }: PropsWithChildren) => (
    <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
  );
  return { config, ...render(ui, { wrapper }) };
};

/** renderHook variant that auto-wraps with a WalletManagerProvider. */
const renderHookWithProvider = <T,>(
  hook: () => T,
  opts: ConfigOpts & Omit<RenderHookOptions<unknown>, "wrapper"> = {},
) => {
  const { adapters, config: configOverrides, storage, ...rest } = opts;
  const config = buildConfig({ adapters, config: configOverrides, storage });
  const wrapper = ({ children }: PropsWithChildren) => (
    <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
  );
  return { config, ...renderHook(hook, { wrapper, ...rest }) };
};

export type { ConfigOpts };
export { buildConfig, renderHookWithProvider, renderWithProvider };
