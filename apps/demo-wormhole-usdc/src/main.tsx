import "./index.css";

// `@solana/web3.js` v1 (a transitive of `@wormhole-foundation/sdk-solana`) uses
// Node's `Buffer`, which browsers don't expose and Vite/rolldown won't
// auto-polyfill. Shimmed here at entry-module load so it exists before any
// Solana module is imported.
// oxlint-disable-next-line unicorn/prefer-node-protocol -- intentionally the npm browser polyfill, not the Node built-in
import { Buffer } from "buffer";

// oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- attaching the browser Buffer polyfill onto the untyped global scope
const globalScope = globalThis as unknown as { Buffer?: typeof Buffer };
globalScope.Buffer ??= Buffer;

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
