# playbooks-mcp

## Overview

An MCP / Node project for Playbooks.

## Prerequisites

- Git
- Node.js 20+
- npm
- A valid Playbooks config file at `~/.playbooksrc` or a custom path supplied at runtime

## Setup

- run `npm install`
- run `npm run build`
- point your MCP client at `dist/index.cjs`
- use the linked `@playbooks/cli` dependency for local development

## Quick Start

- `npm install`
- `npm run build`
- `npm run serve`

## Configuration

- `PLAYBOOKS_CONFIG`: override the default Playbooks config path. Defaults to `~/.playbooksrc`
- each tool also accepts an optional `configPath` argument when you need to target a non-default auth file

## Scripts

- `npm run dev`
- `npm run build`
- `npm run build:ts`
- `npm run build:dry`
- `npm run start`
- `npm run serve`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:fix`
- `npm run typecheck`
- `npm run commit -- "message"`
- `npm run deploy -- patch`
- `npm run packages`

## MCP Client Config

```json
{
	"mcpServers": {
		"playbooks": {
			"command": "node",
			"args": ["/Users/erichubbell/Sites/playbooks/playbooks-mcp/dist/index.cjs"]
		}
	}
}
```

## Tools

### Read / Session

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

### Write / Action

- `playbooks_login`
- `playbooks_logout`
- `playbooks_download`
- `playbooks_add`
- `playbooks_clone`
- `playbooks_sync`
- `playbooks_toggle`

## Deploy

- `npm run deploy -- patch` bumps the package version, rebuilds the project, publishes to npm, then pushes commits and tags
- `npm run deploy -- minor` and `npm run deploy -- major` follow the same flow for larger releases

## Notes

### CLI Resolution

- resolves the Playbooks CLI from the installed `@playbooks/cli` dependency
- with `yalc`, that dependency points at your local CLI build for development
- falls back to `playbooks` on `PATH` if the package cannot be resolved

### MCP Runtime

- uses stdio transport so MCP clients can spawn it locally
- keeps the wrapper focused on brokering CLI commands rather than reimplementing the Playbooks API client
- uses Vite for watch-friendly runtime bundling and TypeScript for declaration output, following the same build split as `playbooks-cli`
