## Overview

`@playbooks/cli` is the Playbooks command-line client.

- authenticates users against Playbooks
- exposes public marketplace resources as terminal commands
- exposes authenticated account and workspace resources through the `account` namespace
- supports play workflows like download, add, clone, submit, publish, sync, demo, and deploy
- installs Playbooks MCP configuration into tools like Claude, Codex, Cursor, and VS Code

## Why It Matters

This repo is the terminal layer for Playbooks.

- marketplace resources become browsable and scriptable from the terminal
- account-scoped resources become available without opening the web app
- plays can be moved from Playbooks into local projects and GitHub-based workflows
- Playbooks can be connected directly into AI-assisted coding tools through MCP setup commands

## Bigger Picture

This service sits on top of the rest of the Playbooks platform.

- marketplace objects like plays, collections, frameworks, languages, platforms, tags, teams, tools, and users
- account objects like subscriptions, transfers, ledger data, downloads, bookmarks, drafts, and account-owned plays
- local developer actions like initializing projects, downloading assets, adding partials, cloning repos, and syncing changes
- AI tooling integration through `@playbooks/mcp`

If you need the user-facing CLI behavior for Playbooks, start here.
