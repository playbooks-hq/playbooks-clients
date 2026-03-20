## Overview

The Playbooks MCP server gives developers MCP access to their Playbooks account.
Using the server, agents can inspect configuration, view account details, browse plays, and run common Playbooks workflow actions from chat.
After installation, add the server to your MCP client using the examples below.

## Prerequisites

- node
- npm
- playbooks

## Installation

```sh
npx -y @playbooks/mcp
```

## Quick Start

```sh
claude mcp add playbooks -- npx -y @playbooks/mcp
claude mcp list
```

Or add the server to VSCode:

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

Or add the server to Codex:

```toml
[mcp_servers.playbooks]
command = "npx"
args = ["-y", "@playbooks/mcp"]
```

## Configuration

The Playbooks MCP server uses the same Playbooks configuration file as the CLI.
By default it reads `~/.playbooksrc`.
If you need a different file, most tools accept an optional `configPath` argument.

## Table of Contents

- [vscode](#vscode)
- [claude-code](#claude-code)
- [openai-codex](#openai-codex)
- [tools](#tools)
- [development](#development)
- [troubleshooting](#troubleshooting)

## VSCode

Add the server to `.vscode/mcp.json` in your workspace or to your user `mcp.json` file:

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

## Claude Code

Add the server with the Claude CLI:

```sh
# Global
claude mcp add playbooks --scope user -- npx -y @playbooks/mcp
# Project
claude mcp add playbooks -- npx -y @playbooks/mcp
```

Verify it:

```sh
claude mcp list
```

## OpenAI Codex

Add the server to `~/.codex/config.toml`:

```toml
[mcp_servers.playbooks]
command = "npx"
args = ["-y", "@playbooks/mcp"]
```

## Tools

- `playbooks_account`
- `playbooks_account_bookmarks`
- `playbooks_account_collections`
- `playbooks_account_drafts`
- `playbooks_account_ledger`
- `playbooks_account_plays`
- `playbooks_account_teams`
- `playbooks_add`
- `playbooks_banks`
- `playbooks_cards`
- `playbooks_charges`
- `playbooks_clone`
- `playbooks_collection`
- `playbooks_collection_plays`
- `playbooks_collections`
- `playbooks_config`
- `playbooks_download`
- `playbooks_downloads`
- `playbooks_framework`
- `playbooks_framework_plays`
- `playbooks_frameworks`
- `playbooks_help`
- `playbooks_init`
- `playbooks_language`
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
- `playbooks_plays`
- `playbooks_platform`
- `playbooks_platform_plays`
- `playbooks_platforms`
- `playbooks_publish`
- `playbooks_session`
- `playbooks_status`
- `playbooks_subscription`
- `playbooks_submit`
- `playbooks_sync`
- `playbooks_tag`
- `playbooks_tag_plays`
- `playbooks_tags`
- `playbooks_team`
- `playbooks_team_plays`
- `playbooks_teams`
- `playbooks_tool`
- `playbooks_tool_plays`
- `playbooks_tools`
- `playbooks_toggle`
- `playbooks_transfers`
- `playbooks_usage`
- `playbooks_user`
- `playbooks_user_plays`
- `playbooks_users`

## Development

For local MCP development, run the server as `playbooks-dev`.

1. Fork or clone `@playbooks/cli` next to this repo.
2. In `playbooks-cli`, run `npm install` and `npm start` to keep the local CLI build publishing through `yalc`.
3. In this repo, run `npm install`, then `npm run yalc`, then `npm start`.
4. Connect your MCP client to the local server using the `playbooks-dev` name.

### VSCode

Add this to `.vscode/mcp.json` or your user `mcp.json`:

```json
{
  "servers": {
    "playbooks-dev": {
      "command": "node",
      "args": [
        "/Users/erichubbell/Sites/playbooks/playbooks-mcp/dist/index.cjs"
      ]
    }
  }
}
```

### Claude Code

```sh
# Global
claude mcp add playbooks-dev --scope user -- node /Users/erichubbell/Sites/playbooks/playbooks-mcp/dist/index.cjs
# Project
claude mcp add playbooks-dev -- node /Users/erichubbell/Sites/playbooks/playbooks-mcp/dist/index.cjs
```

### OpenAI Codex

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.playbooks-dev]
command = "node"
args = ["/Users/erichubbell/Sites/playbooks/playbooks-mcp/dist/index.cjs"]
```

## Troubleshooting

- If your MCP client does not show the latest tools, restart the MCP server connection and open a fresh chat session.
- If the server starts but commands fail, verify your Playbooks configuration file path and contents.
