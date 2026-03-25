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
