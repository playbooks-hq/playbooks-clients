## Overview

The Playbooks MCP server gives developers MCP access to their Playbooks account.
Using the server, agents can inspect configuration, view account details, browse templates, and run common Playbooks workflow actions from chat.
After installation, add the server to your MCP client using the examples below.

## Prerequisites

- node
- npm
- @playbooks/cli

## Installation

```sh
npx -y @playbooks/mcp
```

## Quick Start

Use the `@playbooks/cli` helpers to update each client's global config file.

```sh
npm install -g @playbooks/cli
playbooks mcp claude
playbooks mcp cursor
playbooks mcp codex
playbooks mcp vscode
```


## Configuration

The Playbooks MCP server uses the same Playbooks configuration file as the CLI.
By default it reads `~/.playbooksrc`.
If you need a different file, most tools accept an optional `configPath` argument.
Search-oriented list tools also accept a `query` argument where the underlying CLI supports it.
When a tool accepts `include`, requested related data is returned inline on each record.

## Table of Contents

- [vscode](#vscode)
- [claude-code](#claude-code)
- [openai-codex](#openai-codex)
- [tools](#tools)
- [development](#development)
- [troubleshooting](#troubleshooting)

## Claude Code

Add the server to `~/.claude.json` for global scope or `.claude/settings.json` for project scope:

```json
{
  "servers": {
    "playbooks": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playbooks/mcp"]
    }
  }
}
```


## Cursor

Add the server to `~/.cursor/mcp.json` for global scope or `.cursor/mcp.json` for project scope:

```json
{
  "servers": {
    "playbooks": {
      "command": "npx",
      "args": ["-y", "@playbooks/mcp"]
    }
  }
}
```

## OpenAI Codex

Add the server to `~/.codex/config.toml`:

```toml
[mcp_servers.playbooks]
command = "npx"
args = ["-y", "@playbooks/mcp"]
```


## VSCode

Add the server to `~/.vscode/mcp.json` for global scope or `.vscode/mcp.json` for project scope:

```json
{
  "servers": {
    "playbooks": {
      "command": "npx",
      "args": ["-y", "@playbooks/mcp"]
    }
  }
}
```

## Tools

- `playbooks_account`
- `playbooks_account_bookmarks`
- `playbooks_account_collections`
- `playbooks_account_drafts`
- `playbooks_account_ledgers`
- `playbooks_account_plays`
- `playbooks_account_teams`
- `playbooks_banks`
- `playbooks_cards`
- `playbooks_charges`
- `playbooks_clone`
- `playbooks_collection`
- `playbooks_collection_open`
- `playbooks_collection_plays`
- `playbooks_collections`
- `playbooks_config`
- `playbooks_download`
- `playbooks_downloads`
- `playbooks_framework`
- `playbooks_framework_open`
- `playbooks_framework_plays`
- `playbooks_frameworks`
- `playbooks_help`
- `playbooks_init`
- `playbooks_language`
- `playbooks_language_open`
- `playbooks_language_plays`
- `playbooks_languages`
- `playbooks_login`
- `playbooks_logout`
- `playbooks_oauth`
- `playbooks_payouts`
- `playbooks_ping`
- `playbooks_play`
- `playbooks_play_demo`
- `playbooks_play_deploy`
- `playbooks_play_open`
- `playbooks_plays`
- `playbooks_platform`
- `playbooks_platform_open`
- `playbooks_platform_plays`
- `playbooks_platforms`
- `playbooks_publish`
- `playbooks_register`
- `playbooks_session`
- `playbooks_status`
- `playbooks_subscription`
- `playbooks_submit`
- `playbooks_sync`
- `playbooks_category`
- `playbooks_category_open`
- `playbooks_category_templates`
- `playbooks_categories`
- `playbooks_team`
- `playbooks_team_open`
- `playbooks_team_plays`
- `playbooks_teams`
- `playbooks_tool`
- `playbooks_tool_open`
- `playbooks_tool_plays`
- `playbooks_tools`
- `playbooks_toggle`
- `playbooks_transfers`
- `playbooks_usage`
- `playbooks_user`
- `playbooks_user_open`
- `playbooks_user_plays`
- `playbooks_users`

## Development

For local MCP development, run the server as `playbooks-dev`.

1. Fork or clone `@playbooks/cli` next to this repo.
2. In `playbooks-cli`, run `npm install` and `npm start` to keep the local CLI build publishing through `yalc`.
3. In this repo, run `npm install`, then `npm run yalc`, then `npm start`.
4. Connect your MCP client to the local server using the `playbooks-dev` name.

### Claude Code

```sh
# Global
claude mcp add playbooks-dev --scope user -- node /path/to/mcp/dist/index.cjs
# Project
claude mcp add playbooks-dev -- node /path/to/mcp/dist/index.cjs
```

### Cursor

Add this to `~/.cursor/mcp.json` for global scope or `.cursor/mcp.json` for project scope:

```json
{
  "servers": {
    "playbooks-dev": {
      "command": "node",
      "args": [
        "/path/to/mcp/dist/index.cjs"
      ]
    }
  }
}
```

### OpenAI Codex

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.playbooks-dev]
command = "node"
args = ["/path/to/mcp/dist/index.cjs"]
```

### VSCode

Add this to `~/.vscode/mcp.json` for global scope or `.vscode/mcp.json` for project scope:

```json
{
  "servers": {
    "playbooks-dev": {
      "command": "node",
      "args": [
        "/path/to/mcp/dist/index.cjs"
      ]
    }
  }
}
```

## Troubleshooting

- If your MCP client does not show the latest tools, restart the MCP server connection and open a fresh chat session.
- If the server starts but commands fail, verify your Playbooks configuration file path and contents.
