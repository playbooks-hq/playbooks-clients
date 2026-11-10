import assert from "node:assert/strict";
import test from "node:test";

import { PlaybooksSDK } from "../packages/sdk/dist/index.js";

test("resource sharing scopes requests without Workspace metadata lookup", async (t) => {
  const requests: {
    url: string;
    method: string;
    workspace: string | null;
    body: unknown;
  }[] = [];
  t.mock.method(globalThis, "fetch", async (url: URL, options: RequestInit) => {
    requests.push({
      url: String(url),
      method: options.method || "GET",
      workspace: new Headers(options.headers).get("workspace"),
      body: options.body ? JSON.parse(String(options.body)) : null,
    });
    return Response.json({ data: { items: [], nextCursor: null } });
  });
  const sdk = new PlaybooksSDK({
    baseUrl: "http://localhost:9140",
    apiKey: "test-key",
  });
  await sdk.session.sharedResources({
    type: "projects",
    limit: 10,
    cursor: "next",
  });
  const chat = sdk.resourceSharing("external-workspace", "chats", "chat-one");
  await chat.members();
  await chat.grant("user-uuid", "editor");
  await chat.setVisibility({ visibility: "private", revision: 4 });
  await chat.invitations.create({
    email: "person@example.com",
    role: "viewer",
  });
  const project = sdk.resourceSharing(
    "external-workspace",
    "projects",
    "project-one",
  );
  await project.grant("42", "admin");
  await project.updateGrant(12, "viewer");
  await project.revoke(12);
  assert.deepEqual(
    requests.map((r) => [r.method, new URL(r.url).pathname]),
    [
      ["GET", "/session/shared-resources"],
      ["GET", "/chats/chat-one/members"],
      ["PUT", "/chats/chat-one/members/user-uuid"],
      ["PATCH", "/chats/chat-one/visibility"],
      ["POST", "/chats/chat-one/access-invitations"],
      ["POST", "/projects/project-one/collaborators"],
      ["PUT", "/projects/project-one/collaborators/12"],
      ["DELETE", "/projects/project-one/collaborators/12"],
    ],
  );
  assert.deepEqual(Object.fromEntries(new URL(requests[0].url).searchParams), {
    type: "projects",
    limit: "10",
    cursor: "next",
  });
  assert.equal(requests[0].workspace, null);
  assert(requests.slice(1).every((r) => r.workspace === "external-workspace"));
  assert.deepEqual(requests[3].body, { visibility: "private", revision: 4 });
  assert.deepEqual(requests[5].body, { userId: 42, role: "admin" });
  assert.throws(
    () => project.grant("not-a-number", "viewer"),
    /numeric User ID/,
  );
});
