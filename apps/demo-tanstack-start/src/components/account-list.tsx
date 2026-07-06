import type { Account, ConnectedWallet } from "@usebutr/core";
import { type ReactNode, useState } from "react";

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

export { AccountPicker };
