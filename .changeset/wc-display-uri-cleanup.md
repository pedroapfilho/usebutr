---
"@usebutr/walletconnect": patch
---

Remove the leaked `display_uri` listener on disconnect to prevent listener
accumulation and duplicate `onPairingUri` callbacks across reconnects.
