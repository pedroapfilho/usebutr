import type { Account, ChainPlatform, ConnectedWallet, WalletAdapter } from "@usebutr/core";
import {
  useActiveWallet,
  useBalance,
  useConnectWallet,
  useConnectedWallets,
  useConnectedWalletsByPlatform,
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
    signIndicator = <span className="text-success-foreground text-xs">✓ signed</span>;
  } else if (state.kind === "error") {
    signIndicator = (
      <span className="text-danger-foreground text-xs" title={state.message}>
        ✗ failed
      </span>
    );
  }

  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-md border px-2 py-1 ${
        isCurrent
          ? "border-success-border bg-success-surface text-success-foreground-deep"
          : "border-border-default text-foreground-secondary"
      }`}
    >
      <span className="font-mono text-xs break-all">{account.walletAddress}</span>
      {canSign ? (
        <span className="flex shrink-0 items-center gap-2">
          {signIndicator}
          <button
            aria-label={state.kind === "signing" ? "Signing…" : "Sign"}
            className="border-border-strong hover:bg-surface-subtle bg-surface-base rounded border px-2 py-0.5 text-xs disabled:opacity-50"
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
    <p className="text-foreground-muted text-xs">
      Active account is set in your wallet. Use Sign to test per-account signing.
    </p>
  </div>
);

const ChainPicker = ({ wallet }: { wallet: ConnectedWallet }) => {
  const chains = CHAINS_BY_PLATFORM[wallet.connector.chainPlatform];
  const selectId = `chain-picker-${wallet.connector.id}`;
  const [error, setError] = useState<string | null>(null);

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
        className="border-border-strong bg-surface-base w-full rounded-md border px-2 py-1 text-base"
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
      {error !== null && error !== "" ? (
        <p className="text-danger-foreground mt-1 text-xs" role="alert">
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
    <div className="border-border-default bg-surface-base space-y-3 rounded-lg border p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {wallet.connector.icon !== undefined && wallet.connector.icon !== "" ? (
            <img alt="" className="size-8 rounded" src={wallet.connector.icon} />
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{wallet.connector.name}</h4>
              {isActive ? (
                <span className="bg-success-surface-hover text-success-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                  active
                </span>
              ) : null}
            </div>
            <p className="text-foreground-muted text-xs">{wallet.account.chain.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? null : (
            <button
              className="border-border-strong hover:bg-surface-subtle rounded-md border px-3 py-1.5 text-sm"
              onClick={() => {
                setActive(wallet.connector.id);
              }}
              type="button"
            >
              Make active
            </button>
          )}
          <button
            className="border-border-strong hover:bg-surface-subtle rounded-md border px-3 py-1.5 text-sm"
            onClick={() => {
              disconnect(wallet.connector.id);
            }}
            type="button"
          >
            Disconnect
          </button>
        </div>
      </div>
      <dl className="grid-cols-wallet-detail grid gap-y-1.5 text-sm">
        <dt className="text-foreground-muted">Address</dt>
        <dd>
          <AccountPicker wallet={wallet} />
        </dd>
        <dt className="text-foreground-muted">Balance</dt>
        <dd className="font-mono text-xs">{balanceText}</dd>
        {capabilities.switchChain ? (
          <>
            <dt className="text-foreground-muted">Chain</dt>
            <dd>
              <ChainPicker wallet={wallet} />
            </dd>
          </>
        ) : null}
      </dl>
      {capabilities.requestAccounts ? (
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border px-3 py-1.5 text-sm"
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

const PLATFORM_LABELS = {
  bitcoin: "Bitcoin",
  evm: "EVM",
  polkadot: "Polkadot",
  sui: "Sui",
  svm: "SVM",
} satisfies Record<ChainPlatform, string>;

const ConnectedList = ({ count }: { count: number }) => {
  const byPlatform = useConnectedWalletsByPlatform();
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        Connected
        <span className="bg-surface-muted text-foreground-muted rounded-full px-2 py-0.5 font-mono text-xs">
          {count}
        </span>
      </h2>
      <div className="space-y-6">
        {[...byPlatform].map(([platform, wallets]) => (
          <div key={platform}>
            <h3 className="text-foreground-muted mb-2 font-mono text-xs tracking-wide uppercase">
              {PLATFORM_LABELS[platform]} · {wallets.length}
            </h3>
            <ul className="space-y-3">
              {wallets.map((wallet) => (
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
};

const StatusBar = ({ status }: { status: string }) => (
  <div className="text-foreground-subtle flex items-center gap-2 text-sm">
    <span className="font-medium">Status:</span>
    <output
      aria-live="polite"
      className="bg-surface-muted rounded-full px-2 py-0.5 font-mono text-xs"
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
    <div className="border-border-default bg-surface-base rounded-lg border px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          {brand.icon !== undefined && brand.icon !== "" ? (
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
                className="hover:border-brand hover:bg-brand/10 hover:text-brand-accent border-border-strong min-h-11 rounded-md border px-2 py-1 font-mono text-xs uppercase transition-colors disabled:opacity-50 motion-reduce:transition-none"
                disabled={isConnecting}
                key={adapter.id}
                onClick={() => {
                  connect(adapter.id);
                }}
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
      <section className="border-border-default bg-surface-subtle rounded-lg border p-6">
        <h2 className="font-semibold">No wallets detected</h2>
        <p className="text-foreground-subtle mt-2 text-sm">
          Install a browser wallet to get started. Try{" "}
          <a
            className="text-info-accent underline"
            href="https://metamask.io/download"
            rel="noopener noreferrer"
            target="_blank"
          >
            MetaMask
          </a>{" "}
          (EVM) or{" "}
          <a
            className="text-info-accent underline"
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
            <WalletBrandRow
              brand={brand}
              connect={(id) => {
                void connect(id);
              }}
            />
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
      {connected.length > 0 ? <ConnectedList count={connected.length} /> : null}
      <WalletPicker available={available} hasConnected={connected.length > 0} />
      <PairingDialog />
      {/* Dialog-based connect UX; recommended pattern for modal wallet pickers */}
      {available.length > 0 ? (
        <section>
          <h2 className="text-foreground-muted mb-3 text-sm font-semibold">
            Dialog pattern (recommended for modal UX)
          </h2>
          <button
            className="bg-brand text-brand-foreground transition-filter rounded-md px-4 py-2 text-sm font-medium ring-1 ring-black/5 ring-inset hover:brightness-95"
            onClick={() => {
              setDialogOpen(true);
            }}
            type="button"
          >
            Connect via dialog
          </button>
          <WalletConnectDialog
            available={available}
            onClose={() => {
              setDialogOpen(false);
            }}
            open={dialogOpen}
          />
        </section>
      ) : null}
      {error === null ? null : (
        <p
          aria-live="assertive"
          className="border-danger-border bg-danger-surface text-danger-foreground rounded-md border p-3 text-sm"
          role="alert"
        >
          {error.kind}: {error.message}
        </p>
      )}
    </div>
  );
};

const App = () => (
  <div className="flex min-h-dvh flex-col">
    <a
      className="focus:bg-surface-base sr-only px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:shadow"
      href="#main"
    >
      Skip to content
    </a>
    <SiteHeader />
    <main
      className="text-foreground-primary mx-auto w-full max-w-2xl flex-1 px-6 py-10 font-sans"
      id="main"
    >
      <header className="mb-10">
        <p className="text-brand-accent font-mono text-xs tracking-wide uppercase">Live demo</p>
        <h1 className="max-w-measure-24 mt-3 text-4xl font-semibold tracking-tight text-balance">
          Connect a wallet on any chain.
        </h1>
        <p className="max-w-measure-60 text-foreground-subtle mt-4 text-base text-pretty">
          Batteries-included install via <code>@usebutr/wallets</code>. EVM, Solana, Sui, Bitcoin,
          and Polkadot discovered in one provider, plus WalletConnect and Ledger; persisted in
          localStorage.
        </p>
      </header>
      <Content />
    </main>
    <SiteFooter />
  </div>
);

export { App };
