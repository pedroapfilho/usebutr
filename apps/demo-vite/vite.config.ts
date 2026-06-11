import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Force the npm `buffer` polyfill — Vite otherwise externalizes the
    // bare specifier as the Node builtin. @ledgerhq/* needs it at runtime.
    alias: { buffer: "buffer/" },
  },
  server: {
    allowedHosts: [".localhost"],
    host: true,
  },
});
