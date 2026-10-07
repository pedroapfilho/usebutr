---
"@usebutr/core": minor
"@usebutr/react": patch
---

`reconnectingIds` is derived from the pool: an id is in it exactly when its connector is a shadow adapter seeded from `initialState`. `isShadowAdapter(adapter)` is exported from `@usebutr/core` and answers the same question for one adapter. `useSigner` and `useBalance` check the connector of the wallet they are given, so they no longer subscribe to the store a second time.
