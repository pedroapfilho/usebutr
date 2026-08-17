# SSR without the hydration flash

When a user lands on a page with a wallet already connected, the default
butr setup produces a brief flash: the server renders the empty pre-
hydration UI, ships HTML to the browser, the client mounts, hydration runs,
and the UI flips to "connected." This guide walks through wiring up cookie
storage plus the snapshot channel so the first paint already shows the
connected shell — no flash.

The pattern works with any SSR React framework. Concrete code below uses
Next.js' App Router; the principles transfer directly to TanStack Start,
Remix, Astro, or anything else that can read request cookies before
rendering.

## Why this needs two pieces

1. The storage layer needs to be **server-readable** so the cookie payload
   the browser persisted is the cookie payload the server sees. That's
   `createCookieStorageDriver({ initialCookies })` from
   [ADR 0002 §1](../adr/0002-ssr-snapshot-channel.md).

2. The React tree needs a **server-safe view of the persisted state** that
   doesn't require a `Connector` instance (impossible on the server). That's
   `readWalletSnapshot()` paired with `<WalletManagerProvider initialState={…}/>`,
   which seeds the store synchronously so the primary selectors return values
   from render zero.

Wire one without the other and you get a partial fix. Wire both and the
first paint already shows the user's address.

## Step 1 — Storage driver: cookie-backed, server-readable

Replace the default `localStorage`-backed persistent driver with the cookie
driver, and have it accept a snapshot of cookies for the SSR pass.

```tsx
// src/wallet-provider.tsx
"use client";

import {
  WalletStorage,
  type WalletSnapshot,
  createBrowserStorageDriver,
  createCookieStorageDriver,
} from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { type ReactNode, useState } from "react";

export const STORAGE_KEY_PREFIX = "my-app";

type WalletProviderProps = {
  children: ReactNode;
  initialCookies?: Readonly<Record<string, string>>;
  initialState?: WalletSnapshot;
};

export const WalletProvider = ({ children, initialCookies, initialState }: WalletProviderProps) => {
  const [storage] = useState(
    () =>
      new WalletStorage({
        keyPrefix: STORAGE_KEY_PREFIX,
        persistent: createCookieStorageDriver({
          initialCookies,
          // Local dev runs on http://localhost — opt out of Secure so
          // the browser actually stores the cookie.
          secure: process.env.NODE_ENV === "production",
        }),
        session: createBrowserStorageDriver().session,
      }),
  );

  return (
    <WalletManagerProvider
      initialState={initialState}
      storage={storage}
      storageKeyPrefix={STORAGE_KEY_PREFIX}
    >
      {children}
    </WalletManagerProvider>
  );
};
```

Three notes:

- **Why a single `WalletStorage` instance.** The cookie driver is for the
  persistent slot (pool, selection, active connector — survives reloads).
  The session slot keeps using `sessionStorage` because cookies can't
  naturally model "until the tab closes."
- **Why `secure: false` in dev.** `Secure` cookies are only sent over HTTPS.
  Local development on `http://localhost` would otherwise silently fail to
  persist anything.
- **Why `useState` lazy init.** The provider captures props once at mount
  (same rule as `storage`, `discovery`, and the `on*` callbacks).
  Re-renders with a new `initialState` are ignored — pass stable values.

## Step 2 — Server Component: read cookies, build the snapshot

In the Server Component that wraps the wallet provider (typically your root
layout), read the request cookies once and feed both channels.

```tsx
// src/app/layout.tsx
import { readWalletSnapshot } from "@usebutr/core";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { STORAGE_KEY_PREFIX, WalletProvider } from "../wallet-provider";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = await cookies();

  // Plain object form, filtered to butr's own keys. This object is a prop on a
  // "use client" component, so whatever you put here is serialized into the RSC
  // payload and readable from JS. Forwarding the whole jar would publish your
  // httpOnly session cookies to the page.
  const initialCookies: Record<string, string> = {};
  for (const { name, value } of cookieStore.getAll()) {
    if (name.startsWith(`${STORAGE_KEY_PREFIX}-`)) {
      initialCookies[name] = value;
    }
  }

  // Typed view of the persisted pool. The keyPrefix must match the
  // one passed to WalletStorage.
  const initialState = readWalletSnapshot(initialCookies, {
    keyPrefix: STORAGE_KEY_PREFIX,
  });

  return (
    <html lang="en">
      <body>
        <WalletProvider initialCookies={initialCookies} initialState={initialState}>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
};

export default RootLayout;
```

`readWalletSnapshot` accepts three input shapes — pick whichever your
framework hands you:

```ts
// Plain object (Next.js + manual loop, Hono, generic Node)
readWalletSnapshot({ "my-app-pool": "{...}", "my-app-active": "metamask" });

// { name, value }[] (Next.js cookies().getAll() direct)
readWalletSnapshot(cookieStore.getAll(), { keyPrefix: "my-app" });

// [name, value][] (URLSearchParams-style iterables)
readWalletSnapshot(entries, { keyPrefix: "my-app" });
```

## Step 3 — Component: render normally

With `initialState` wired up there is no separate shell to write. The store is
already hydrated on the first render, the pool is populated, and the primary
selectors return values on both server and client:

```tsx
// src/app/page.tsx
"use client";

import { useConnectedWallets, useIsReconnecting } from "@usebutr/react";

const Page = () => {
  const wallets = useConnectedWallets();

  if (wallets.length === 0) {
    return <ConnectButton />;
  }

  return (
    <ul>
      {wallets.map((wallet) => (
        <WalletCard key={wallet.connector.id} wallet={wallet} />
      ))}
    </ul>
  );
};
```

The one thing that differs before the live adapter arrives is that the seeded
entry is backed by a placeholder connector, so it can carry data but cannot
sign. Gate the affordances that need a real connector:

```tsx
const WalletCard = ({ wallet }: { wallet: ConnectedWallet }) => {
  const reconnecting = useIsReconnecting(wallet.connector.id);
  const balance = useBalance(wallet.connector.id);

  return (
    <div className="card" aria-busy={reconnecting}>
      <h3>{wallet.connector.name}</h3>
      <p>{wallet.account.walletAddress}</p>
      <p>{balance.status === "success" ? balance.data.formatted : "—"}</p>
      <button disabled={reconnecting} type="button">
        Sign
      </button>
    </div>
  );
};
```

`useSigner()` and `useBalance()` apply the same gate internally: for a seeded
wallet they stay `idle` rather than reporting an error, and start loading once
the live adapter is announced. `useConnectionStatus()` returns `"reconnecting"`
over the same window.

### Anti-pattern: transient text

A tempting addition is a "Restoring connection…" line that renders only while
reconnecting. **Don't.** That line ships in the SSR HTML and then disappears,
and the disappearance is itself a flash. Use `aria-busy` so screen readers
announce the state without anything visible flashing away, or put the hint
inside an element that exists in both states and has its own lifecycle (next to
the balance while `useBalance()` is `loading`, for example).

### What you can't avoid

The snapshot only carries what the cookie holds: `account`, `accounts`,
`chainPlatform`, `connectorId`, `name`, and `icon`. Anything that needs a live
connector appears progressively:

| Value                                   | Source               | Available on first paint?        |
| --------------------------------------- | -------------------- | -------------------------------- |
| Address, accounts, chain ID/name        | `wallet.account`     | yes                              |
| Connector id, name, icon                | persisted pool entry | yes                              |
| Balance                                 | connector call       | no, show `—` then the live value |
| Capabilities (signMessage, switchChain) | connector            | no, render the controls disabled |

Design around the "yes" rows and reserve space for the rest, so the card
geometry stays stable and only the inner pixels update.

## The stale-cookie edge case

The snapshot reflects whatever the browser most recently persisted. If
between page loads the user uninstalled the wallet, disconnected in another
tab, or rotated accounts, the cookie will lag reality. Three implications:

1. **The pre-hydration shell may briefly show a state that doesn't survive
   reconciliation.** A user who uninstalled MetaMask between sessions will
   see "MetaMask · 0xabc…" for a frame, then the silent reconnect will
   fail, and the UI will flip to disconnected. This is _not_ the same as
   the original flash — it happens only when the cookie is genuinely
   wrong, not on every page load.

2. **Design the card to tolerate the update.** Gate sign affordances on
   `useIsReconnecting()` and use `aria-busy` so the transient state is
   announced without anything visible flashing away. If the reconnect fails,
   butr drops the entry from the pool rather than leaving a placeholder that
   can never sign.

3. **The cookie is not a security boundary.** It's `HttpOnly: false` by
   construction (the client needs to read and write it). Don't put
   anything in there you wouldn't put in `localStorage`.

## Cookie size

Each pool entry is a JSON blob containing the active account, the full
accounts list, and chain metadata. For a typical "one or two wallets
connected" session this lands well under the 4KB per-cookie ceiling.
Apps with users routinely connecting many wallets across many chains
(cross-platform power users) should monitor cookie size and consider:

- A server-side session store (cookie holds a short session id; the
  pool blob lives in Redis / Postgres).
- A custom storage driver that compresses the pool JSON before write.

## What this opts you out of

Using `cookies()` in a Server Component opts that route out of static
prerendering — Next.js marks it `ƒ (Dynamic)`. This is inherent to any
cookie-aware SSR, not a butr-specific cost. If your route was statically
prerendered before and you want to keep it that way, you can either:

- Move the cookie reads to a nested layout that doesn't include the
  static parts of the page.
- Use a route-level segment cache (`export const dynamic = "auto"`) and
  accept per-request rendering of the wallet-aware sections only.

## See also

- [ADR 0002 — SSR snapshot channel](../adr/0002-ssr-snapshot-channel.md)
  for the architectural reasoning.
- `apps/demo-next/` for the end-to-end worked example.
- `createCookieStorageDriver` in `@usebutr/core` for the full set of
  cookie driver options (`domain`, `path`, `sameSite`, `maxAgeSeconds`).
