---
"@usebutr/core": patch
---

A silent reconnect that times out or exposes no accounts now closes the wallet's session, as `connect` already did. Before, the session stayed open on an adapter that discovery hands back on the next `connect`. A silent reconnect the wallet declines is left alone, so its permission survives for the next load.

`requestAccounts` rejects with a `NotConnected` `ConnectionError` when the wallet exposes no accounts afterwards, the same answer `connect` gives. It used to resolve and leave the account list unchanged.
