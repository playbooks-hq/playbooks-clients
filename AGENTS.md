# Playbooks Clients

Read every file under `../playbooks-harness/src/about/`, plus its coding, docs, and testing preferences and CLI/MCP repository guides before meaningful work. Read matching platform contracts, especially Workspace tenancy, before changing behavior. Harness files require explicit authorization naming `playbooks-harness` before mutation.

This repository owns `packages/sdk`, `packages/cli`, and `packages/mcp`. MCP adapts CLI workflows; CLI owns terminal behavior and credential discovery; SDK owns explicit-input platform transport and resource-oriented operations. Server owns permissions, billing, and execution. Follow nearby patterns and keep changes focused.

Use pnpm from the root. Run `pnpm lint` and `pnpm typecheck` for changes. Build only when requested or when performing the explicitly requested release preparation. `pnpm release:prepare` builds and verifies artifacts without publishing. Packages share one version.

Platform journeys remain in `playbooks-auto/apps/test`. This repository additionally owns the explicitly authorized SDK/CLI/MCP local integration suite in root `tests/`. Keep it focused on public client contracts and the dedicated Clients Workspace; do not expand it into platform journeys. Creating or changing tests, fixtures, snapshots, benchmarks, or CI requires explicit user scope. Ordinary implementation does not authorize test authoring.

Only mutate this repository unless the user explicitly authorizes another project. Keep plans, progress, and handoffs in conversation, not repository files. Never use documentation folders as scratch space.
