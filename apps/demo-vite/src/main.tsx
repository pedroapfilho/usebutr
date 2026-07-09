import "./index.css";

// oxlint-disable-next-line unicorn/prefer-node-protocol -- this is the npm `buffer` browser polyfill, not the Node builtin
import { Buffer } from "buffer";

import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app";
import { WalletProvider } from "./wallet-provider";

// doesn't polyfill. Assign it before the Ledger libs load (they're
if (!("Buffer" in globalThis)) {
  Object.assign(globalThis, { Buffer });
}

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
