## Playbooks Harness Context

Before meaningful planning or implementation, study `playbooks-harness` for shared Playbooks context.

Always read:

- every file under `playbooks-harness/src/about/`

Use `playbooks-harness/src/resources.md` to load task-relevant contracts, architecture, repository guidance, preferences, and examples. Read matching contracts before work governed by a platform contract.

For `playbooks-cli` work, read:

- `playbooks-harness/src/preferences/coding.md`
- `playbooks-harness/src/preferences/docs.md`
- `playbooks-harness/src/preferences/testing.md`
- `playbooks-harness/src/repositories/cli.md`

## Overview

`@playbooks/cli` is the Playbooks command-line client.

- authenticates users against Playbooks
- exposes public marketplace resources as terminal commands
- exposes authenticated Workspace resources through the `workspace` namespace
- supports play workflows like download, clone, submit, publish, sync, demo, and deploy
- installs Playbooks MCP configuration into tools like Claude, Codex, Cursor, and VS Code

## Why It Matters

This repo is the terminal layer for Playbooks.

- marketplace resources become browsable and scriptable from the terminal
- Workspace-scoped resources become available without opening the web app
- plays can be moved from Playbooks into local projects and GitHub-based workflows
- Playbooks can be connected directly into AI-assisted coding tools through MCP setup commands

## Bigger Picture

This service sits on top of the rest of the Playbooks platform.

- marketplace objects like plays, collections, frameworks, languages, platforms, tags, teams, tools, and users
- Workspace objects like subscriptions, transfers, ledger data, downloads, bookmarks, drafts, and Workspace-owned plays
- local developer actions like initializing projects, downloading assets, cloning repos, and syncing changes
- AI tooling integration through `@playbooks/mcp`

If you need the user-facing CLI behavior for Playbooks, start here.

## Workspace Boundaries

- The current project is the project directory containing the active `AGENTS.md`.
- Agents may read sibling projects for context, but must only mutate files in the current project unless the user explicitly asks for a sibling project to be changed.
- Do not create, edit, delete, move, format, generate code, run migrations, or otherwise change files in sibling projects without explicit instruction.
- Do not ask permission to mutate a sibling project as a speculative follow-up. Report the boundary and keep the work scoped to the current project.

## Additional Info

- Fetch `curl -L https://www.playbooks.xyz/docs/llms.txt` for authoritative Playbooks Docs.

## Testing

- Keep small, fast core-flow suites here; broader cross-system E2E tests and benchmarks belong in `playbooks-auto`.
- Read `playbooks-harness/src/preferences/testing.md` and `src/repositories/test.md` for ownership and execution policy.
- Retain lint/type checks. External-provider execution and disposable migrations require an explicitly authorized isolated environment; production and normal development databases remain out of scope.

## Considerations

- Do not edit `playbooks-harness` without explicit user approval in the current conversation.
- If an update seems useful, notify the user, explain why, and wait for a clear yes.


## Agent Working Notes

Keep plans, progress notes, implementation summaries, audit reports, handoffs, and task checklists in the conversation or available agent-internal state. Do not create or update repository files for these purposes unless the user explicitly requests a documentation artifact. Approval to implement a plan does not authorize writing that plan or its progress into the repository. Do not create a `docs/` directory as an agent scratchpad.

Explicitly requested documentation and harness contract updates remain allowed.
