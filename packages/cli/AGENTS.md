# CLI

Follow the root AGENTS.md. This package owns command registration, local configuration and credentials, confirmations, filesystem workflows, output, and exit codes. Use `@playbooks/sdk` for API transport. Preserve noninteractive and JSON behavior consumed by MCP.

Client integration tests live in root `tests/` and exercise the built CLI alongside SDK and MCP. Adding or expanding tests requires explicit user authorization.
