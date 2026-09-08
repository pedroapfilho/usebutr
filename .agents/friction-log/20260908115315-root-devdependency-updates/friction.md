---
title: "Root devDependency updates rewrite unrelated Expo Babel peers"
severity: "minor"
---

## Problem

Updating only oxlint-config-awesomeness from 4.4.0 to 4.5.0 with pnpm 11.13.1 re-resolves the Expo workspace peer graph, changing Babel 8 bindings to Babel 7 and adding roughly 1000 lockfile lines unrelated to the lint dependency.

## Reproduction

On main with the existing lockfile, run pnpm add -Dw oxlint-config-awesomeness@^4.5.0 and inspect pnpm-lock.yaml.

## Workaround

Keep the generated lint-package update, remove unrelated peer-graph hunks, and verify pnpm install --frozen-lockfile. A targeted dependency bump should not also migrate the Expo runtime graph.
