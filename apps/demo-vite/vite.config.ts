import { applyPortlessUrls } from "@repo/portless-env";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import zodCompiler from "zod-compiler/vite";

applyPortlessUrls(["VITE_DOCS_URL", "VITE_WEB_URL"]);

export default defineConfig({
  plugins: [zodCompiler(), react(), tailwindcss()],
  resolve: {
    alias: { buffer: "buffer/" },
  },
  server: {
    allowedHosts: [".localhost"],
    host: true,
  },
});
