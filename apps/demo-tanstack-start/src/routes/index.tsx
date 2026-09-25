import { createFileRoute } from "@tanstack/react-router";
import { useConnect, useConnectedWallets, useConnectionStatus } from "@usebutr/react";

import { ConnectedList } from "../components/connected-list";
import { StatusBar } from "../components/status-bar";
import { WalletPicker } from "../components/wallet-picker";
import { useDiscoveredWallets } from "../wallet-provider";

const Content = () => {
  const status = useConnectionStatus();
  const { error } = useConnect();
  const connected = useConnectedWallets();
  const discovered = useDiscoveredWallets();

  const available = discovered.filter((d) => !connected.some((c) => c.connector.id === d.id));

  return (
    <div className="space-y-6">
      <StatusBar status={status} />
      {connected.length > 0 ? <ConnectedList wallets={connected} /> : null}
      <WalletPicker available={available} hasConnected={connected.length > 0} />
      {error ? (
        <p
          aria-live="assertive"
          className="border-danger-border bg-danger-surface text-danger-foreground rounded-md border p-3 text-sm"
          role="alert"
        >
          {error.kind}: {error.message}
        </p>
      ) : null}
    </div>
  );
};

const Home = () => (
  <>
    <a
      className="sr-only px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:shadow"
      href="#main"
    >
      Skip to content
    </a>
    <main className="text-foreground-primary mx-auto max-w-2xl px-6 py-10 font-sans" id="main">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">butr · TanStack Start</h1>
        <p className="text-foreground-muted mt-1 text-sm">
          EVM-only manual wiring under SSR with <code>@usebutr/react</code> +{" "}
          <code>@usebutr/evm</code>. Discovery via EIP-6963; no SVM in the bundle.
        </p>
      </header>
      <Content />
    </main>
  </>
);

export const Route = createFileRoute("/")({ component: Home });
