# Contributing to butr

butr is a library monorepo. Public packages live under `packages/`, examples
under `apps/demo-*`, and the documentation under `apps/docs/content/docs`.

## Set up

Use Node.js 24 or later and pnpm 11.13.1. To install pnpm through Corepack:

```bash
npm install -g corepack
corepack enable
corepack prepare pnpm@11.13.1 --activate
npm install -g portless
portless trust
pnpm install
pnpm build --filter="./packages/*"
pnpm dev --filter=demo-vite
```

The root dev wrapper forwards filters to Turbo, builds workspace dependencies,
and resolves local links through Portless. Apps use stable URLs such as
`https://usebutr.demo-vite.localhost`, `https://usebutr.docs.localhost`, and
`https://usebutr.landing.localhost`. Worktrees add a branch prefix; use the URL
printed by Portless. Explicit URL environment overrides are preserved.

`pnpm --filter=demo-vite dev` invokes the app directly, bypassing the root
wrapper and Turbo dependency builds. Build the packages first when using that
form. Expo's native iOS/Android commands use Metro rather than the web URL.

## Checks

```bash
pnpm build
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm fallow:dead
```

Build first: type-aware lint needs package declarations and generated framework
files. Run `pnpm format` before committing, including MDX and workflow YAML;
lint-staged does not format those two extensions. Keep TypeScript object keys
and JSX props sorted as required by oxlint.

The Husky pre-commit hook builds packages and runs lint-staged. Expect roughly
30 seconds for a warm commit. Do not bypass checks to hide a failure.

Docs changes should also pass `pnpm --filter docs test:e2e`, the existing
navigation checks. This builds with Next's testing API; follow it with a normal
production build before serving or deploying the docs. Existing demo browser
checks have app-specific `test:browser` scripts; they are not part of unit-test CI.

## Pull requests and releases

Keep changes focused and explain the resulting behavior and checks. Commit
conventions include `feat(scope):`, `fix:`, `docs:`, `ci:`, and `chore:`.

For a public package change, run `pnpm changeset` and describe its consumer
impact. Documentation-only site changes do not need a changeset; npm README or
license changes do, so the new files reach the registry. Do not manually bump
package versions. Changesets opens the version PR on `main`; merging that PR
publishes the releases.

GitHub-linked changelogs need a token when versioning locally:

```bash
GITHUB_TOKEN=$(gh auth token) pnpm version-packages
```

CI supplies its token automatically. Local versioning changes manifests and
changelogs; ordinary feature PRs should contain changesets instead.

## Add a package

Use `@usebutr/*` for public packages and `@repo/*` for private workspace tools.
Public packages require an MIT `LICENSE`, a package `README.md`, documentation
and issue links, keywords, and `publishConfig.access: public`. Use tsdown and
the existing TypeScript and Vitest configurations. Add documentation, workspace
consumers where useful, and a changeset. Review `pnpm-workspace.yaml` build
permissions if a dependency needs native installation steps.

Report vulnerabilities through [SECURITY.md](./SECURITY.md). Participation is
covered by the [Code of Conduct](./CODE_OF_CONDUCT.md).
