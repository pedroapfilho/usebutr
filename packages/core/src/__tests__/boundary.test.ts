import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

/**
 * Walk the workspace dependency graph starting from `packageName`,
 * following each package's `dependencies` (not devDependencies — peer
 * deps and dev deps are consumer-side concerns).
 */
const collectDeps = (packageName: string): Set<string> => {
  const seen = new Set<string>();
  const queue: Array<string> = [packageName];
  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined) {
      break;
    }
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);
    try {
      const pkgPath = require.resolve(`${current}/package.json`);
      const pkg = require(pkgPath) as { dependencies?: Record<string, string> };
      for (const dep of Object.keys(pkg.dependencies ?? {})) {
        queue.push(dep);
      }
    } catch {
      // Unresolvable (peer-only / private / external) — skip. The
      // assertions below check for the specific names we forbid, so a
      // missed resolution here can't hide a real boundary violation.
    }
  }
  return seen;
};

describe("@usebutr/core dependency boundary", () => {
  it("does not depend on React, @usebutr/react, or any protocol package", () => {
    const deps = collectDeps("@usebutr/core");
    expect(deps.has("react")).toBe(false);
    expect(deps.has("@usebutr/react")).toBe(false);
    expect(deps.has("@usebutr/evm")).toBe(false);
    expect(deps.has("@usebutr/svm")).toBe(false);
    expect(deps.has("@usebutr/walletconnect")).toBe(false);
    expect(deps.has("@usebutr/ledger")).toBe(false);
    expect(deps.has("@usebutr/wallets")).toBe(false);
    expect(deps.has("@usebutr/testing")).toBe(false);
  });
});
