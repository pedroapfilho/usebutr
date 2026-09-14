import type { ConnectedWallet } from "@usebutr/core";
import {
  useActiveWallet,
  useBalance,
  useDisconnectWallet,
  useRequestAccounts,
  useSetActiveConnector,
} from "@usebutr/react";

import { AccountList } from "./account-list";
import { ChainPicker } from "./chain-picker";

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
    <div className="border-border-default space-y-3 rounded-lg border bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {wallet.connector.icon !== undefined && wallet.connector.icon !== "" ? (
            <img alt="" className="size-8 rounded" src={wallet.connector.icon} />
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{wallet.connector.name}</h3>
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
          <AccountList wallet={wallet} />
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

const ConnectedList = ({ wallets }: { wallets: ReadonlyArray<ConnectedWallet> }) => (
  <section>
    <h2 className="mb-3 flex items-center gap-2 font-semibold">
      Connected
      <span className="bg-surface-muted text-foreground-muted rounded-full px-2 py-0.5 font-mono text-xs">
        {wallets.length}
      </span>
    </h2>
    <ul className="space-y-3">
      {wallets.map((wallet) => (
        <li key={wallet.connector.id}>
          <ConnectedWalletCard wallet={wallet} />
        </li>
      ))}
    </ul>
  </section>
);

export { ConnectedList };
