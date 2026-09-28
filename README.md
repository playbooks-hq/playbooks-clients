# Playbooks CLI

Manage Playbooks resources from your terminal. Use a saved workspace or pass `--workspace` per command. Identify existing projects explicitly with `--project`.

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

`workspace current` shows the saved workspace. `workspace clear` clears local selection without leaving membership or signing out. Commands never silently switch tenants.

## Work with Projects

```sh
playbooks project create --data '{"name":"Customer portal"}'
playbooks project settings --project abc
playbooks project open --project abc
```

Commands targeting an existing project require `--project`; listing and creation do not. Projects are not saved in local context. The project must belong to the authorized workspace used for that invocation.

Workspace selection is optional. Interactive work can use a saved default; automation can provide both identifiers:

```sh
playbooks workspace use --workspace acme
playbooks project logs --project abc
playbooks project logs --workspace acme --project abc
```

An explicit `--workspace` overrides the saved workspace for one invocation without changing it. If neither is available, the command fails. Invalid or unauthorized targets never fall back to another workspace.

Publication starts with `project preflight --project abc`. Supply the reviewed `expectedRevision` to `project publish --project abc --data '{"expectedRevision":"CURRENT_REVISION"}' --yes`; replace the placeholder with the value returned by preflight. Add `--wait` to observe completion for up to five minutes. Publication and other remote operations can incur usage charges. Interrupting the CLI does not cancel accepted remote work. Inspect `project releases --project abc` or `project lifecycle --project abc` to follow outstanding work.

## Scripts and Discovery

```sh
playbooks projects --json --select uuid,name,status
playbooks templates --query portal
playbooks project update --project abc --data '{"description":"Customer support app"}'
```

Public discovery uses `templates`, `categories`, `collections`, `creators`, and `types`. Creators are public Workspace profiles. Owned Templates are separate: use `workspace templates`.

Plural resource names list records; singular names address one record, such as `project release --project abc --release def`. Mutations follow the resource name. `--file-id` identifies an Agent File; binary transfers continue to use `--upload` and `--output`.

Structured input uses `--data` with a JSON object or `--data -` for stdin, up to 1 MB. Paths are not interpreted as input files:

```sh
cat settings.json | playbooks project settings update --project abc --data -
```

Prefer stdin for sensitive or large payloads: inline arguments can appear in shell history and process inspection. Help examples use placeholders such as `CURRENT_REVISION` and `BASE64_CONTENT`; replace these with current server values or actual encoded content.

Piped output is JSON automatically. Responses retain `{ data, meta? }`; errors go to stderr as `{ error }` with a nonzero exit code. Pagination is zero-based; each list request fetches one page. Search remains available where supported. `--select` supports nested output fields; query filters `--sort`, `--include`, and `--status` are not exposed.

Workspace context is stored in `~/.config/playbooks/config.json`, with separately protected credentials alongside it. Use `--config <path>` consistently for isolated automation contexts. Environment keys are never saved. Previously saved project identifiers are ignored; existing workspace selection and credentials remain usable.

## Find Commands

```sh
playbooks --help
playbooks project create --help
playbooks mcp install codex
```

Root help lists all commands by their full names; command help shows supported options and input fields. Private resources require an authorized workspace, supplied explicitly or through saved selection. Settings and resource output preserve owned/inherited distinctions supplied by the server. Revision-checked edits require the current revision. File downloads refuse to overwrite existing files.

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
