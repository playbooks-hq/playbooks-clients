import assert from "node:assert/strict";
import test from "node:test";

import { PlaybooksSDK } from "../packages/sdk/dist/index.js";

test("Agent access SDK preserves runtime authentication, revisions, and association independence", async (t) => {
  const requests: {
    url: string;
    method: string;
    headers: Headers;
    body: any;
  }[] = [];
  const state = {
    revision: 8,
    grants: [
      {
        kind: "site" as const,
        resourceId: "site-one",
        role: "editor" as const,
      },
    ],
  };
  t.mock.method(globalThis, "fetch", async (url: URL, options: RequestInit) => {
    requests.push({
      url: String(url),
      method: options.method || "GET",
      headers: new Headers(options.headers),
      body: options.body ? JSON.parse(String(options.body)) : null,
    });
    return Response.json({ data: state });
  });
  const sdk = new PlaybooksSDK({
    baseUrl: "http://localhost:9140",
    apiKey: "runtime-fixture",
  });
  const agents = sdk.workspaces.reference("workspace-one").agents;
  const agent = agents.reference("agent-one");
  const access = await agent.applicationGrants.get();
  assert.equal(access.revision, state.revision);
  assert.deepEqual(access.grants, state.grants);
  await agent.applicationGrants.update(state);
  await agent.applicationGrants.remove("site", "site-one", 8);
  assert.deepEqual(
    requests.map((r) => r.method),
    ["GET", "PUT", "DELETE"],
  );
  assert.equal(
    requests[2].url,
    "http://localhost:9140/agents/agent-one/application-grants/site/site-one",
  );
  assert.deepEqual(requests[1].body, state);
  assert.deepEqual(requests[2].body, { revision: 8 });
  for (const request of requests) {
    assert.equal(request.headers.get("authorization"), "runtime-fixture");
    assert.equal(request.headers.get("workspace"), "workspace-one");
    assert(!request.url.includes("integration"));
    assert(!request.headers.has("x-agent-application"));
  }
});

test("Agent association filtering never implies a grant mutation", async (t) => {
  const calls: { url: string; method: string }[] = [];
  t.mock.method(globalThis, "fetch", async (url: URL, options: RequestInit) => {
    calls.push({ url: String(url), method: options.method || "GET" });
    return Response.json({ data: [], meta: { page: 0, hasMore: false } });
  });
  const sdk = new PlaybooksSDK({
    baseUrl: "http://localhost:9140",
    apiKey: "runtime-fixture",
  });
  await sdk.workspaces
    .reference("workspace-one")
    .agents.list({ association: "project" });
  assert.deepEqual(calls, [
    { url: "http://localhost:9140/agents?association=project", method: "GET" },
  ]);
});
