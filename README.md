# butr-monorepo

The home of `butr`, a multi-chain wallet management library for React. The monorepo also hosts a set of demo apps that show `butr` running across different React frameworks.

## Stack

- **Library:** `butr` (React 19, zustand)
- **Demos:** Vite, Next.js (App Router), TanStack Start, Expo
- **Monorepo:** Turborepo + pnpm workspaces
- **Linting:** oxlint
- **Formatting:** oxfmt
- **Testing:** Vitest (unit), Playwright (e2e placeholder)

## Apps

### Framework demos

| App                   | Description                     | Dev URL                 |
| --------------------- | ------------------------------- | ----------------------- |
| `demo-vite`           | Vite + React 19 SPA             | `http://localhost:5173` |
| `demo-next`           | Next.js 16 App Router           | `http://localhost:3000` |
| `demo-tanstack-start` | TanStack Start (Vite SSR)       | `http://localhost:3001` |
| `demo-expo-web`       | Expo (React Native, web target) | `http://localhost:8081` |

Every framework demo is a single-page kitchen-sink reference that imports and uses every public `butr` export.

### Integration demos

Each integration demo shows butr composing with an existing web3 library — butr handles wallet discovery + connection state, the integration lib handles chain reads, signing, and submission. Connect → read balance → sign message → send tx in every demo.

| App                                | Library                            | Dev URL                 |
| ---------------------------------- | ---------------------------------- | ----------------------- |
| `demo-with-viem`                   | viem (EVM, Sepolia)                | `http://localhost:5175` |
| `demo-with-wagmi`                  | wagmi + @wagmi/core (EVM, Sepolia) | `http://localhost:5176` |
| `demo-with-solana-web3js`          | @solana/web3.js (SVM, Devnet)      | `http://localhost:5177` |
| `demo-with-solana-wallet-adapter`  | @solana/wallet-adapter-react       | `http://localhost:5178` |
| `demo-with-solana-kit`             | @solana/kit (the new modular SDK)  | `http://localhost:5179` |

## Packages

| Package                   | Description                    |
| ------------------------- | ------------------------------ |
| `butr`                    | The library itself             |
| `@repo/typescript-config` | Shared TypeScript config bases |
| `@repo/config-vitest`     | Shared Vitest configs          |

## Setup

### Prerequisites

- **Node.js 24** (`nvm install 24 && nvm use 24`)
- **pnpm 10** (`npm install -g pnpm@10`)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run a demo

```bash
pnpm dev --filter=demo-vite
# or any of: demo-next, demo-tanstack-start, demo-expo-web
```

Open the URL printed in the table above. The four demos use distinct ports so they can run concurrently.

## Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `pnpm dev`          | Start all apps in development |
| `pnpm build`        | Build all packages and apps   |
| `pnpm test`         | Run unit tests                |
| `pnpm test:e2e`     | Run Playwright e2e tests      |
| `pnpm lint`         | Run oxlint                    |
| `pnpm format`       | Format with oxfmt             |
| `pnpm format:check` | Check formatting              |
| `pnpm typecheck`    | Run TypeScript checks         |
| `pnpm clean`        | Clean all build artifacts     |
| `pnpm fallow:dead`  | Find unused exports           |
