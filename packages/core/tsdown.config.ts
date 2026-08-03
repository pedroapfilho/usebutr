import { defineConfig } from "tsdown";

export default defineConfig({
  clean: false,
  dts: true,
  entry: ["src/index.ts"],
  format: "esm",
  minify: false,
  // Neutral despite the storage drivers reaching for `document` and
  // `localStorage`: every one of those reads is behind a `typeof` guard, so the
  // bundle runs unchanged under Node, React Native and the browser. Only
  // tsconfig.json needs the DOM lib, to type the guarded globals.
  platform: "neutral",
  sourcemap: true,
  target: "es2022",
  treeshake: true,
});
