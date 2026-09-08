# Security policy

## Report a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/pedroapfilho/usebutr/security/advisories/new).
If it is unavailable, email [pedro@filho.me](mailto:pedro@filho.me).
Please avoid public issues for undisclosed vulnerabilities.

Include the affected package and version, a minimal reproduction, the expected
impact, and any proposed fix. Do not include private keys, seed phrases, or
live credentials. We aim to acknowledge reports within 72 hours and coordinate
disclosure after a fix or mitigation is available.

## Supported versions

Security fixes target the latest minor release line of each public `@usebutr/*`
package. Packages have independent versions; use the latest patch within that
line. Older release lines do not receive guaranteed backports.

## Scope

butr handles wallet discovery, adapters, connection state, and persistence. It
does not hold private keys or seed phrases. Reports involving these boundaries,
including unsafe handling of wallet-provided data, are in scope.

Vulnerabilities in upstream wallet extensions, WalletConnect, or Ledger software
belong with their respective maintainers. If butr's integration contributes to
the issue, report that part here as well.
