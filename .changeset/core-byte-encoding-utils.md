---
"@usebutr/core": minor
---

Add shared byte-encoding utilities (`bytesToHex`, `bytesToHexPrefixed`,
`hexToBytes`, `base64ToBytes`, `bytesToBase64`) and consolidate the per-connector
copies onto them. Behavior preserved: prefixed (`0x`) and bare hex are distinct
variants so each chain keeps its existing output.
