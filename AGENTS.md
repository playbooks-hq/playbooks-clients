## Overview

`@playbooks/cli` is the local command-line client for Playbooks.
It is the main terminal-facing service that brings Playbooks onto a developer's machine.

At a high level, it:

- authenticates users against Playbooks
- exposes public marketplace resources as terminal commands
- exposes authenticated account and workspace resources through the `account` namespace
- supports play workflows like download, add, clone, submit, publish, sync, demo, and deploy
- installs Playbooks MCP configuration into tools like Claude, Codex, Cursor, and VS Code

## Why It Matters

This project matters because it is the bridge between the Playbooks platform and a developer's local workflow.
Other services may own the API, marketplace state, account state, or MCP server, but this repo is what turns those capabilities into repeatable terminal commands.

It is the place where:

- marketplace resources become browsable and scriptable from the terminal
- account-scoped resources become available without opening the web app
- plays can be moved from Playbooks into local projects and GitHub-based workflows
- Playbooks can be connected directly into AI-assisted coding tools through MCP setup commands

## Bigger Picture

Within the broader Playbooks platform, this service sits at the edge of the system.

It connects several important parts of the business:

- marketplace objects like plays, collections, frameworks, languages, platforms, tags, teams, tools, and users
- account objects like subscriptions, transfers, ledger data, downloads, bookmarks, drafts, and account-owned plays
- local developer actions like initializing projects, downloading assets, adding partials, cloning repos, and syncing changes
- AI tooling integration through `@playbooks/mcp`

If another agent needs to understand how Playbooks capabilities are exposed to end users at the terminal layer, this is the repo to look at first.
