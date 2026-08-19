import "./index.css";

// `@solana/web3.js` v1 (a transitive of `@wormhole-foundation/sdk-solana`) uses
// Node's `Buffer`, which browsers don't expose and Vite/rolldown won't
// auto-polyfill. Shimmed here at entry-module load so it exists before any
// Solana module is imported.
// oxlint-disable-next-line unicorn/prefer-node-protocol -- intentionally the npm browser polyfill, not the Node built-in
import { Buffer } from "buffer";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

if (!("Buffer" in globalThis)) {
  Object.defineProperty(globalThis, "Buffer", {
    configurable: true,
    value: Buffer,
    writable: true,
  });
}

import "@wormhole-foundation/sdk-evm-cctp";
import "@wormhole-foundation/sdk-solana-cctp";

import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app";
import { WalletProvider } from "./wallet-provider";

const queryClient = new QueryClient();

const root = document.querySelector("#root");
if (!root) {
  throw new Error("#root not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <App />
      </WalletProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
