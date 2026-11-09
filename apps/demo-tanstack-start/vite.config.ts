import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import zodCompiler from "zod-compiler/vite";

const config = defineConfig({
  plugins: [zodCompiler(), devtools(), nitro(), tailwindcss(), tanstackStart(), viteReact()],
  server: { allowedHosts: [".localhost"] },
});

export default config;
