# Playbooks Clients

One workspace for three independently installable Node.js packages:

| Package | Responsibility |
| --- | --- |
| `@playbooks/sdk` | Resource-oriented platform API covering CLI operations, explicit credentials, errors, files, and streams |
| `@playbooks/cli` | `playbooks` terminal commands, configuration, credentials, files, and output |
| `@playbooks/mcp` | `playbooks-mcp` agent tools adapting CLI workflows |

Dependencies flow from MCP to CLI to SDK. Server remains authoritative for permissions, billing, and execution. The SDK is for backend platform access, not browser managed-service access. Construct `PlaybooksSDK({ apiKey })`, select a Workspace with `client.workspaces.get(uuid)`, and navigate its resources. All CLI platform operations use named SDK methods; local terminal behavior remains in CLI. SDK pages start at 1 and CLI pages at 0.

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

## Local environment

Copy `.env.example` to `.env` and set `PLAYBOOKS_TOKEN` to a developer API key for `PLAYBOOKS_API_URL`. Load it explicitly from the repository root:

```sh
node --env-file=.env packages/cli/dist/index.cjs --help
node --env-file=.env packages/mcp/dist/index.cjs
```

CLI and MCP do not automatically load dotenv files. MCP passes its environment to the installed CLI; it needs no separate credential file. An empty token falls back to existing CLI login credentials, which must match the API origin. The SDK reads no environment files: pass `apiKey` and `baseUrl` explicitly in application code.

CLI build defaults live in `packages/cli/.env` and `packages/cli/.env.production`; use `packages/cli/.env.example` as the template. Vite production builds prefer the production file. Only public endpoint settings belong in `VITE_*` variables. Runtime `PLAYBOOKS_API_URL` overrides the compiled API endpoint. The compiled web domain controls browser-opening commands. Unused legacy `VITE_PORT` and `VITE_CLI_DOMAIN` settings are not needed.

Local environment files are ignored by Git; only `.env.example` templates are tracked. Prepare new release artifacts after changing build defaults.

## Local integration tests

The client suite connects to the existing local Server. It uses real SDK requests, CLI subprocesses, and MCP stdio calls against one disposable Project in a dedicated **Clients** Workspace. It is a representative integration suite, not exhaustive API or platform acceptance.

Copy `.env.test.example` to ignored `.env.test`, configure the local setup administrator and trusted CA, and explicitly approve the development target. The default test origin is `https://api.playbooks.dev:8000`; ordinary CLI `.env` settings are not used. `CLIENTS_TEST_SERVER_ROOT` points to the local Server checkout for development-target verification and the same narrowly scoped account-activation fixture used by Auto. No Auto checkout is required to run the suite.

```sh
pnpm test:setup
pnpm test:check
pnpm test
pnpm test:cleanup -- --run <run-id>
```

Setup retains its generated basic account, private Workspace, and Workspace-scoped developer key under ignored `.runs/identity.json` with owner-only access. Only that exact account is activated by the local fixture; email delivery is not tested. Administrative readiness observations and supported 100-credit funding grants run in a separate helper. Administrative credentials and sessions never reach SDK, CLI, or MCP test processes. Do not commit `.env.test`, `.runs`, credentials, or raw session responses.

Each run checks resource updates and failed-update snapshots, serialization, the current zero-based SDK/CLI pagination contract, JSON output and errors, MCP discovery/filtering/confirmation, and file round trips with revision protection. One fixed Operator prompt reads the reference file; SDK and CLI observe its stream and MCP inspects its result. The prompt is capped at 5 credits and 10 minutes, with a 30-minute overall deadline and cleanup reserve. A successful submission alone is not a pass. No automatic prompt retries, publication, payments, or generated application journeys are included.

Runs are sequential and hold a Workspace lease. Manifests persist ownership and mutation intent before dispatch. Cleanup uses exact recorded Project IDs and requires a completed lifecycle receipt confirming shutdown and storage release. Failed cleanup keeps the lease and must be resumed with `test:cleanup`; never remove a lease or guess ownership from names. Setup refuses to replay unresolved registration or key creation. Investigate and reconcile the exact recorded identity before retrying.

Deletion is submitted through the SDK with the scoped developer key. Receipt observation uses the same basic test account's session: current Server developer-key middleware cannot resolve the Project after deletion. This is a cleanup-infrastructure workaround, not verification of post-deletion receipt access with developer keys.

The run manifest records individual scenario outcomes, untested areas, elapsed time, observed credits, and cleanup status. Operator submission, run discovery, scoped filters, SDK streaming, CLI streaming, and final inspection each have separate outcomes. Both streams must identify the same completed run, and the assistant response must contain the reference-file marker. Missing configuration or infrastructure is a blocker; API defects and unmet assertions are failures. Cleanup is reported independently. Live elapsed time excludes builds and package verification. The suite never starts/reconfigures services or repairs Server. Keep real-stack integration runs separate from the credential-free package verification in release preparation.

## Release preparation

All packages share one version. Internal `workspace:*` dependencies become exact versions in tarballs.

```sh
pnpm release:prepare 1.0.0
```

This updates all manifest versions, refreshes the workspace lockfile, runs lint/type checks, builds SDK → CLI → MCP, and packs into ignored `artifacts/<version>/`. It validates packed manifests and installs all three tarballs in a temporary directory to verify ESM/CommonJS imports and declarations, CLI help/version, and MCP initialization and tool discovery. Installation may require registry access. The temporary installation is removed afterward. `release.json` records artifact SHA-512 integrity in publication order only after verification succeeds. No package is published and no Git tag is created.

Before a public release, verify the chosen version is unused for every package and verify npm publishing access. Prepare and review the artifacts from the intended release commit. Publish those exact tarballs in SDK → CLI → MCP order, confirming each registry artifact and exact dependency before continuing. Only after all three match should the shared `v<version>` release tag be created and pushed. Do not run package-local version/deploy scripts.

If publication stops partway, keep the original artifacts and compare already-published `dist.integrity` values with `release.json`. Resume only missing packages when all existing artifacts match. Never overwrite or rebuild a published version; an integrity mismatch requires investigation and a new shared version. npm publication is not atomic across packages.

## Repository cutover

CLI history is the base; MCP history is merged without rewriting and its tags use the `mcp/` prefix. The local migration retains original checkouts. The planned remote identity is `playbooks-hq/playbooks-clients`; rename the CLI GitHub repository and update origin during an explicit public cutover. Archive the former MCP repository only after consumers and published artifacts are verified. No forwarding packages or duplicate maintenance paths are required.

Harness repository maps and test-ownership references need a separately authorized harness update. Platform tests remain in Auto; CLI alone retains independent test ownership. The Clients repository owns its explicitly authorized local integration suite. Package verification alone is release acceptance, not evidence of live platform behavior.
