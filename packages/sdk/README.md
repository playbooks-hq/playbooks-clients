# Playbooks SDK

Use `@playbooks/sdk` from a Node.js backend or automation script to work with Playbooks resources. The SDK covers the platform operations exposed by the CLI: discovery, Workspaces, Projects, configuration, Operators, files, source, publication, and administration. Server remains authoritative for permissions, billing, and execution.

Requires Node.js 22.12 or newer. ESM, CommonJS, and TypeScript declarations are included. The [Python SDK](../sdk-python/README.md) is a separate package in this repository. Browser managed-service clients are not included.

## Install and connect

For published releases:

```sh
npm install @playbooks/sdk
```

```ts
import { PlaybooksSDK } from '@playbooks/sdk';

const client = new PlaybooksSDK({
  apiKey: process.env.PLAYBOOKS_API_KEY,
});

const user = await client.session.get();
const { data: workspaces } = await client.workspaces.list();
const workspace = await client.workspaces.get('WORKSPACE_UUID');
```

Public discovery methods do not send credentials, even when the client has an API key. Supply a developer API key explicitly for private resources. The SDK never reads environment variables, saved CLI credentials, or an active Workspace; the example reads the environment in your application. Keep platform credentials on your backend. Application keys do not replace developer credentials.

An optional `baseUrl` selects another API endpoint; the default is `https://api.playbooks.ai`. Remote endpoints require HTTPS. Each Workspace object retains its own scope, so concurrent operations against different Workspaces do not change shared client state.

## Read and update resources

```ts
await workspace.update({ name: 'Acme Operations' });
console.log(workspace.name);

const project = await workspace.projects.create({
  name: 'Customer Portal',
  description: 'Customer support and account management',
});

await project.update({ name: 'Acme Customer Portal' });

// Collection updates do not require fetching the resource first.
await client.workspaces.update('WORKSPACE_UUID', { name: 'Acme' });
await workspace.projects.update('PROJECT_UUID', { name: 'Portal' });

const snapshot = project.toJSON();
```

`get()` returns a resource directly. `update()` sends an immediate request, refreshes the same object's fields from the response, and returns that object. Failed updates leave its snapshot unchanged. Fields are read-only; assigning a property is not a persistence operation. There is no `save()` or dirty tracking.

`toJSON()` and `JSON.stringify(resource)` serialize API data only, including extra Server fields, and exclude client credentials and transport internals. Mutating a returned snapshot does not change the resource. Returned operation receipts remain receipts: accepting work does not mean execution has finished.

## Lists and pagination

```ts
const { data: projects, meta } = await workspace.projects.list({
  query: 'portal',
  page: 0,
  pageSize: 20,
  sortProp: 'name',
  sortValue: 'asc',
});

for (const project of projects) console.log(project.uuid, project.name);
```

SDK pages start at **0**, matching the Server, CLI, and MCP. Resource lists default to 20 records and accept page sizes from 1–100. No pages are fetched automatically. Follow `meta.hasMore`; numbered pages return `meta.pagination: "page"`. Messages, logs, and dedicated search use `cursor`/`pageSize` and return `meta.pagination: "cursor"`; pass `meta.nextCursor` unchanged. Additional Server metadata is preserved.

## Resource families

Only operations already supported by CLI are exposed; not every resource has every CRUD operation.

| Owner | Resources and operations |
| --- | --- |
| `client` | `session.get()`, `workspaces.list/get/update()`, public `templates.list/get()`, `categories`, `collections`, `creators`, `types` |
| `workspace` | `projects`, `folders`, `templates`, `members`, `invitations`, `settings`, `designs`, `skills`, `mcps`, `connectors`, `secrets`, `files`, `domains` |
| Workspace observations | `inbox`, `activity`, `usage`, `budget`, `credits`, `invoices`, `settlements`, `transfers` |
| `project` | `update`, `move`, `archive`, `restore`, `delete`, `lifecycle`, `ownership`, `collaborators`, `agents`, `settings`, `resources`, `designs`, `skills`, `mcps`, `connectors` |
| Project development | `files`, `source`, `branches`, `checkpoints`, `workflows`, `sandbox`, `logs` |
| Project publication | `publication.get()`, `preflight()`, `publish()`, `releases.list/get/rollback/wait()` |
| Workspace/Project Operators | `conversations`, `runs`; verified conversations provide messages, with Project messages scoped to a selected branch |

Examples of named actions:

```ts
const folder = await workspace.folders.create({ name: 'Client work' });
await workspace.folders.update('FOLDER_UUID', { name: 'Active clients' });

const preview = await workspace.members.previewDeparture('MEMBER_ID');
// After reviewing preview, supply its revision and the selected recipient.
await workspace.members.depart('MEMBER_ID', {
  revision: 'REVIEWED_REVISION',
  toUserId: 123,
});

const records = await workspace.domains.records('DOMAIN_UUID').list();
const source = await project.source.status();
const workflows = await project.workflows.list();
```

Consequential methods are explicit programmatic actions: the SDK does not prompt. Preserve the required revisions, recipients, confirmation values, and idempotency keys when calling them. Server validates authority and current state. SDK resource access never grants additional permissions.

## Workspace Inbox

```ts
const inbox = await workspace.inbox.list({ view: 'attention', page: 0, pageSize: 20 });
const counts = await workspace.inbox.count();
await workspace.inbox.markRead('CONVERSATION_UUID', { throughMessageId: 456, branchId: 123 });
// Explicitly mark every accessible conversation read, regardless of list filters.
await workspace.inbox.markAllRead();
```

Inbox supports `view` (`attention`, `mentions`, `all`), `scope` (`all`, `workspace`, `project:<uuid>`, `folder:<uuid>`), request `type`, `search`, and `conversation` filters. The default view is `attention`; `type: 'report'` uses all activity. A conversation UUID selects that conversation directly, bypassing other filters. Page metadata preserves Server counts and available scopes. `count()` returns Workspace-wide totals for the current user.

Reading is an explicit mutation: supply the actual loaded `throughMessageId` and the matching `branchId` for Project conversations. Omit the branch for unbranched conversations. Marking read acknowledges receipts; it does not approve requests or execute work. Server enforces conversation access and message/branch ownership.

## Operator messages and streams

```ts
const conversation = await project.conversations.resolve();
const branch = await conversation.branches.get(123); // Verified conversation branch ID.
const message = await branch.messages.create({
  text: 'Review the application and suggest improvements.',
  mode: 'plan',
  idempotencyKey: 'stable-key-for-this-submission',
});

const runs = await project.runs.list({ messageId: 456 });
const controller = new AbortController();
for await (const event of project.runs.stream(789, { signal: controller.signal })) {
  console.log(event.event, event.data);
}
```

Use the actual returned message and run identifiers. Submitting a message can produce clarification, queued work, or a run; inspect the response before following a run. `conversations.resolve()` can initialize default conversation state and is not automatically retried. `conversations.get(id)` selects a specific conversation and verifies its ownership. Project messages use the Sandbox environment. Workspace conversations expose `conversation.messages` directly.

Streams yield parsed Server events; consumers must distinguish `waiting`, failure, cancellation, and authoritative completion. Ending observation or aborting a stream does not cancel accepted remote work. The SDK performs no terminal rendering.

## Files and source

```ts
await project.files.upload({
  name: 'reference/overview.txt',
  content: new Blob(['Project background'], { type: 'text/plain' }),
  expectedRevision: null,
});

const bytes = await project.files.download('FILE_ID');
const archive = await project.source.export();
```

Uploads accept `Blob` or `Uint8Array`, a relative name, and an expected revision when replacing an Agent File. Workspace files expose the same methods. Downloads return bytes; reading and writing local paths is the caller's responsibility. Agent Files are private reference context, separate from project source. `project.source.import({ content, name })` replaces source using a supplied archive and is a consequential action.

## Publication

```ts
const preflight = await project.preflight();
// Review blockers, warnings, source revision, and cost impact first.
const release = await project.publish({
  expectedRevision: 'REVIEWED_PREFLIGHT_REVISION',
});

const completed = await project.releases.wait('RELEASE_UUID', {
  timeoutMs: 300_000,
});
```

Supply the actual reviewed revision and returned release UUID. Publishing requires configured Production and can incur usage charges. `wait()` observes a release, returns on success, and reports timeout or unsuccessful completion; it does not replay publication. Rollback requires the current release identifier.

## Errors and lower-level access

```ts
import { PlaybooksError } from '@playbooks/sdk';

try {
  await workspace.projects.get('PROJECT_UUID');
} catch (error) {
  if (error instanceof PlaybooksError) {
    console.error(error.status, error.title, error.message);
  } else {
    throw error;
  }
}
```

Errors preserve `status`, `title`, `message`, `source`, and `debug`. HTTP requests have a 30-second timeout; eligible read requests retry selected transient HTTP failures up to twice. Mutations, conversation initialization, and source disconnection are not automatically replayed. A disconnected mutation may already have been accepted: inspect state before retrying. Preserve an operation's idempotency key when retrying that same intent.

`client.request(path, { workspace, method, data, params, readOnly, binary, raw, signal })` is an untyped escape hatch for direct API access. It returns the native response envelope and native pagination, without resource wrapping. All current CLI platform commands use named methods instead.

## Development

From the repository root, use `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`. For local consumption, use the tarballs produced by `pnpm release:prepare 1.0.0`; they are validated outside workspace links. See the [workspace README](../../README.md) for coordinated releases and publication boundaries.
