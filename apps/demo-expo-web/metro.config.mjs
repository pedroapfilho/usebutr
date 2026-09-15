import { getDefaultConfig } from "expo/metro-config.js";
import { withUniwindConfig } from "uniwind/metro";

export default withUniwindConfig(getDefaultConfig(import.meta.dirname), {
  cssEntryFile: "./global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});
