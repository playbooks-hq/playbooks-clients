import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
process.chdir(root);
const read = (file) => JSON.parse(readFileSync(file, "utf8"));
const rootManifest = read("package.json");
const version = process.argv[2] ?? rootManifest.version;
if (process.argv.length > 3 || !/^0\.[1-9]\d*\.\d+$/.test(version))
  throw new Error("Usage: pnpm release:prepare [0.MINOR.PATCH]");
const packages = ["sdk", "cli", "mcp"];
const output = path.join(root, "artifacts", version);
// A failed preparation must not leave an earlier success marker.
rmSync(path.join(output, "release.json"), { force: true });
for (const directory of [".", ...packages.map((name) => `packages/${name}`)]) {
  const file = path.join(directory, "package.json");
  const manifest = read(file);
  manifest.version = version;
  writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
}
const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });
run("pnpm", ["install", "--lockfile-only", "--ignore-scripts", "--offline"]);
for (const task of ["lint", "typecheck", "build"]) run("pnpm", [task]);
mkdirSync(output, { recursive: true });
const artifacts = [];
for (const name of packages) {
  const directory = path.join(root, "packages", name);
  const manifest = read(path.join(directory, "package.json"));
  for (const [dependency, range] of Object.entries(
    manifest.dependencies ?? {},
  )) {
    if (dependency.startsWith("@playbooks/") && range !== "workspace:*")
      throw new Error(
        `${manifest.name} must use workspace:* for ${dependency}`,
      );
  }
  run("pnpm", ["pack", "--pack-destination", output], directory);
  const file = `playbooks-${name}-${version}.tgz`;
  const tarball = path.join(output, file);
  const packed = JSON.parse(
    execFileSync("tar", ["-xOf", tarball, "package/package.json"], {
      encoding: "utf8",
    }),
  );
  if (packed.name !== manifest.name || packed.version !== version)
    throw new Error(`Invalid manifest: ${file}`);
  const dependency =
    name === "cli"
      ? "@playbooks/sdk"
      : name === "mcp"
        ? "@playbooks/cli"
        : undefined;
  if (dependency && packed.dependencies?.[dependency] !== version)
    throw new Error(`Invalid dependency: ${file}`);
  if (JSON.stringify(packed).includes("workspace:"))
    throw new Error(`Unresolved workspace protocol: ${file}`);
  const entries = execFileSync("tar", ["-tf", tarball], {
    encoding: "utf8",
  }).split("\n");
  for (const required of [
    "dist/index.js",
    "dist/index.cjs",
    "dist/index.d.ts",
    ...(name === "sdk" ? ["dist/index.d.cts"] : []),
  ]) {
    if (!entries.includes(`package/${required}`))
      throw new Error(`Missing ${required}: ${file}`);
  }
  artifacts.push({
    name: manifest.name,
    version,
    file,
    integrity: `sha512-${createHash("sha512").update(readFileSync(tarball)).digest("base64")}`,
  });
}
run("node", ["scripts/verify-artifacts.mjs", output, version]);
writeFileSync(
  path.join(output, "release.json"),
  JSON.stringify({ version, artifacts }, null, 2) + "\n",
);
console.log(
  `Validated release artifacts: ${output}. Nothing was published or tagged.`,
);
