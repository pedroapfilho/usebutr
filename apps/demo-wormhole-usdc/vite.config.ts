import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// uses Node's `Buffer` API. Browsers don't expose it, and Vite/rolldown
// doesn't auto-polyfill, so `main.tsx` attaches the `buffer` shim to
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
