import path from "node:path";

import { getDefaultConfig } from "expo/metro-config.js";

const configDirectory = import.meta.dirname;
const config = getDefaultConfig(configDirectory);

config.watchFolders = [path.resolve(configDirectory, "../..")];
config.resolver.nodeModulesPaths = [
  path.resolve(configDirectory, "node_modules"),
  path.resolve(configDirectory, "../..", "node_modules"),
];
config.resolver.unstable_enablePackageExports = true;

export default config;
