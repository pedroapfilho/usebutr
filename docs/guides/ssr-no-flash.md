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
   `readWalletSnapshot()` paired with `<WalletManagerProvider initialSnapshot={…}/>`
   and the `useWalletSnapshot()` hook.

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
  initialSnapshot?: WalletSnapshot;
};

export const WalletProvider = ({
  children,
  initialCookies,
  initialSnapshot,
}: WalletProviderProps) => {
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
      initialSnapshot={initialSnapshot}
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
  Re-renders with a new `initialSnapshot` are ignored — pass stable values.

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

  // Plain object form — serializes cleanly across the RSC boundary
  // and feeds the cookie storage driver.
  const initialCookies: Record<string, string> = {};
  for (const { name, value } of cookieStore.getAll()) {
    initialCookies[name] = value;
  }

  // Typed view of the persisted pool. The keyPrefix must match the
  // one passed to WalletStorage.
  const initialSnapshot = readWalletSnapshot(initialCookies, {
    keyPrefix: STORAGE_KEY_PREFIX,
  });

  return (
    <html lang="en">
      <body>
        <WalletProvider initialCookies={initialCookies} initialSnapshot={initialSnapshot}>
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

## Step 3 — Component: render from the snapshot before hydration

`useWalletSnapshot()` returns a `WalletSnapshot` that's safe to render on
the server. Pre-hydration it comes from `initialSnapshot`; post-hydration
it's projected from the live store. Same shape, both sides.

The key design rule: **the shell must mirror the post-hydration card's
layout precisely.** Same outer container, same grid, same address slot.
Anything else creates a visible reflow when the live card replaces the
shell — which is the flash we're trying to avoid, just re-introduced one
layer up. Render skeleton placeholders for the values that need the live
connector (icon, balance, sign button) so they get _replaced in place_
rather than _inserted into a new layout_.

```tsx
// src/app/page.tsx
"use client";

import { useIsHydrated, useWalletSnapshot } from "@usebutr/react";

const SnapshotShell = () => {
  const snapshot = useWalletSnapshot();
  const entries = Object.values(snapshot.pool).filter((entry) => entry !== undefined);

  if (entries.length === 0) {
    return <ConnectButton />;
  }

  return (
    <section aria-busy="true">
      <h2>Connected ({entries.length})</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry.connectorId}>
            {/* Same card chrome the post-hydration ConnectedWalletCard uses. */}
            <div className="card">
              <div className="card-header">
                {/* Icon placeholder — same box the live <Image> will fill. */}
                <span aria-hidden="true" className="icon-skeleton" />
                <div>
                  <h3>{entry.connectorId}</h3>
                  <p>{entry.account.chain.name}</p>
                </div>
              </div>
              <dl>
                <dt>Address</dt>
                <dd>{entry.account.walletAddress}</dd>
                <dt>Balance</dt>
                {/* Same dd slot the live balance will occupy. */}
                <dd>—</dd>
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

const Page = () => {
  const isHydrated = useIsHydrated();
  if (!isHydrated) {
    return <SnapshotShell />;
  }
  return <InteractiveContent />;
};
```

### Anti-pattern: transient text in the shell

A tempting first attempt is to add a "Restoring connection…" line to the
shell. **Don't.** That line ships in the SSR HTML, then disappears when
the live card replaces the shell — that disappearance is itself a flash.
Either:

- Use `aria-busy="true"` on the section. Screen readers announce the
  loading state; nothing visible needs to flash away.
- If you need a visible loading hint, put it inside the live card too
  (e.g., next to balance while `useBalance()` is `status: "loading"`),
  so it's a stable element that has its own lifecycle independent of
  hydration.

### What you can't avoid

The snapshot only carries `account`, `accounts`, `chainPlatform`, and
`connectorId` — fields that come from the persisted pool. Things that
_don't_ live in the cookie inevitably appear progressively:

| Value                                   | Source                 | Available pre-hydration?          |
| --------------------------------------- | ---------------------- | --------------------------------- |
| Address, accounts, chain ID/name        | `entry.account.chain`  | yes                               |
| Connector ID                            | `entry.connectorId`    | yes                               |
| Wallet display name                     | Discovery announcement | no — need a skeleton              |
| Wallet icon                             | Discovery announcement | no — need a skeleton              |
| Balance                                 | Connector call         | no — show `—` then live value     |
| Capabilities (signMessage, switchChain) | Connector              | no — render the controls disabled |

Design your shell around the "yes" rows. Reserve space for the "no" rows
with same-size skeleton placeholders. The card geometry stays stable;
only the inner pixels update.

## Which hook should I use?

Two rules of thumb:

1. **Do you need to call a connector method** (`signMessage`, `sendTx`,
   `switchChain`, `getBalance`)? Use the live-store hooks
   (`useActiveWallet`, `useConnectedWallets`, etc.) and gate on
   `useIsHydrated()`. Connector methods don't exist server-side.

2. **Are you rendering structural state** — addresses, account lists, chain
   names, "is connected" badges? Use `useWalletSnapshot()`. It works the
   same on the server and the client.

| Need                           | Hook                                             |
| ------------------------------ | ------------------------------------------------ |
| Display address / account list | `useWalletSnapshot()`                            |
| Render "connected" badge       | `useWalletSnapshot()`                            |
| Sign a message                 | `useActiveWallet()` (gated on `useIsHydrated()`) |
| Fetch balance                  | `useBalance()`                                   |
| Trigger connect/disconnect     | `useConnectWallet()` / `useDisconnectWallet()`   |

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

2. **Design the shell to tolerate the update.** The demo's
   `SnapshotShell` shows a "Restoring connection…" hint and uses
   `aria-busy="true"` so screen readers announce the transient state.

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
