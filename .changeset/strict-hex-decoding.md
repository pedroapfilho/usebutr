---
"@usebutr/core": patch
---

Reject partially invalid, signed, and whitespace-containing hex before decoding provider signatures or transactions. Empty inputs, lowercase `0x` prefixes, and either hex letter case remain supported.
