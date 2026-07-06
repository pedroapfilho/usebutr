---
"@usebutr/react": patch
---

`useGetWallet` and `useGetSelectedWallet` now return referentially stable accessors (memoized on the store instance), as their docs already promised. Consumers using the returned function in effect dependencies no longer re-run the effect on every render.
