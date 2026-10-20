---
title: 'Standy intent-to-add workflow blocks partial commits in lint-staged'
severity: 'minor'
---

## Expected Behavior

The documented Standy workflow should work with the normal pre-commit hook when committing one coherent subset of a larger change.

## Current Behavior

AGENTS.md asks agents to run `git add -N` for new files before `standy check --changed --fix-hints`. When some of those files remain outside the next commit, lint-staged 17.5.1 refuses to run with files staged with `--intent-to-add`, so the pre-commit hook fails before checking the selected files.

## Possible Solution

Document clearing intent-to-add entries after Standy verification and before partial commits, or make the pre-commit workflow handle those entries while preserving the caller's selected commit scope. Do not bypass the checks.

## Minimal Reproducible Example

1. Create two new tracked-source or changeset files.
2. Run `git add -N` for both, as instructed for Standy.
3. Fully stage only one file and run `git commit`.
4. lint-staged refuses the remaining intent-to-add entry. Run `git reset -- <remaining-file>` and repeat the commit; the hook passes.

## Context

Encountered while splitting five wallet-library fixes into coherent commits after successful Standy verification. Clearing only the remaining intent-to-add entries preserved the source edits and allowed the unmodified hooks to run successfully.
