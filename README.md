# Playbooks CLI

Manage Playbooks resources from your terminal. Select a Workspace, then work with its Projects, settings, and operations.

## Install

Requires Node.js 22.12 or newer.

```sh
npm install --global @playbooks/cli
```

## Connect

Create a scoped developer API key in Playbooks Account settings, then enter it at the hidden prompt:

```sh
playbooks login
playbooks workspace use
playbooks projects
```

Browser sign-in is awaiting a dedicated Server/App CLI handoff. Application API keys cannot authenticate this CLI.

For automation, provide `PLAYBOOKS_TOKEN` through your secret manager. Alternatively, pipe a key to `login --token-stdin` to store it locally. Never put keys in command arguments or project files.

`workspace current` shows the active Workspace. `workspace clear` clears local selection without leaving membership. Switching Workspaces clears Project selection; commands never silently switch tenants.

## Work with Projects

```sh
playbooks project create --file project.json
playbooks project use --project abc
playbooks project settings
playbooks project open
```

The creation file is a plain JSON object, for example `{"name":"Customer portal"}`. Project commands use saved selection or an explicit `--project` within the active Workspace. An explicit identifier does not change saved selection. `project current` shows the selected Project; `project clear` clears it.

Publication starts with `project preflight`. Supply the reviewed `expectedRevision` in a JSON file to `project publish --file publication.json --yes`; add `--wait` to observe completion for up to five minutes. Publication and other remote operations can incur usage charges. Interrupting the CLI does not cancel accepted remote work. Inspect `project releases` or `project lifecycle` to follow outstanding work.

## Scripts and Discovery

```sh
playbooks projects --json --select uuid,name,status
playbooks templates --query portal
playbooks project update --project abc --file changes.json
```

Public discovery uses `templates`, `categories`, `collections`, `creators`, and `types`. Creators are public Workspace profiles. Owned Templates are separate: use `workspace templates`.

Plural resource names list records; singular names address one record, such as `project release --release def`. Mutations follow the resource name. Use `workspace use --workspace abc` to select a Workspace in scripts. `--file` is JSON input; `--file-id` identifies an Agent File.

Piped output is JSON automatically. Responses retain `{ data, meta? }`; errors go to stderr as `{ error }` with a nonzero exit code. `--file -` reads JSON from stdin. Pagination is zero-based; each list request fetches one page. `--select` supports nested fields.

Context is stored in `~/.config/playbooks/config.json`, with separately protected credentials alongside it. Use `--config <path>` consistently for isolated automation contexts. Environment keys are never saved. Old CLI configuration is not imported: sign in and select a Workspace again.

## Find Commands

```sh
playbooks --help
playbooks project create --help
playbooks mcp install codex
```

Root help lists all commands by their full names; command help shows supported options and input fields. Private resources require an active Workspace. Settings and resource output preserve owned/inherited distinctions supplied by the server. Revision-checked edits require the current revision. File downloads refuse to overwrite existing files.

`completion print bash` and `completion print zsh` print top-level shell completion definitions. Local MCP installation is separate from platform MCP configuration. Interactive Agent conversations are not supported.

Saved workflow execution and recurrence are explicit actions that can affect external systems. DNS edits apply to Playbooks-managed zones; adding an external domain does not move its DNS. Domain purchases/renewals and direct Sandbox start/stop remain in the web application.

## Development

```sh
npm install
npm run lint
npm run typecheck
npm run build
```

`PLAYBOOKS_API_URL` selects an API origin for local development; use an isolated config. HTTPS is required outside loopback. Stored credentials are bound to their API origin. Product test authoring lives in `playbooks-auto` under separate scope.

Support: support@playbooks.ai
