import type { ConnectedWallet } from "@usebutr/core";
import {
  useActiveWallet,
  useBalance,
  useDisconnectWallet,
  useRequestAccounts,
  useSetActiveConnector,
} from "@usebutr/react";

import { AccountPicker } from "./account-list";
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
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {wallet.connector.icon ? (
            <img alt="" className="size-8 rounded" src={wallet.connector.icon} />
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{wallet.connector.name}</h3>
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

const ConnectedList = ({ wallets }: { wallets: ReadonlyArray<ConnectedWallet> }) => (
  <section>
    <h2 className="mb-3 flex items-center gap-2 font-semibold">
      Connected
      <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-500">
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
