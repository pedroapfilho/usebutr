---
"@usebutr/core": minor
---

Persisted pool entries now require the `accounts` field. Entries written by older versions without it are dropped on read with a warning.
