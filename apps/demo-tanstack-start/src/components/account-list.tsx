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
            className="border-border-strong hover:bg-surface-subtle rounded border bg-white px-2 py-0.5 text-xs disabled:opacity-50"
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

const AccountList = ({ wallet }: { wallet: ConnectedWallet }) => (
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

export { AccountList };
