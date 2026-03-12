# playbooks-mcp

`playbooks-mcp` is a local MCP server that wraps the existing Playbooks CLI and exposes its most useful commands as MCP tools.

## Overview

- Uses stdio transport so MCP clients can spawn it locally.
- Resolves the Playbooks CLI from `PLAYBOOKS_CLI_PATH`, then the installed `@playbooks/cli` dependency, then `../playbooks-cli/dist/index.js`, then `playbooks` on `PATH`.
- Keeps the wrapper small and focused: it delegates the real work to the existing CLI instead of reimplementing the Playbooks API client.

## Prerequisites

- Node.js 20+
- `@playbooks/cli` is installed as a package dependency and is used by default.
- `PLAYBOOKS_CLI_PATH` can override that when you want to point at a different CLI build or binary.

## Installation

```sh
cd /Users/erichubbell/Sites/playbooks/playbooks-mcp
npm install
npm run build
```

## Run

```sh
cd /Users/erichubbell/Sites/playbooks/playbooks-mcp
npm start
```

## Configuration

Environment variables:

- `PLAYBOOKS_CLI_PATH`: override the CLI binary or JS entry file to execute.
- `PLAYBOOKS_CONFIG`: override the default Playbooks config path. Defaults to `~/.playbooksrc`.
- `PLAYBOOKS_MCP_TIMEOUT_MS`: override the CLI command timeout. Defaults to `120000`.

Each tool also accepts an optional `configPath` argument when you need to target a non-default Playbooks auth file.

## Tools

Read and session tools:

- `playbooks_status`
- `playbooks_help`
- `playbooks_ping`
- `playbooks_account`
- `playbooks_session`
- `playbooks_teams`
- `playbooks_subscription`
- `playbooks_usage`
- `playbooks_downloads`
- `playbooks_banks`
- `playbooks_cards`
- `playbooks_charges`
- `playbooks_payouts`
- `playbooks_transfers`
- `playbooks_play`
- `playbooks_plays`

State-changing tools:

- `playbooks_login`
- `playbooks_logout`
- `playbooks_download`
- `playbooks_add`
- `playbooks_clone`
- `playbooks_sync`
- `playbooks_toggle`

## Example MCP Client Config

```json
{
  "mcpServers": {
    "playbooks": {
      "command": "node",
      "args": [
        "/Users/erichubbell/Sites/playbooks/playbooks-mcp/dist/index.js"
      ]
    }
  }
}
```
