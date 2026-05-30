import type { Account, ChainPlatform, ConnectedWallet, WalletAdapter } from "@usebutr/core";
import {
  useConnectWallet,
  useConnectedWallets,
  useDisconnectWallet,
  useDiscoveredWallets,
  useRequestAccounts,
  useSelectedWallet,
  useSetSelection,
  useUpdateWalletAccount,
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
  const canAddAccounts = connector.capabilities.requestAccounts;
  return (
    <div className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className={active ? "text-emerald-500" : "text-neutral-300"}>
            ●
          </span>
          {connector.icon ? <img alt="" className="size-4 rounded" src={connector.icon} /> : null}
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900">{connector.name}</p>
            {showSwitcher ? null : (
              <p className="truncate font-mono text-xs text-neutral-500">
                {truncate(wallet.account.walletAddress)}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {active ? (
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              active
            </span>
          ) : (
            <button
              className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs hover:bg-neutral-50"
              onClick={() => onUse(connector.id)}
              type="button"
            >
              Use
            </button>
          )}
          <button
            className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-50"
            onClick={() => onDisconnect(connector.id)}
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
              className="min-w-0 flex-1 rounded border border-neutral-300 bg-white px-1.5 py-0.5 font-mono text-xs text-neutral-700 focus:outline-none"
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
              className="shrink-0 rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs hover:bg-neutral-50"
              onClick={() => onRequestAccounts(connector.id)}
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
  disconnect,
  discovered,
  label,
  platform,
  requestAccounts,
  selectedId,
  setSelection,
  updateWalletAccount,
}: {
  connect: (id: string) => void;
  connected: ReadonlyArray<ConnectedWallet>;
  disconnect: (id: string) => void;
  discovered: ReadonlyArray<WalletAdapter>;
  label: string;
  platform: ChainPlatform;
  requestAccounts: (id: string) => void;
  selectedId: string | undefined;
  setSelection: (platform: ChainPlatform, id: string) => void;
  updateWalletAccount: (id: string, account: Account) => void;
}) => {
  const connectable = discovered.filter((d) => !connected.some((w) => w.connector.id === d.id));
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <p className="mb-2 text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</p>
      <div className="space-y-1.5">
        {connected.length === 0 ? (
          <p className="text-sm text-neutral-500">No {label} wallets connected.</p>
        ) : (
          connected.map((w) => (
            <WalletRow
              active={w.connector.id === selectedId}
              key={w.connector.id}
              onDisconnect={disconnect}
              onRequestAccounts={requestAccounts}
              onSelectAccount={updateWalletAccount}
              onUse={(id) => setSelection(platform, id)}
              wallet={w}
            />
          ))
        )}
      </div>
      {connectable.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {connectable.map((d) => (
            <button
              className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-sm hover:bg-neutral-50"
              key={d.id}
              onClick={() => connect(d.id)}
              type="button"
            >
              {d.icon ? <img alt="" className="size-4 rounded" src={d.icon} /> : null}
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
  const connect = useConnectWallet();
  const disconnect = useDisconnectWallet();
  const setSelection = useSetSelection();
  const updateWalletAccount = useUpdateWalletAccount();
  const requestAccounts = useRequestAccounts();
  const selectedEvm = useSelectedWallet("evm");
  const selectedSvm = useSelectedWallet("svm");

  const selectedIdFor = (platform: ChainPlatform): string | undefined =>
    platform === "evm" ? selectedEvm?.connector.id : selectedSvm?.connector.id;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Wallets</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map(({ label, platform }) => (
          <WalletGroup
            connect={connect}
            connected={pool.filter((w) => w.connector.chainPlatform === platform)}
            disconnect={disconnect}
            discovered={discovered.filter((d) => d.chainPlatform === platform)}
            key={platform}
            label={label}
            platform={platform}
            requestAccounts={(id) => {
              void requestAccounts(id);
            }}
            selectedId={selectedIdFor(platform)}
            setSelection={setSelection}
            updateWalletAccount={updateWalletAccount}
          />
        ))}
      </div>
    </section>
  );
};

export { WalletList };
