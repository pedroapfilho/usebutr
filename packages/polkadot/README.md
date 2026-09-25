# @usebutr/polkadot

injectedWeb3 + Wallet Standard adapter for butr (Polkadot/Substrate).

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/react @usebutr/core @usebutr/polkadot zustand
```

React 19 is a peer dependency of the provider. Discovery does not render a connect modal; add your picker as the provider child. This example uses injectedWeb3. Use `@usebutr/wallets` to also compose the Wallet Standard fallback.

## Usage

```tsx
import type { ReactNode } from "react";
import type { WalletManagerConfig } from "@usebutr/core";
import { discoverInjectedPolkadotAdapters } from "@usebutr/polkadot";
import { WalletManagerProvider } from "@usebutr/react";

const config: WalletManagerConfig = { sources: [discoverInjectedPolkadotAdapters] };

export const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);
```

## Signing

butr ships no Polkadot RPC, so a Polkadot adapter has no `sendTx`,
`getBalance` or `getTransactionReceipt`. Build and submit extrinsics with
polkadot-api through `getSigner()`:

```ts
import { connectInjectedExtension } from "polkadot-api/pjs-signer";

const signer = await wallet.connector.getSigner();
if (signer.kind === "polkadot-injected") {
  const extension = await connectInjectedExtension(signer.extensionName);
  const account = extension.getAccounts().find((a) => a.address === wallet.account.walletAddress);
  // tx.signSubmitAndWatch(account.polkadotSigner)
}
```

Wallet Standard wallets resolve `{ kind: "wallet-standard", wallet }` instead.
`signMessage` is defined when the wallet can sign bytes: on Wallet Standard
when it advertises `polkadot:signMessage`, on injectedWeb3 once `connect()`
has enabled an extension that exposes `signRaw`. Pass `{ account }` to sign
as another exposed account; an account the wallet does not expose rejects.

Chains come from `POLKADOT_CHAINS` in `@usebutr/core`. injectedWeb3
extensions have no network to switch, so those adapters have no
`switchChain`; an account the extension pins to a network through
`genesisHash` carries that chain.

## Documentation

- [Package reference](https://docs.usebutr.com/api/polkadot)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
