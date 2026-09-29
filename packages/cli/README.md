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

## Operator messages and runs

Submit a message, inspect its runs, then follow a specific attempt:

```sh
playbooks project message create --project portal --data '{"text":"Review authentication","mode":"plan"}' --yes
playbooks project runs --project portal --message 123
playbooks project run stream --project portal --run 456
```

Workspace operators use `workspace messages`, `workspace message`, `workspace message create`, `workspace message update`, `workspace runs`, and `workspace run stream`. Creation may execute or steer work and incur usage; server preferences apply when mode and delivery mode are omitted. It may instead queue a message, request clarification, or return a comment without a run. Acceptance is not completion.

Message commands default to the primary conversation, which the server may initialize on first access. Use `workspace conversation`, `project conversation`, or `project conversations` to inspect conversation identifiers. Override with `--conversation <uuid>`; project messages use the conversation's latest branch unless `--branch <numeric-id>` is supplied. If no branch is recorded, choose one from `project branches`. Overrides are never saved.

Messages support `text`, `mode` (plan/execute), `modelId`, `deliveryMode` (queue/steer), and `replyToMessageId` in `--data`. Both message submission commands support `idempotencyKey`; Project submission additionally supports `maxCredits`. Workspace submission generates a key when omitted and reports it if the response is uncertain. Retry identical data with that same key to avoid duplicate work. Prefer `--data -` for sensitive text. Project messages are sandbox-only. Only pending queued messages can be updated, using `text`, `queuedMode`, or `queuedModelId`. Message deletion cancels queued work, retaining history.

Message lists accept `--before <input-message-id>` and `--page-size 1-100`. Use the Server-provided `meta.nextCursor` as `--before` while `meta.hasMore` is true; output-message IDs and rendered message counts are not pagination cursors. Run lists accept `--message` and zero-based pagination. `project run --project portal --run 456` returns the run and available input/output; attempts are never selected automatically.

Project and Workspace streams only observe; opening or reconnecting a stream never starts execution and requires no confirmation. Terminal streams show text; `--json` or piped output emits newline-delimited `{ event, data }` records, followed by a `run-status` event when the Server sends an authoritative finish. Closing the connection alone does not establish completion. Streams do not support `--select`.

Streams stop after 1,800 seconds by default; use `--timeout <seconds>` to change this. Connection and inactivity timeouts also apply. Waiting for input or approval is reported separately from completion. Failures and incomplete streams return a nonzero exit code. Streams never reconnect automatically, and Ctrl-C stops observation without canceling remote work. Interactive chat, approval submission, and run retry/cancel commands remain deferred.

## Scripts and Discovery

```sh
playbooks projects --json --select uuid,name,status
playbooks templates --category business --type website --query portal
playbooks project update --project abc --data '{"description":"Customer support app"}'
```

Public discovery uses `templates`, `categories`, `collections`, `creators`, and `types`. Creators are public Workspace profiles. Owned Templates are separate: use `workspace templates`.

Use category and type identifiers returned by `categories` and `types`; example identifiers are placeholders. Filter projects with `--folder <folder-uuid>` or `--owner <numeric-user-id>`. Supported lists accept `--sort name:asc` or another field and direction shown in their help.

Plural resource names list records; singular names address one record, such as `project release --project abc --release def`. Mutations follow the resource name. `--file-id` identifies an Agent File; binary transfers continue to use `--upload` and `--output`.

Structured input uses `--data` with a JSON object or `--data -` for stdin, up to 1 MB. Paths are not interpreted as input files:

```sh
cat settings.json | playbooks project settings update --project abc --data -
```

Prefer stdin for sensitive or large payloads: inline arguments can appear in shell history and process inspection. Help examples use placeholders such as `CURRENT_REVISION` and `BASE64_CONTENT`; replace these with current server values or actual encoded content.

Piped output is JSON automatically. Responses retain `{ data, meta? }`; errors go to stderr as `{ error }` with a nonzero exit code. Paginated lists use zero-based `--page` and `--page-size`; full-list endpoints do not expose pagination. Search remains available where supported. Command help lists only supported options.

Workspace folders, template versions, invitations, designs, secrets, files, schedules, and domains, plus project files and workflows, return full lists unless `--page` or `--page-size` is supplied. These opt-in lists accept page sizes from 1–100. Operational project connectors follow the same opt-in pagination behavior and support search and sorting; application project connectors remain paginated by default.

`--include` fetches allowed inline relations on templates and projects; `--select` selects fields from the returned data, including nested fields. For example: `playbooks project --project abc --include folder,type --select uuid,name,folder.name`. File lists and project design/skill libraries support `--available` to include available or inherited resources.

Project logs use cursor pagination: `playbooks project logs --project abc --query error --limit 50`. Pass the returned `data.nextCursor` as `--cursor` to fetch the next page; a null cursor means there is no next page. Logs do not accept `--page`, `--page-size`, or custom sorting.

Workspace context is stored in `~/.config/playbooks/config.json`, with separately protected credentials alongside it. Use `--config <path>` consistently for isolated automation contexts. Environment keys are never saved. Previously saved project identifiers are ignored; existing workspace selection and credentials remain usable.

## Find Commands

```sh
playbooks --help
playbooks project create --help
playbooks mcp install codex
```

Root help lists all commands by their full names; command help shows supported options and input fields. Private resources require an authorized workspace, supplied explicitly or through saved selection. Settings and resource output preserve owned/inherited distinctions supplied by the server. Revision-checked edits require the current revision. File downloads refuse to overwrite existing files.

`completion print bash` and `completion print zsh` print shell completion definitions, including operator message/run commands. Local MCP installation is separate from platform MCP configuration. Interactive Agent conversations are not supported.

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
