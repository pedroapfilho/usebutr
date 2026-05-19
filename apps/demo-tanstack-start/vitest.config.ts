import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Separate vitest config that omits the nitro plugin: nitro's Vite environment
// is incompatible with the vitest runner and causes a startup crash when the
// full vite.config.ts is used. This app has no tests so --passWithNoTests exits 0.
export default defineConfig({
  plugins: [viteReact()],
  test: {
    passWithNoTests: true,
  },
});
