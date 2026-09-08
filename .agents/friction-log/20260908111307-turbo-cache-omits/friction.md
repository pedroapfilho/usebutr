---
title: "Turbo cache omits the generated TanStack route tree"
severity: "minor"
---

## Expected Behavior

A restored build provides the generated route types consumed by lint.

## Current Behavior

The first CI run passes, but its warm rerun fails because apps/demo-tanstack-start/src/routeTree.gen.ts is generated outside the configured build outputs.

## Possible Solution

Add src/routeTree.gen.ts to build outputs. This PR includes the fix and will validate a cold build followed by a warm rerun.

## Minimal Reproducible Example

Lint run 34235889176: attempt 1 succeeds; attempt 2 reports Cannot find module ./routeTree.gen.

## Context

Found during CI cache rollout evaluation.
