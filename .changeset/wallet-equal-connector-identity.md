---
"@usebutr/core": minor
---

Compare the adapter instance in `walletEqual` instead of `connector.id`, so selectors re-render when hydration swaps a shadow adapter for the live one. Previously an SSR consumer stayed pinned to the placeholder whose methods throw `ShadowConnectorError`.

`isShadowAdapter` and `ShadowConnectorError` are now exported from the package root.
