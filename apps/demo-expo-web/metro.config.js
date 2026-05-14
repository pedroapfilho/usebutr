const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Monorepo workspace resolution
config.watchFolders = [path.resolve(__dirname, "../..")];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../..", "node_modules"),
];

// butr ships ESM-only via package.json#exports — let Metro honour the
// `default` condition instead of falling back to legacy main/module.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
