---
"@usebutr/ledger": minor
---

Collapse `LEDGER_BITCOIN_DEFAULT_ICON`, `LEDGER_SUI_DEFAULT_ICON` and
`LEDGER_SVM_DEFAULT_ICON` into `LEDGER_DEFAULT_ICON`. All four resolved to the
same generic device glyph; import `LEDGER_DEFAULT_ICON` regardless of app.
