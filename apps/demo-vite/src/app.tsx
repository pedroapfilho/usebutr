import type { Account, ChainPlatform, ConnectedWallet, WalletAdapter } from "@usebutr/core";
import {
  useActiveWallet,
  useBalance,
  useConnectWallet,
  useConnectedWallets,
  useConnectionError,
  useConnectionStatus,
  useConnectingConnectorId,
  useDiscoveredWallets,
  useDisconnectWallet,
  useRequestAccounts,
  useSetActiveConnector,
} from "@usebutr/react";
import { CHAINS_BY_PLATFORM } from "@usebutr/wallets";
import { type ReactNode, useState } from "react";

import { hasWalletConnectProjectId } from "./extra-connectors";
import { PairingDialog } from "./pairing-dialog";
import { SiteFooter, SiteHeader } from "./site-chrome";
import { WalletConnectDialog } from "./wallet-connect-dialog";

type SignState =
  | { kind: "idle" }
  | { kind: "signing" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

const SIGN_MESSAGE_TEXT = "Hello from the butr demo";

const AccountRow = ({ account, wallet }: { account: Account; wallet: ConnectedWallet }) => {
  const isCurrent = account.walletAddress === wallet.account.walletAddress;
  const canSign = wallet.connector.capabilities.signMessage;
  const [state, setState] = useState<SignState>({ kind: "idle" });

  const handleSign = async () => {
    setState({ kind: "signing" });
    try {
      const bytes = new TextEncoder().encode(SIGN_MESSAGE_TEXT);
      await wallet.connector.signMessage(bytes, account);
      setState({ kind: "ok" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  let signIndicator: ReactNode = null;
  if (state.kind === "ok") {
    signIndicator = <span className="text-xs text-emerald-700">✓ signed</span>;
  } else if (state.kind === "error") {
    signIndicator = (
      <span className="text-xs text-red-700" title={state.message}>
        ✗ failed
      </span>
    );
  }

  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-md border px-2 py-1 ${
        isCurrent
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-neutral-200 text-neutral-700"
      }`}
    >
      <span className="font-mono text-xs break-all">{account.walletAddress}</span>
      {canSign ? (
        <span className="flex shrink-0 items-center gap-2">
          {signIndicator}
          <button
            aria-label={state.kind === "signing" ? "Signing…" : "Sign"}
            className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs hover:bg-neutral-50 disabled:opacity-50"
            disabled={state.kind === "signing"}
            onClick={() => {
              void handleSign();
            }}
            type="button"
          >
            {state.kind === "signing" ? "…" : "Sign"}
          </button>
        </span>
      ) : null}
    </li>
  );
};

const AccountPicker = ({ wallet }: { wallet: ConnectedWallet }) => (
  <div className="space-y-1">
    <ul className="space-y-1">
      {wallet.accounts.map((account) => (
        <AccountRow account={account} key={account.id} wallet={wallet} />
      ))}
    </ul>
    <p className="text-xs text-neutral-500">
      Active account is set in your wallet. Use Sign to test per-account signing.
    </p>
  </div>
);

const ChainPicker = ({ wallet }: { wallet: ConnectedWallet }) => {
  const chains = CHAINS_BY_PLATFORM[wallet.connector.chainPlatform];
  const selectId = `chain-picker-${wallet.connector.id}`;
  const [error, setError] = useState<string | null>(null);

  // The full per-platform chain list can include networks a given wallet
  // doesn't advertise (e.g. Phantom exposes Sui mainnet/testnet but not
  const handleChange = async (chainId: string) => {
    const target = chains.find((c) => c.id === chainId);
    if (!target) {
      return;
    }
    setError(null);
    try {
      await wallet.connector.switchChain(target);
    } catch (switchError) {
      setError(switchError instanceof Error ? switchError.message : "Failed to switch chain");
    }
  };

  return (
    <div>
      <label className="sr-only" htmlFor={selectId}>
        Chain
      </label>
      <select
        className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs"
        id={selectId}
        onChange={(e) => {
          void handleChange(e.target.value);
        }}
        value={wallet.account.chain.id}
      >
        {chains.some((c) => c.id === wallet.account.chain.id) ? null : (
          <option value={wallet.account.chain.id}>{wallet.account.chain.name} (current)</option>
        )}
        {chains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

const ConnectedWalletCard = ({ wallet }: { wallet: ConnectedWallet }) => {
  const active = useActiveWallet();
  const setActive = useSetActiveConnector();
  const disconnect = useDisconnectWallet();
  const requestAccounts = useRequestAccounts();
  const balance = useBalance(wallet.connector.id);
  const isActive = active?.connector.id === wallet.connector.id;
  const { capabilities } = wallet.connector;

  let balanceText: string;
  if (balance.status === "success") {
    balanceText = `${balance.data.formatted} ${balance.data.symbol}`;
  } else if (balance.status === "loading") {
    balanceText = "…";
  } else if (balance.status === "error") {
    balanceText = "error";
  } else {
    balanceText = "—";
  }

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {wallet.connector.icon ? (
            <img alt="" className="size-8 rounded" src={wallet.connector.icon} />
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{wallet.connector.name}</h4>
              {isActive ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  active
                </span>
              ) : null}
            </div>
            <p className="text-xs text-neutral-500">{wallet.account.chain.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? null : (
            <button
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
              onClick={() => setActive(wallet.connector.id)}
              type="button"
            >
              Make active
            </button>
          )}
          <button
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            onClick={() => disconnect(wallet.connector.id)}
            type="button"
          >
            Disconnect
          </button>
        </div>
      </div>
      <dl className="grid grid-cols-[120px_1fr] gap-y-1.5 text-sm">
        <dt className="text-neutral-500">Address</dt>
        <dd>
          <AccountPicker wallet={wallet} />
        </dd>
        <dt className="text-neutral-500">Balance</dt>
        <dd className="font-mono text-xs">{balanceText}</dd>
        {capabilities.switchChain ? (
          <>
            <dt className="text-neutral-500">Chain</dt>
            <dd>
              <ChainPicker wallet={wallet} />
            </dd>
          </>
        ) : null}
      </dl>
      {capabilities.requestAccounts ? (
        <button
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
          onClick={() => {
            void requestAccounts(wallet.connector.id);
          }}
          type="button"
        >
          Request more accounts
        </button>
      ) : null}
    </div>
  );
};

const PLATFORM_LABELS: Record<ChainPlatform, string> = {
  bitcoin: "Bitcoin",
  evm: "EVM",
  polkadot: "Polkadot",
  sui: "Sui",
  svm: "SVM",
};

const PLATFORM_ORDER: ReadonlyArray<ChainPlatform> = ["evm", "svm", "sui", "bitcoin", "polkadot"];

type PlatformGroup = {
  platform: ChainPlatform;
  wallets: Array<ConnectedWallet>;
};

const groupByPlatform = (wallets: ReadonlyArray<ConnectedWallet>): Array<PlatformGroup> => {
  const byPlatform = new Map<ChainPlatform, Array<ConnectedWallet>>();
  for (const wallet of wallets) {
    const platform = wallet.connector.chainPlatform;
    const existing = byPlatform.get(platform);
    if (existing) {
      existing.push(wallet);
    } else {
      byPlatform.set(platform, [wallet]);
    }
  }
  return PLATFORM_ORDER.flatMap((platform) => {
    const group = byPlatform.get(platform);
    return group ? [{ platform, wallets: group }] : [];
  });
};

const ConnectedList = ({ wallets }: { wallets: ReadonlyArray<ConnectedWallet> }) => (
  <section>
    <h2 className="mb-4 flex items-center gap-2 font-semibold">
      Connected
      <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-500">
        {wallets.length}
      </span>
    </h2>
    <div className="space-y-6">
      {groupByPlatform(wallets).map((group) => (
        <div key={group.platform}>
          <h3 className="mb-2 font-mono text-xs tracking-wide text-neutral-500 uppercase">
            {PLATFORM_LABELS[group.platform]} · {group.wallets.length}
          </h3>
          <ul className="space-y-3">
            {group.wallets.map((wallet) => (
              <li key={wallet.connector.id}>
                <ConnectedWalletCard wallet={wallet} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

const StatusBar = ({ status }: { status: string }) => (
  <div className="flex items-center gap-2 text-sm text-neutral-600">
    <span className="font-medium">Status:</span>
    <output
      aria-live="polite"
      className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-xs"
    >
      {status}
    </output>
  </div>
);

type WalletBrand = {
  adapters: Array<WalletAdapter>;
  icon: string | undefined;
  name: string;
};

const groupByBrand = (wallets: ReadonlyArray<WalletAdapter>): Array<WalletBrand> => {
  const byName = new Map<string, WalletBrand>();
  for (const wallet of wallets) {
    const key = wallet.name.toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      existing.adapters.push(wallet);
      existing.icon ??= wallet.icon;
    } else {
      byName.set(key, { adapters: [wallet], icon: wallet.icon, name: wallet.name });
    }
  }
  return [...byName.values()];
};

const WalletBrandRow = ({
  brand,
  connect,
}: {
  brand: WalletBrand;
  connect: (id: string) => void;
}) => {
  const connectingId = useConnectingConnectorId();
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          {brand.icon ? (
            <img alt="" className="size-6 rounded" height={24} src={brand.icon} width={24} />
          ) : null}
          <span className="font-medium">{brand.name}</span>
        </span>
        <span className="flex gap-2">
          {brand.adapters.map((adapter) => {
            const isConnecting = connectingId === adapter.id;
            return (
              <button
                aria-busy={isConnecting}
                aria-label={`${brand.name} (${adapter.chainPlatform})`}
                className="hover:border-brand hover:bg-brand/10 hover:text-brand-foreground min-h-[44px] rounded-md border border-neutral-300 px-2 py-1 font-mono text-xs uppercase transition-colors disabled:opacity-50 motion-reduce:transition-none"
                disabled={isConnecting}
                key={adapter.id}
                onClick={() => connect(adapter.id)}
                type="button"
              >
                {adapter.chainPlatform}
              </button>
            );
          })}
        </span>
      </div>
    </div>
  );
};

const WalletPicker = ({
  available,
  hasConnected,
}: {
  available: ReadonlyArray<WalletAdapter>;
  hasConnected: boolean;
}) => {
  const connect = useConnectWallet();

  if (available.length === 0 && !hasConnected) {
    return (
      <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="font-semibold">No wallets detected</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Install a browser wallet to get started. Try{" "}
          <a
            className="text-blue-600 underline"
            href="https://metamask.io/download"
            rel="noopener noreferrer"
            target="_blank"
          >
            MetaMask
          </a>{" "}
          (EVM) or{" "}
          <a
            className="text-blue-600 underline"
            href="https://phantom.app/download"
            rel="noopener noreferrer"
            target="_blank"
          >
            Phantom
          </a>{" "}
          (Solana).
        </p>
      </section>
    );
  }
  if (available.length === 0) {
    return null;
  }

  const brands = groupByBrand(available);

  return (
    <section>
      <h2 className="mb-3 font-semibold">
        {hasConnected ? "Connect another" : "Available wallets"}
      </h2>
      <ul className="space-y-2">
        {brands.map((brand) => (
          <li key={brand.name}>
            <WalletBrandRow brand={brand} connect={connect} />
          </li>
        ))}
      </ul>
    </section>
  );
};

const Content = () => {
  const status = useConnectionStatus();
  const error = useConnectionError();
  const connected = useConnectedWallets();
  const discovered = useDiscoveredWallets();
  const [dialogOpen, setDialogOpen] = useState(false);

  const available = discovered.filter((d) => !connected.some((c) => c.connector.id === d.id));

  return (
    <div className="space-y-6">
      <StatusBar status={status} />
      {connected.length > 0 ? <ConnectedList wallets={connected} /> : null}
      <WalletPicker available={available} hasConnected={connected.length > 0} />
      {hasWalletConnectProjectId ? null : (
        <p className="text-xs text-neutral-400">
          Set <code>VITE_WC_PROJECT_ID</code> in <code>.env.local</code> to enable WalletConnect.
        </p>
      )}
      <PairingDialog />
      {/* Dialog-based connect UX; recommended pattern for modal wallet pickers */}
      {available.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">
            Dialog pattern (recommended for modal UX)
          </h2>
          <button
            className="bg-brand text-brand-foreground rounded-md px-4 py-2 text-sm font-medium ring-1 ring-black/5 transition-[filter] ring-inset hover:brightness-95"
            onClick={() => setDialogOpen(true)}
            type="button"
          >
            Connect via dialog
          </button>
          <WalletConnectDialog
            available={available}
            onClose={() => setDialogOpen(false)}
            open={dialogOpen}
          />
        </section>
      ) : null}
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

const App = () => (
  <>
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow"
      href="#main"
    >
      Skip to content
    </a>
    <SiteHeader />
    <main className="mx-auto max-w-2xl px-6 py-10 font-sans text-neutral-900" id="main">
      <header className="mb-10">
        <p className="text-brand-foreground font-mono text-xs tracking-wide uppercase">Live demo</p>
        <h1 className="mt-3 max-w-[24ch] text-4xl font-semibold tracking-tight text-balance">
          Connect a wallet on any chain.
        </h1>
        <p className="mt-4 max-w-[60ch] text-base text-pretty text-neutral-600">
          Batteries-included install via <code>@usebutr/wallets</code>. EVM, Solana, Sui, Bitcoin,
          and Polkadot discovered in one provider, plus WalletConnect and Ledger; persisted in
          localStorage.
        </p>
      </header>
      <Content />
    </main>
    <SiteFooter />
  </>
);

export { App };
