# demo-wormhole-usdc

Bridge USDC with Wormhole CCTP using EVM Sepolia and Solana devnet wallets in one butr provider.

From the repository root (Node 24+, pnpm 11.13.1, and trusted Portless):

```bash
pnpm install && pnpm build --filter="./packages/*" && pnpm dev --filter=demo-wormhole-usdc
```

Open `https://usebutr.demo-wormhole-usdc.localhost`. Worktrees add a branch prefix; use the printed URL.
See the [guide](https://github.com/pedroapfilho/usebutr#demos) and [contribution setup](../../CONTRIBUTING.md).
