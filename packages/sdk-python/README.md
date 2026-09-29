# Playbooks Python SDK

Synchronous and asynchronous backend clients for the Playbooks platform API. Python 3.11+ is required. Server owns permissions, billing, and execution. The package covers the same platform operations as `@playbooks/sdk`; terminal configuration and credential discovery remain CLI responsibilities.

## Install and connect

After publication, install with `pip install playbooks-sdk`. For development, run `pnpm python:setup` from the repository root; this creates an isolated Python environment and installs the package in editable mode with its development tools. No global Python packages are modified.

```python
import os
from playbooks_sdk import PlaybooksSDK

with PlaybooksSDK(api_key=os.environ["PLAYBOOKS_API_KEY"]) as client:
    workspace = client.workspaces.get("WORKSPACE_UUID")
    page = workspace.projects.list(page=0, page_size=20)
    for project in page["data"]:
        print(project.uuid, project.name)
```

```python
import asyncio
import os
from playbooks_sdk import AsyncPlaybooksSDK

async def main():
    async with AsyncPlaybooksSDK(api_key=os.environ["PLAYBOOKS_API_KEY"]) as client:
        workspace = await client.workspaces.get("WORKSPACE_UUID")
        project = await workspace.projects.get("PROJECT_UUID")
        await project.update({"name": "Customer Portal"})
        print(project.to_dict())

asyncio.run(main())
```

The application reads the environment in these examples. The SDK never reads API keys, saved CLI credentials, or an active Workspace from local configuration. Pass an optional `base_url` to select another endpoint; remote endpoints require HTTPS. Public discovery does not send private credentials. Each Workspace resource retains its own scope, including concurrent asynchronous calls.

Use context managers to close connections. Explicit `client.close()` and `await client.aclose()` are also available. Resources depend on their originating client's lifetime.

## Resources and inputs

Both clients have matching resource methods. Async I/O methods must be awaited; resource properties and `domains.records(id)` are immediate. Streams have their own context managers.

| Owner | Resources and operations |
| --- | --- |
| Client | `session.get()`, `workspaces.list/get/update()`, public `templates.list/get()`, `categories`, `collections`, `creators`, `types` |
| Workspace | `projects`, `folders`, `templates`, `members`, `invitations`, `settings`, `designs`, `skills`, `mcps`, `connectors`, `secrets`, `files`, `domains` |
| Workspace observations | `inbox`, `activity`, `usage`, `budget`, `credits`, `invoices`, `settlements`, `transfers` |
| Project | `update`, `move`, `archive`, `restore`, `delete`, `lifecycle`, `ownership`, `collaborators`, `agents`, `settings`, `resources`, `designs`, `skills`, `mcps`, `connectors` |
| Project development | `files`, `source`, `branches`, `checkpoints`, `workflows`, `sandbox`, `logs` |
| Publication | `publication.get()`, `preflight()`, `publish()`, `releases.list/get/rollback/wait()` |
| Operators | `conversations`, `runs`; verified conversations expose messages, with a selected branch for Project messages |

Methods and keyword arguments use Python names: `preview_departure`, `page_size`, `expected_revision`, `timeout_ms`, and `on_activity`. `source.import_()` uses a trailing underscore because `import` is a Python keyword. Payload dictionaries, response attributes, snapshots, and page metadata retain Server field names such as `expectedRevision`, `folderId`, and `hasMore`. Arbitrary nested data is never renamed.

`get()` returns a resource directly. Successful resource `update(data)` refreshes that same object and returns it. Failed updates preserve the previous snapshot. Resource fields are read-only; use `to_dict()` for an independent snapshot, including extra Server fields and excluding transport internals and credentials. Use `json.dumps(resource.to_dict())` for JSON serialization. Collection updates do not require fetching the resource first.

Lists return dictionaries with `data` and optional `meta`; other Server envelope fields are retained. Pages start at zero. Resource lists normally default to 20 records with Server-supported sizes of 1–100. Follow `meta["hasMore"]`; cursor lists use `meta["nextCursor"]` unchanged. The SDK does not automatically fetch additional pages.

## Workspace Inbox

```python
page = workspace.inbox.list(view="attention", page=0, page_size=20)
counts = workspace.inbox.count()
workspace.inbox.mark_read("CONVERSATION_UUID", {"throughMessageId": 456, "branchId": 123})
# Explicitly mark every accessible conversation read, regardless of list filters.
workspace.inbox.mark_all_read()
```

Await these methods when using the async client. Inbox supports `view` (`attention`, `mentions`, `all`), `scope` (`all`, `workspace`, `project:<uuid>`, `folder:<uuid>`), request `type`, `search`, and `conversation` filters. The default view is `attention`; reports use all activity. A conversation UUID bypasses other filters. Page metadata retains counts and available scopes; `count()` returns Workspace-wide totals for the current user.

Supply the actual loaded `throughMessageId` and matching `branchId` for Project conversations; omit the branch for unbranched conversations. Marking read acknowledges receipts, without approving requests or executing work. Server checks access and message/branch ownership.

## Operator messages and streams

```python
conversation = project.conversations.resolve()
branch = conversation.branches.get(123)  # Actual verified conversation branch ID.
message = branch.messages.create({
    "text": "Review the application and suggest improvements.",
    "mode": "plan",
    "idempotencyKey": "stable-key-for-this-submission",
})
# Inspect the submission and discover its actual run ID before observing it.
with project.runs.stream(789, timeout=90) as events:
    for event in events:
        print(event["event"], event["data"])
```

```python
async with project.runs.stream(789, timeout=90) as events:
    async for event in events:
        print(event["event"], event["data"])
```

These are sync and async alternatives; use resources from the matching client. Supply actual returned IDs. `resolve()` may initialize a conversation and is not automatically retried. Project messages are Sandbox-scoped and require a selected branch. Workspace conversations expose `conversation.messages` directly.

Streams yield parsed Server events, including waiting, failure, cancellation, and completion. A closed stream does not establish successful execution. Leaving the stream context or canceling an async task closes observation without canceling accepted remote work. `timeout` is the HTTP stream inactivity timeout in seconds; `None` disables it. The optional synchronous `on_activity` callback runs when a connection opens or bytes arrive.

## Files and publication

```python
project.files.upload(
    name="reference/overview.txt",
    content=b"Project background",
    expected_revision=None,
)
content = project.files.download("FILE_ID")
archive = project.source.export()
```

Files use bytes; local filesystem access belongs to the caller. Agent Files have a 20 MB limit and safe relative names; replacement requires the expected revision. `source.import_(name="source.zip", content=archive)` replaces project source and is consequential.

```python
preflight = project.preflight()
# Review blockers, warnings, the revision, and cost impact before publishing.
release = project.publish({"expectedRevision": "REVIEWED_REVISION"})
completed = project.releases.wait(release["uuid"], timeout_ms=300_000)
```

Publication requires configured Production and may incur charges. `wait()` observes the existing release without replaying publication. It returns on success and raises on unsuccessful completion or timeout. Rollback requires `currentReleaseId`. Other consequential operations retain required confirmation, revision, recipient, and idempotency inputs. The SDK does not prompt or grant authority.

## Errors and lower-level requests

Catch `PlaybooksError` and inspect `status`, `message`, `source`, `debug`, and `title`. Do not log secrets or unreviewed error details. Read operations retry selected transient HTTP responses at most twice; writes and GET operations with side effects are not automatically retried. A transport failure during a mutation means the Server may already have accepted it.

`client.request(path, workspace=uuid, method="GET", params={...})` provides lower-level access. It returns the API envelope; `binary=True` returns bytes and `raw=True` wraps the unmodified response body in `data`. Raw `params` retain Server field names. Named resources provide the supported interface.

## Development and release

Run `pnpm lint` and `pnpm typecheck` from the root after `pnpm python:setup`. They include Ruff and strict mypy checks. Python shares the repository version. Explicit `pnpm release:prepare` creates a wheel and source distribution alongside npm artifacts and records their integrity; it publishes nothing. The existing isolated package compatibility verifier covers npm packages, not Python runtime acceptance. Live platform behavior requires separately authorized verification. Check PyPI name/version availability and publishing access before any publication.
