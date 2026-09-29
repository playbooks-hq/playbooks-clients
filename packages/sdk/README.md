# Playbooks SDK

A small server-side TypeScript client for the Playbooks platform API. Requires Node.js 22.12 or newer; supports ESM and CommonJS.

```sh
npm install @playbooks/sdk
```

```ts
import { PlaybooksClient, PlaybooksError } from '@playbooks/sdk';

const client = new PlaybooksClient({
  token: process.env.PLAYBOOKS_TOKEN,
  workspace: 'WORKSPACE_UUID',
});

const { data: workspaces } = await client.workspaces.list();
const { data: workspace } = await client.workspaces.get();
const { data: projects, meta } = await client.projects.list({ page: 1, pageSize: 20 });
const { data: project } = await client.projects.get('PROJECT_UUID');
```

Your application supplies credentials explicitly. The SDK does not read environment variables, CLI credentials, or saved Workspace selection. Use a developer API key; managed-application keys and browser-side platform credentials are outside this SDK's scope. `baseUrl` defaults to `https://api.playbooks.ai`; custom remote endpoints require HTTPS. Server enforces access and billing.

Typed methods return the Server's `{ data, meta? }` envelope. Projects use the endpoint's one-based page convention; pages are not normalized or fetched automatically. Includes are passed through; this initial type surface describes core fields, not every relationship. Types follow Server public specifications and serializers; they do not perform runtime schema validation.

`PlaybooksError` exposes `status`, `message`, `title`, `source`, and `debug`. HTTP requests time out after 30 seconds. Read requests retry selected transient HTTP failures up to twice; mutations are not automatically replayed. An interrupted mutation may already have been accepted by Server.

`request(path, method?, data?, params?, readOnly?, binary?, raw?, signal?)` retains the CLI's low-level transport for operations without typed methods. Its response is intentionally untyped; use the typed methods where available. `openStream(path, signal)` returns a readable byte stream, with parsing and run interpretation left to the caller. Aborting observation does not cancel remote work.
