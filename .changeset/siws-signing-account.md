---
"@usebutr/core": patch
---

`createSignInFlow` passes the signing account's address to Sign In With Solana. The SIWS path fetched the nonce for that account but asked the wallet with the nonce alone, so the wallet could sign in as another account.
