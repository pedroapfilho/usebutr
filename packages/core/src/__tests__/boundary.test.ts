import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

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

const tempRoots: Array<string> = [];

const fixture = (manifests: Readonly<Record<string, object>>) => {
  const root = mkdtempSync(join(tmpdir(), "usebutr-boundary-"));
  tempRoots.push(root);
  mkdirSync(join(root, "apps"));
  mkdirSync(join(root, "packages"));

  for (const [dir, manifest] of Object.entries(manifests)) {
    const path = join(root, "packages", dir);
    mkdirSync(path);
    writeFileSync(
      join(path, "package.json"),
      JSON.stringify({ exports: { ".": "./index.js" }, ...manifest }),
    );
    writeFileSync(join(path, "index.js"), "export {};");
  }

  return { core: join(root, "packages/core/package.json"), root };
};

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("@usebutr/core dependency boundary", () => {
  it("reads the real root manifest and follows production dependencies without dist output", () => {
    const core = fileURLToPath(new URL("../../package.json", import.meta.url));
    const root = fileURLToPath(new URL("../../../..", import.meta.url));
    expect(() => {
      assertCoreBoundary(core, workspaceManifests(root));
    }).not.toThrow();
  });

  it.each([
    "react",
    "@usebutr/react",
    "@usebutr/evm",
    "@usebutr/svm",
    "@usebutr/sui",
    "@usebutr/bitcoin",
    "@usebutr/polkadot",
    "@usebutr/walletconnect",
    "@usebutr/ledger",
    "@usebutr/wallets",
    "@usebutr/testing",
  ])("rejects direct production dependency %s even with a hidden manifest", (name) => {
    const { core, root } = fixture({
      core: { dependencies: { [name]: "*" }, name: "@usebutr/core" },
    });

    expect(() => {
      assertCoreBoundary(core, workspaceManifests(root));
    }).toThrow(/violates the dependency boundary/v);
  });

  it("rejects workspace-transitive production dependencies with hidden manifests", () => {
    const { core, root } = fixture({
      core: { dependencies: { helper: "workspace:*" }, name: "@usebutr/core" },
      helper: { dependencies: { react: "*" }, name: "helper" },
    });

    expect(() => {
      assertCoreBoundary(core, workspaceManifests(root));
    }).toThrow(/helper -> react/v);
  });

  it("follows external production dependencies whose exports hide package.json", () => {
    const { core, root } = fixture({
      core: { dependencies: { helper: "1.0.0" }, name: "@usebutr/core" },
    });

    const external = join(root, "node_modules/helper");
    mkdirSync(external, { recursive: true });
    writeFileSync(join(external, "index.js"), "export {};");
    writeFileSync(
      join(external, "package.json"),
      JSON.stringify({
        dependencies: { react: "*" },
        exports: { ".": "./index.js" },
        name: "helper",
      }),
    );
    expect(() => {
      assertCoreBoundary(core, workspaceManifests(root));
    }).toThrow(/helper -> react/v);
  });

  it("follows only production dependencies and terminates cycles", () => {
    const { core, root } = fixture({
      core: { dependencies: { helper: "workspace:*" }, name: "@usebutr/core" },
      helper: {
        dependencies: { "@usebutr/core": "workspace:*" },
        devDependencies: { react: "*" },
        name: "helper",
        optionalDependencies: { react: "*" },
        peerDependencies: { react: "*" },
      },
    });

    expect(() => {
      assertCoreBoundary(core, workspaceManifests(root));
    }).not.toThrow();
  });

  it("fails when the starting manifest is missing", () => {
    const { core, root } = fixture({ core: { name: "@usebutr/core" } });
    const index = workspaceManifests(root);
    unlinkSync(core);
    expect(() => {
      assertCoreBoundary(core, index);
    }).toThrow(/ENOENT/v);
  });

  it("fails when a known workspace manifest cannot be read", () => {
    const { core, root } = fixture({
      core: { dependencies: { helper: "workspace:*" }, name: "@usebutr/core" },
      helper: { name: "helper" },
    });

    const index = workspaceManifests(root);
    unlinkSync(join(root, "packages/helper/package.json"));
    expect(() => {
      assertCoreBoundary(core, index);
    }).toThrow(/ENOENT/v);
  });

  it("fails when an expected workspace is absent", () => {
    const { core, root } = fixture({
      core: { dependencies: { missing: "workspace:*" }, name: "@usebutr/core" },
    });

    expect(() => {
      assertCoreBoundary(core, workspaceManifests(root));
    }).toThrow("Missing workspace manifest for missing");
  });

  it("fails to index a workspace directory whose manifest is missing", () => {
    const { root } = fixture({
      core: { name: "@usebutr/core" },
      helper: { name: "helper" },
    });

    unlinkSync(join(root, "packages/helper/package.json"));
    expect(() => workspaceManifests(root)).toThrow(/ENOENT/v);
  });
});
