import "./index.css";

// uses Node's `Buffer` API. Browsers don't expose it, and Vite/rolldown
// doesn't auto-polyfill — so we attach the `buffer` shim to
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
