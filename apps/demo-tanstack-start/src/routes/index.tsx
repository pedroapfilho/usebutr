import { createFileRoute } from "@tanstack/react-router";
import { useConnectedWallets, useConnectionError, useConnectionStatus } from "@usebutr/react";

import { ConnectedList } from "../components/connected-list";
import { StatusBar } from "../components/status-bar";
import { WalletPicker } from "../components/wallet-picker";
import { useDiscoveredWallets } from "../wallet-provider";

const Content = () => {
  const status = useConnectionStatus();
  const error = useConnectionError();
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
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
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
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow"
      href="#main"
    >
      Skip to content
    </a>
    <main className="mx-auto max-w-2xl px-6 py-10 font-sans text-neutral-900" id="main">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">butr · TanStack Start</h1>
        <p className="mt-1 text-sm text-neutral-500">
          EVM-only manual wiring under SSR with <code>@usebutr/react</code> +{" "}
          <code>@usebutr/evm</code>. Discovery via EIP-6963; no SVM in the bundle.
        </p>
      </header>
      <Content />
    </main>
  </>
);

export const Route = createFileRoute("/")({ component: Home });
