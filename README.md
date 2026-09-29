# Playbooks MCP

Use Playbooks Workspaces, Projects, Templates, and Operators from an MCP client. This local stdio server delegates operations to the Playbooks CLI; the CLI and Server own authentication, permissions, validation, and execution.

## Requirements

- Node.js 22.12 or newer.
- The Workspace/Project rewrite of `@playbooks/cli`. Legacy CLI releases are incompatible and rejected at startup.
- A scoped developer API key, configured through the CLI or supplied as `PLAYBOOKS_TOKEN` by your secret manager. Application API keys are not supported.

Authenticate outside the agent conversation:

```sh
playbooks login
playbooks status
playbooks mcp install codex
```

The installer also accepts `claude`, `cursor`, and `vscode`. Never put credentials in tool arguments or project files.

## Configuration

```sh
npx -y @playbooks/mcp
npx -y @playbooks/mcp --toolsets core,operator,discovery,project
npx -y @playbooks/mcp --toolsets all --read-only
npx -y @playbooks/mcp --config /absolute/path/config.json
```

The default config is `~/.config/playbooks/config.json`. Use the same `--config` path when authenticating with the CLI. The config is fixed for an MCP connection; tools cannot change credentials or saved Workspace selection.

Private tools require an explicit `workspace`. Tools targeting an existing Project also require `project`. Saved CLI context is visible through `playbooks_status` but never supplies an implicit mutation target.

| Toolset | Contents | Default |
| --- | --- | --- |
| `core` | Identity, Workspace discovery, Projects, preflight, publication, releases, logs | Yes |
| `operator` | Project conversations, messages, and run inspection | Yes |
| `discovery` | Public Templates, categories, collections, creators, types | Yes |
| `templates` | Workspace-owned Templates and publication | No |
| `workspace` | Workspace administration, configuration, financial observations, Workspace Operator | No |
| `project` | Project configuration, source, checkpoints, administration, workflows | No |
| `local` | Browser opening, file transfers, source import, export | No |

`--toolsets` replaces the default selection; `all` enables every group. `--read-only` removes mutating tools regardless of group selection, including local file writes and conversation reads that may initialize state. It narrows the MCP tool surface; Server permissions remain authoritative. Restart the MCP connection after changing options.

`playbooks_help` lists the enabled tools and can show an individual tool's input schema. Command names map directly to tools: `project message create` becomes `playbooks_project_message_create`.

## Project Workflow

Use `playbooks_workspace_list` to find an authorized Workspace, then call `playbooks_projects` with `{ "workspace": "WORKSPACE_UUID" }`.

To submit Operator work, call `playbooks_project_message_create`:

```json
{
  "workspace": "WORKSPACE_UUID",
  "project": "PROJECT_UUID",
  "data": { "text": "Review authentication", "mode": "plan", "idempotencyKey": "UNIQUE_REQUEST_KEY" },
  "confirm": true
}
```

Acceptance may mean queued work, clarification, a comment, or a run. Inspect the returned message and use `playbooks_project_runs` and `playbooks_project_run` to observe an explicitly selected attempt. Waiting is not completion. Message deletion cancels queued work and retains history; it does not cancel an active run.

For publication, inspect `playbooks_project_preflight`, then pass its reviewed `expectedRevision` in `data` to `playbooks_project_publish` with `confirm: true`. Inspect the returned release using `playbooks_project_release`. Publishing and Operator execution can incur usage charges.

Tools use structured `data` objects, delivered to the CLI through stdin. Fields such as revisions, idempotency keys, permissions, and budgets retain their CLI/Server meaning. A `confirm` field defaults to false and maps to the CLI's `--yes`; the calling client remains responsible for obtaining user authorization.

Results preserve `{ data, meta? }` and inline relations, with both JSON text and structured content. Errors use `{ error: { status, title, description, source?, debug? } }`. List tools expose only their supported pagination: zero-based `page`/`pageSize`, message `before` cursors, or log `cursor`/`limit`. Preserve the returned cursor rather than deriving one from record counts.

Calls are bounded to 120 seconds and 8 MiB of output. Narrow queries or use `select` for large results. Canceling an MCP request stops the local CLI process, not accepted remote work. Inspect state before retrying uncertain mutations; reuse the same idempotency key and identical input where supported. Streaming, automatic polling, login/logout, and arbitrary CLI execution are not exposed.

## Manual Client Setup

For Claude (`~/.claude.json`) and Cursor (`~/.cursor/mcp.json`), merge this entry into `mcpServers`:

```json
{
  "mcpServers": {
    "playbooks": { "command": "npx", "args": ["-y", "@playbooks/mcp"] }
  }
}
```

For Codex (`~/.codex/config.toml`):

```toml
[mcp_servers.playbooks]
command = "npx"
args = ["-y", "@playbooks/mcp"]
```

For VS Code project configuration (`.vscode/mcp.json`):

```json
{
  "servers": {
    "playbooks": { "type": "stdio", "command": "npx", "args": ["-y", "@playbooks/mcp"] }
  }
}
```

Append server options to `args` as separate entries. On Windows, use the CLI installer, which configures `cmd /c npx`. Do not replace unrelated client settings.

## Development And Release

```sh
npm install
npm run lint
npm run typecheck
```

Point a development MCP client at `node /absolute/path/playbooks-mcp/dist/index.cjs` after explicitly building the package. The adapter resolves the installed CLI package's declared executable; it does not fall back to a global CLI. No sibling checkout is read at runtime.

Publishing requires an exact, identifiable CLI rewrite version in `package.json`, an installed matching artifact, and a refreshed lockfile. `prepublishOnly` rejects the legacy dependency or an unpinned version. A locally rewritten CLI still labeled `0.16.1` is not a distributable release identity. Registry access and an approved CLI release are prerequisites for release verification.

Platform test authoring belongs to `playbooks-auto` under separate scope. Live mutations and external-provider checks require an authorized environment. Static checks do not establish live execution acceptance.
