import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

type Manifest = {
  dependencies?: Record<string, string>;
  name: string;
};

const readManifest = (path: string): Manifest => JSON.parse(readFileSync(path, "utf8")) as Manifest;

const workspaceManifests = (root: string): Map<string, string> => {
  const manifests = new Map<string, string>();

  for (const group of ["packages", "apps"]) {
    for (const entry of readdirSync(join(root, group), { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const path = join(root, group, entry.name, "package.json");
        manifests.set(readManifest(path).name, path);
      }
    }
  }

  return manifests;
};

const externalManifest = (name: string, from: string): string => {
  const require = createRequire(from);

  try {
    return require.resolve(`${name}/package.json`);
  } catch {
    let dir = dirname(require.resolve(name));

    while (dir !== dirname(dir)) {
      const path = join(dir, "package.json");

      if (existsSync(path) && readManifest(path).name === name) {
        return path;
      }

      dir = dirname(dir);
    }

    throw new Error(`Missing production manifest for ${name}`);
  }
};

const assertAllowedDependency = (from: string, name: string) => {
  if (name === "react" || (name.startsWith("@usebutr/") && name !== "@usebutr/core")) {
    throw new Error(
      `Core production dependency ${from} -> ${name} violates the dependency boundary`,
    );
  }
};

const assertCoreBoundary = (rootManifest: string, workspaces: ReadonlyMap<string, string>) => {
  const seen = new Set<string>();

  const visit = (path: string) => {
    if (seen.has(path)) {
      return;
    }

    seen.add(path);
    const pkg = readManifest(path);

    for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
      assertAllowedDependency(pkg.name, name);
      const workspace = workspaces.get(name);

      if (workspace === undefined && version.startsWith("workspace:")) {
        throw new Error(`Missing workspace manifest for ${name}`);
      }

      visit(workspace ?? externalManifest(name, path));
    }
  };

  visit(rootManifest);
};

describe("@usebutr/core dependency boundary", () => {
  it("reads the real root manifest and follows production dependencies without dist output", () => {
    const core = fileURLToPath(new URL("../../package.json", import.meta.url));
    const root = fileURLToPath(new URL("../../../..", import.meta.url));
    expect(() => {
      assertCoreBoundary(core, workspaceManifests(root));
    }).not.toThrow();
  });
});
