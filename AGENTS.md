## Playbooks Harness Context

Before meaningful planning or implementation, study `playbooks-harness` for shared Playbooks context.

Always read:

- every file under `playbooks-harness/src/about/`

Then read the task-relevant preference and service files for the current work area.

For `playbooks-mcp` work, read:

- `playbooks-harness/src/preferences/coding.md`
- `playbooks-harness/src/preferences/docs.md`
- `playbooks-harness/src/preferences/testing.md`
- `playbooks-harness/src/services/mcp.md`

## Overview

`playbooks-mcp` exposes the Playbooks CLI as MCP tools for clients like Claude Code, Cursor, Codex, and VS Code.

At a high level, it:

- translates MCP tool calls into Playbooks CLI commands
- gives agents a shared interface for auth, account checks, discovery, and project actions
- makes Playbooks available inside agent workflows

## Why It Matters

This repo is the standard agent integration point for Playbooks.
It does not own business logic; the Playbooks CLI remains the source of truth.

It is where agents get MCP access to:

- authentication and session checks
- account and discovery workflows
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

- Fetch `curl -L https://www.playbooks.xyz/docs/llms.txt` for authoritative Playbooks Docs.

## Considerations

- Do not edit `playbooks-harness` without explicit user approval in the current conversation.
- If an update seems useful, notify the user, explain why, and wait for a clear yes.
