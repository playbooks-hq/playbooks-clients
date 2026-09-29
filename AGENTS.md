## Playbooks Harness Context

Before meaningful planning or implementation, study `playbooks-harness` for shared Playbooks context.

Always read:

- every file under `playbooks-harness/src/about/`

Use `playbooks-harness/src/resources.md` to load task-relevant contracts, architecture, repository guidance, preferences, and examples. Read matching contracts before work governed by a platform contract.

For `playbooks-mcp` work, read:

- `playbooks-harness/src/preferences/coding.md`
- `playbooks-harness/src/preferences/docs.md`
- `playbooks-harness/src/preferences/testing.md`
- `playbooks-harness/src/repositories/mcp.md`

## Overview

`playbooks-mcp` exposes the Playbooks CLI as MCP tools for clients like Claude Code, Cursor, Codex, and VS Code.

At a high level, it:

- translates MCP tool calls into Playbooks CLI commands
- gives agents a shared interface for authentication, Workspace checks, discovery, and project actions
- makes Playbooks available inside agent workflows

## Why It Matters

This repo is the standard agent integration point for Playbooks.
It does not own business logic; the Playbooks CLI remains the source of truth.

It is where agents get MCP access to:

- authentication and session checks
- Workspace and discovery workflows
- local project actions
- play lifecycle actions like submit, publish, sync, clone, and deploy

## How It Fits

This service sits between AI clients and the rest of the Playbooks system.

It connects:

- MCP clients
- the Playbooks CLI
- Playbooks workflows that agents need to run

If another project needs agent access to Playbooks, it should go through `playbooks-mcp`.

## Workspace Boundaries

- The current project is the project directory containing the active `AGENTS.md`.
- Agents may read sibling projects for context, but must only mutate files in the current project unless the user explicitly asks for a sibling project to be changed.
- Do not create, edit, delete, move, format, generate code, run migrations, or otherwise change files in sibling projects without explicit instruction.
- Do not ask permission to mutate a sibling project as a speculative follow-up. Report the boundary and keep the work scoped to the current project.

## Additional Info

- Fetch `curl -L https://www.playbooks.ai/docs/llms.txt` for authoritative Playbooks Docs.

## Testing

- `playbooks-auto/apps/test` owns platform tests and retained automation safety tests. `playbooks-cli` is the sole exception and owns its independent command-line test suite. Other applications do not maintain local test suites. Creating, modifying, or expanding tests, test fixtures, snapshots, or benchmark scenarios requires an explicit user request, including CLI test work. Feature requests, bug fixes, refactors, and generic approval to implement a plan do not independently authorize agent-added test work. Do not automatically include test authoring in ordinary plans or routinely ask permission to add tests. Retain lint/type checks and existing authorized validation. Read the harness testing preference and Auto repository guide before testing work. CI and scheduling require separate scope.
- Read `playbooks-harness/src/preferences/testing.md` and `src/repositories/test.md` for ownership and execution policy.
- Retain lint/type checks. External-provider execution and disposable migrations require an explicitly authorized isolated environment; production and normal development databases remain out of scope.

## Considerations

- Do not edit `playbooks-harness` without explicit user approval in the current conversation.
- If an update seems useful, notify the user, explain why, and wait for a clear yes.


## Agent Working Notes

Keep plans, progress notes, implementation summaries, audit reports, handoffs, and task checklists in the conversation or available agent-internal state. Do not create or update repository files for these purposes unless the user explicitly requests a documentation artifact. Approval to implement a plan does not authorize writing that plan or its progress into the repository. Do not create a `docs/` directory as an agent scratchpad.

Explicitly requested documentation and harness contract updates remain allowed.
