import type { Account, ChainPlatform, ConnectedWallet, WalletAdapter } from "@usebutr/core";
import {
  useConnect,
  useConnectedWallets,
  useDiscoveredWallets,
  useSelectedWallet,
  useWalletManager,
} from "@usebutr/react";

const truncate = (a: string): string => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

const PLATFORMS: ReadonlyArray<{ label: string; platform: ChainPlatform }> = [
  { label: "EVM", platform: "evm" },
  { label: "SVM", platform: "svm" },
];

const WalletRow = ({
  active,
  onDisconnect,
  onRequestAccounts,
  onSelectAccount,
  onUse,
  wallet,
}: {
  active: boolean;
  onDisconnect: (id: string) => void;
  onRequestAccounts: (id: string) => void;
  onSelectAccount: (id: string, account: Account) => void;
  onUse: (id: string) => void;
  wallet: ConnectedWallet;
}) => {
  const { accounts, connector } = wallet;
  const showSwitcher = accounts.length > 1;
  const canAddAccounts = connector.requestAccounts !== undefined;
  return (
    <div className="border-border-default rounded-md border bg-white px-2.5 py-2 sm:py-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={active ? "text-success-indicator" : "text-foreground-pale"}
          >
            ●
          </span>
          {connector.icon !== undefined && connector.icon !== "" ? (
            <img alt="" className="size-4 rounded" src={connector.icon} />
          ) : null}
          <div className="min-w-0">
            <p className="text-foreground-primary text-sm font-medium">{connector.name}</p>
            {showSwitcher ? null : (
              <p className="text-foreground-muted truncate font-mono text-xs">
                {truncate(wallet.account.walletAddress)}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {active ? (
            <span className="bg-success-surface text-success-foreground rounded px-2 py-0.5 text-xs font-medium">
              active
            </span>
          ) : (
            <button
              className="border-border-strong hover:bg-surface-subtle rounded border bg-white px-2 py-0.5 text-xs"
              onClick={() => {
                onUse(connector.id);
              }}
              type="button"
            >
              Use
            </button>
          )}
          <button
            className="border-border-strong text-foreground-subtle hover:bg-surface-subtle rounded border bg-white px-2 py-0.5 text-xs"
            onClick={() => {
              onDisconnect(connector.id);
            }}
            type="button"
          >
            Disconnect
          </button>
        </div>
      </div>
      {showSwitcher || canAddAccounts ? (
        <div className="mt-1.5 flex items-center gap-1.5 pl-6">
          {showSwitcher ? (
            <select
              aria-label={`Active account for ${connector.name}`}
              className="border-border-strong text-foreground-secondary min-w-0 flex-1 rounded border bg-white px-1.5 py-0.5 font-mono text-base focus:outline-none sm:text-xs"
              onChange={(e) => {
                const next = accounts.find((a) => a.id === e.target.value);
                if (next) {
                  onSelectAccount(connector.id, next);
                }
              }}
              value={wallet.account.id}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {truncate(a.walletAddress)}
                </option>
              ))}
            </select>
          ) : null}
          {canAddAccounts ? (
            <button
              className="border-border-strong hover:bg-surface-subtle shrink-0 rounded border bg-white px-2 py-0.5 text-xs"
              onClick={() => {
                onRequestAccounts(connector.id);
              }}
              type="button"
            >
              Add accounts
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const WalletGroup = ({
  connect,
  connected,
  connectingId,
  disconnect,
  discovered,
  label,
  platform,
  requestAccounts,
  selectedId,
  setAccount,
  setSelection,
}: {
  connect: (id: string) => void;
  connected: ReadonlyArray<ConnectedWallet>;
  connectingId: string | null;
  disconnect: (id: string) => void;
  discovered: ReadonlyArray<WalletAdapter>;
  label: string;
  platform: ChainPlatform;
  requestAccounts: (id: string) => void;
  selectedId: string | undefined;
  setAccount: (id: string, account: Account) => void;
  setSelection: (platform: ChainPlatform, id: string) => void;
}) => {
  const connectable = discovered.filter((d) => !connected.some((w) => w.connector.id === d.id));
  return (
    <div className="border-border-default bg-surface-subtle rounded-lg border p-3">
      <p className="text-foreground-muted mb-2 text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="space-y-1.5">
        {connected.length === 0 ? (
          <p className="text-foreground-muted text-sm">No {label} wallets connected.</p>
        ) : (
          connected.map((w) => (
            <WalletRow
              active={w.connector.id === selectedId}
              key={w.connector.id}
              onDisconnect={disconnect}
              onRequestAccounts={requestAccounts}
              onSelectAccount={setAccount}
              onUse={(id) => {
                setSelection(platform, id);
              }}
              wallet={w}
            />
          ))
        )}
      </div>
      {connectable.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {connectable.map((d) => (
            <button
              aria-busy={connectingId === d.id}
              className="border-border-default hover:bg-surface-subtle flex min-h-11 items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-sm disabled:opacity-50 sm:min-h-0"
              disabled={connectingId === d.id}
              key={d.id}
              onClick={() => {
                connect(d.id);
              }}
              type="button"
            >
              {d.icon !== undefined && d.icon !== "" ? (
                <img alt="" className="size-4 rounded" src={d.icon} />
              ) : null}
              {d.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const WalletList = () => {
  const pool = useConnectedWallets();
  const discovered = useDiscoveredWallets();
  const { connect, connectingId, error } = useConnect();
  const { disconnect, requestAccounts, setAccount, setSelection } = useWalletManager();
  const selectedEvm = useSelectedWallet("evm");
  const selectedSvm = useSelectedWallet("svm");

  const selectedIdFor = (platform: ChainPlatform): string | undefined =>
    platform === "evm" ? selectedEvm?.connector.id : selectedSvm?.connector.id;

  return (
    <section className="space-y-3">
      <h2 className="text-foreground-muted text-xs font-medium tracking-wide uppercase">Wallets</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map(({ label, platform }) => (
          <WalletGroup
            connect={connect}
            connected={pool.filter((w) => w.connector.chainPlatform === platform)}
            connectingId={connectingId}
            disconnect={disconnect}
            discovered={discovered.filter((d) => d.chainPlatform === platform)}
            key={platform}
            label={label}
            platform={platform}
            requestAccounts={(id) => {
              void requestAccounts(id);
            }}
            selectedId={selectedIdFor(platform)}
            setAccount={setAccount}
            setSelection={setSelection}
          />
        ))}
      </div>
      {error === null ? null : (
        <p
          aria-live="assertive"
          className="border-danger-border bg-danger-surface text-danger-foreground rounded-md border p-3 text-sm"
          role="alert"
        >
          {error.kind}: {error.message}
        </p>
      )}
    </section>
  );
};

export { WalletList };
