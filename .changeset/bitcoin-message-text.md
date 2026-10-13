---
"@usebutr/bitcoin": minor
"@usebutr/walletconnect": patch
---

Add `@usebutr/bitcoin/message`. `bitcoinMessageText(message, wallet)` turns message bytes into the text Unisat, OKX, `window.btc`, Xverse and WalletConnect sign, decoding strictly and keeping a byte-order mark. Bytes that are not valid UTF-8 now reject before the wallet is asked. Unisat and Xverse used to sign a lossy decoding, and WalletConnect signed the message's base64, while all three reported the original bytes as `signedMessage`. Wallet Standard and Ledger still sign any bytes as they are.
