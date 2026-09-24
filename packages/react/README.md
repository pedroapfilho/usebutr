# @usebutr/react

React provider and hooks for butr. Depends on @usebutr/core, react, zustand.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/react @usebutr/wallets zustand
```

React 19+ is a peer dependency. Run this inside an existing React app; the
picker UI belongs to your application.

## Usage

```tsx
import { WalletManagerProvider, useConnect, useDiscoveredWallets, useWallet } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";

// Read once at mount: define it at module scope.
const config = { sources: [autoDiscovery()] };

const WalletPicker = () => {
  const wallets = useDiscoveredWallets();
  const wallet = useWallet();
  const { connect, error, status } = useConnect();

  if (wallet) {
    return <p>{wallet.account.walletAddress}</p>;
  }
  return (
    <>
      {wallets.map(({ id, name }) => (
        <button
          disabled={status === "connecting"}
          key={id}
          onClick={() => connect(id)}
          type="button"
        >
          Connect {name}
        </button>
      ))}
      {error && <p role="alert">{error.message}</p>}
    </>
  );
};

export const App = () => (
  <WalletManagerProvider config={config}>
    <WalletPicker />
  </WalletManagerProvider>
);
```

`WalletManagerProvider` creates one manager per mount and starts it in an
effect, so nothing runs during a server render. To render persisted
connections from the first paint, pass `initialState={readWalletSnapshot(cookies)}`
from a Server Component, with a cookie-backed storage driver on the client.

## Hooks

- **Actions:** `useWalletManager()` returns the manager: `connect`,
  `disconnect`, `disconnectAll`, `requestAccounts`, `setAccount`, `setActive`,
  `setSelection` and `clearConnectionError` are stable references, and
  `getState()` reads without subscribing.
- **Connecting:** `useConnect()` returns `connect(id)`, which never rejects
  (the outcome lands in `status` and `error`), `connectAsync(id)`, which
  resolves the wallet or rejects with a `ConnectionError`, plus `reset`,
  `connectingId`, `status` and `error`.
- **State:** `useDiscoveredWallets`, `useConnectedWallets`, `useWallet(id?)`,
  `useSelectedWallet(platform)`, `useAccounts(id?)`, `useConnectionStatus`,
  `useIsHydrated`, `useIsReconnecting(id?)`, and `useWalletState(selector)` for
  anything else. Omitting the id reads the active wallet; `null` reads none.
- **Grouped:** `useDiscoveredWalletsByPlatform` and
  `useConnectedWalletsByPlatform`.
- **Async reads:** `useSigner(wallet)` and `useBalance(wallet, { account?, token? })`
  take the entry from `useWallet()` or `useSelectedWallet(platform)` and return
  `{ data, error, status }`, where `error` is always an `Error`. They stay
  `"idle"` without a wallet and while it is reconnecting, and `useBalance`
  stays idle for wallets without `getBalance`.

Capabilities are checked by presence: render a "sign" button only when
`wallet.connector.signMessage` exists.

## Documentation

- [Package reference](https://docs.usebutr.com/api/react)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
