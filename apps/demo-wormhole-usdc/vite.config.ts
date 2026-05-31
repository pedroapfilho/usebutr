import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// `@solana/web3.js` v1 (a transitive of `@wormhole-foundation/sdk-solana`)
// uses Node's `Buffer` API. Browsers don't expose it, and Vite/rolldown
// doesn't auto-polyfill, so `main.tsx` attaches the `buffer` shim to
// `globalThis` before any Solana code runs. `global: "globalThis"`
// covers the matching `process`-style references in some sub-deps.
export default defineConfig({
  define: {
    global: "globalThis",
  },
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [".localhost"],
    host: true,
    port: 5184,
  },
});
