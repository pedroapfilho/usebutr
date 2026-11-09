---
title: 'Pre-commit rejects a commit containing only Frog metadata'
severity: 'minor'
issue: 'pedroapfilho/usebutr#234'
---

## Expected Behavior

A commit containing only a Frog friction entry should pass the repository's normal pre-commit hook.

## Current Behavior

`.oxfmtrc.json` explicitly ignores `.agents/friction-log/**`, but lint-staged selects those Markdown files through its `*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,json,md}` rule. With only a friction entry staged, `oxfmt` reports `Expected at least one target file. All matched files may have been excluded by ignore rules.` and Husky rejects the commit.

## Possible Solution

Align lint-staged's selected paths with oxfmt's friction-log exclusion. Until then, include friction metadata alongside the source change where it was encountered, so the formatter also receives an eligible file.

## Minimal Reproducible Example

1. Run `npx frog log` to create a local entry.
2. Stage only `.agents/friction-log/<entry>/friction.md`.
3. Run `git commit` and observe oxfmt fail before completing the hook.

## Context

Encountered while recording the Standy intent-to-add papercut after five remediation commits. The metadata belongs with the audited source change; no hook or formatting rule was disabled.
