import { getDefaultConfig } from "expo/metro-config";
import { withUniwindConfig } from "uniwind/metro";

export default withUniwindConfig(getDefaultConfig(import.meta.dirname), {
  cssEntryFile: "./global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});
