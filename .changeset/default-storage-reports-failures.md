---
"@usebutr/core": patch
---

The default browser storage reports its failures instead of hiding them. A `localStorage` or `sessionStorage` write that throws, such as a quota error, now reaches `onStorageError`, and a key that could not be read is left untouched for the session. Custom storage drivers already behaved this way. `createBrowserStorageDriver()` no longer catches errors from `getItem`, `setItem` and `removeItem`.
