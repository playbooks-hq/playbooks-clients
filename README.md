# Playbooks Clients

One workspace for three independently installable Node.js packages:

| Package | Responsibility |
| --- | --- |
| `@playbooks/sdk` | Explicit-input platform HTTP transport, errors, and typed Workspace/Project reads |
| `@playbooks/cli` | `playbooks` terminal commands, configuration, credentials, files, and output |
| `@playbooks/mcp` | `playbooks-mcp` agent tools adapting CLI workflows |

Dependencies flow from MCP to CLI to SDK. Server remains authoritative for permissions, billing, and execution. The SDK is for backend platform access, not browser managed-service access.

## Development

Use Node.js 22.12 or newer and pnpm 10.33.0.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
node packages/cli/dist/index.cjs --help
node packages/mcp/dist/index.cjs --help
```

Turbo builds dependencies first. Type checks build dependency declarations when necessary. The first install can warn about the CLI binary before its first build. Package-specific watch builds use `pnpm --filter @playbooks/cli start` or `pnpm --filter @playbooks/mcp start`; rebuild the SDK after changing it.

Package instructions: [SDK](packages/sdk/README.md), [CLI](packages/cli/README.md), [MCP](packages/mcp/README.md).

## Release preparation

All packages share one version. Internal `workspace:*` dependencies become exact versions in tarballs.

```sh
pnpm release:prepare 0.17.0
```

This updates all manifest versions, refreshes the workspace lockfile, runs lint/type checks, builds SDK → CLI → MCP, and packs into ignored `artifacts/<version>/`. It validates packed manifests and installs all three tarballs in a temporary directory to verify ESM/CommonJS imports and declarations, CLI help/version, and MCP initialization and tool discovery. Installation may require registry access. The temporary installation is removed afterward. `release.json` records artifact SHA-512 integrity in publication order only after verification succeeds. No package is published and no Git tag is created.

Before a public release, verify the chosen version is unused for every package and verify npm publishing access. Prepare and review the artifacts from the intended release commit. Publish those exact tarballs in SDK → CLI → MCP order, confirming each registry artifact and exact dependency before continuing. Only after all three match should the shared `v<version>` release tag be created and pushed. Do not run package-local version/deploy scripts.

If publication stops partway, keep the original artifacts and compare already-published `dist.integrity` values with `release.json`. Resume only missing packages when all existing artifacts match. Never overwrite or rebuild a published version; an integrity mismatch requires investigation and a new shared version. npm publication is not atomic across packages.

## Repository cutover

CLI history is the base; MCP history is merged without rewriting and its tags use the `mcp/` prefix. The local migration retains original checkouts. The planned remote identity is `playbooks-hq/playbooks-clients`; rename the CLI GitHub repository and update origin during an explicit public cutover. Archive the former MCP repository only after consumers and published artifacts are verified. No forwarding packages or duplicate maintenance paths are required.

Harness repository maps and test-ownership references need a separately authorized harness update. Platform tests remain in Auto; CLI alone retains independent test ownership. The current CLI has a Jest command but no tracked executable test suite. Package verification is release acceptance, not evidence of live platform behavior.
