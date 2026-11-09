---
"@usebutr/react": major
---

`useSigner` and `useBalance` report failures as a `ConnectionError`, the same type `useConnect` does, so `error.kind` works everywhere and `error.cause` keeps the wallet's original error. `UseBalanceOptions` is gone; `useBalance` takes core's `BalanceOptions`. `use-sync-external-store` is now a declared peer dependency: zustand's equality-checked selectors import it, and an app that did not install it failed at import.
