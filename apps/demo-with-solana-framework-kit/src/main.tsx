import "./index.css";

import { createClient } from "@solana/client";
import { SolanaProvider } from "@solana/react-hooks";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app";
import { WalletProvider } from "./wallet-provider";

const root = document.querySelector("#root");
if (!root) {
  throw new Error("#root not found");
}

// framework-kit's client is the reactive RPC/data layer. butr owns wallet
const client = createClient({ cluster: "devnet", commitment: "confirmed" });

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <WalletProvider>
      <SolanaProvider client={client}>
        <App />
      </SolanaProvider>
    </WalletProvider>
  </React.StrictMode>,
);
