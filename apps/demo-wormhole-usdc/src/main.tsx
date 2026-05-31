import "./index.css";

// `@solana/web3.js` v1 (a transitive of `@wormhole-foundation/sdk-solana`)
// uses Node's `Buffer` API. Browsers don't expose it, and Vite/rolldown
// doesn't auto-polyfill — so we attach the `buffer` shim to
// `globalThis` before any Solana code runs. Done at module load (this
// file is the entry) so the polyfill is in place by the time
// `wallet-provider` / `app` import any Solana modules.
// oxlint-disable-next-line unicorn/prefer-node-protocol -- intentionally the npm browser polyfill, not the Node built-in
import { Buffer } from "buffer";

const globalScope = globalThis as unknown as { Buffer?: typeof Buffer };
if (globalScope.Buffer === undefined) {
  globalScope.Buffer = Buffer;
}

// Register the Circle (CCTP) protocol implementations BEFORE anything
// imports `@wormhole-foundation/sdk-solana` (e.g. via `SolanaPlatform`).
// The cctp package and `@solana/web3.js`'s optimizer chunk form a
// circular import; whichever side enters the cycle first executes its
// body LAST. Entering via the cctp module makes the web3.js chunk's
// body run first, so `init_index_browser_esm` is assigned before the
// CCTP code touches it. Entering via `sdk-solana` (the alphabetical
// ordering trap) reverses that and crashes at boot.
import "@wormhole-foundation/sdk-evm-cctp";
import "@wormhole-foundation/sdk-solana-cctp";

import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app";
import { WalletProvider } from "./wallet-provider";

const root = document.querySelector("#root");
if (!root) {
  throw new Error("#root not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
);
