import "./index.css";

// `@solana/web3.js` v1 (a transitive of `@wormhole-foundation/sdk-solana`)
// uses Node's `Buffer` API. Browsers don't expose it, and Vite/rolldown
// doesn't auto-polyfill, so we attach the `buffer` shim to
// `globalThis` before any Solana code runs. Done at module load (this
// file is the entry) so the polyfill is in place by the time
// `wallet-provider` / `app` import any Solana modules.
// oxlint-disable-next-line unicorn/prefer-node-protocol -- intentionally the npm browser polyfill, not the Node built-in
import { Buffer } from "buffer";

const globalScope = globalThis as unknown as { Buffer?: typeof Buffer };
if (globalScope.Buffer === undefined) {
  globalScope.Buffer = Buffer;
}

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
