---
"@usebutr/core": patch
---

Invalidate pending connections when their wallet disconnects or the manager resets. Late results cannot reactivate or persist forgotten wallets, overwrite fresh connection status, or close a newer pending session. Silent restoration follows the same connection lifetime rule, and sessions opening after a timeout are cleaned up.
