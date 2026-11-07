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

test("Agent Site references and static Site source actions preserve the Agent source tuple", async (t) => {
  const requests: {
    url: string;
    method: string;
    headers: Headers;
    body: any;
  }[] = [];
  const source = {
    type: "agent" as const,
    id: "agent-one",
    componentKey: null,
  };
  const site = {
    id: "site-one",
    uuid: "site-one",
    workspaceUuid: "workspace-one",
    name: "Agent publication",
    kind: "static",
    status: "active",
    url: null,
    primaryHostname: null,
    defaultHostname: "site-one.test",
    defaultUrl: "https://site-one.test",
    createdAt: null,
    updatedAt: null,
    source,
    currentRelease: null,
    latestRelease: null,
    health: { observedState: null, error: null },
    access: { role: "admin" },
    capabilities: { canView: true, canManage: true, canRelease: true },
    config: {},
  };
  const release = {
    uuid: "release-one",
    status: "pending",
    sourceType: "agent",
    sourceUuid: "agent-one",
    sourceRevision: "agent-revision-one",
    componentKey: "landing",
  };
  t.mock.method(globalThis, "fetch", async (url: URL, options: RequestInit) => {
    requests.push({
      url: String(url),
      method: options.method || "GET",
      headers: new Headers(options.headers),
      body: options.body ? JSON.parse(String(options.body)) : null,
    });
    const path = new URL(String(url)).pathname;
    if (path === "/workspace")
      return Response.json({
        data: { id: 7, uuid: "workspace-one", name: "Test Workspace" },
      });
    if (path === "/sites" && options.method === "POST")
      return Response.json({ data: site });
    if (path === "/sites/site-one/source" && options.method === "PUT")
      return Response.json({ data: site });
    if (path === "/sites/site-one/releases" && options.method === "POST")
      return Response.json({ data: release });
    if (path === "/agents/agent-one/sites")
      return Response.json({ data: [site], meta: { page: 0, hasMore: false } });
    throw Error(
      `Unexpected Agent Site SDK request: ${options.method || "GET"} ${path}`,
    );
  });

  const sdk = new PlaybooksSDK({
    baseUrl: "http://localhost:9140",
    apiKey: "runtime-fixture",
  });
  const workspace = await sdk.workspaces.get("workspace-one");
  const created = await workspace.sites.create({
    name: "Agent publication",
    kind: "static",
    source,
  });
  await created.sourceConnection.connect(source, null);
  const sites = await sdk.workspaces
    .reference("workspace-one")
    .agents.reference("agent-one")
    .sites.list();
  assert.equal(sites.data[0].uuid, "site-one");
  assert.deepEqual(sites.data[0].source, source);
  const released = await created.releases.create({
    expectedSource: source,
    sourceRevision: "agent-revision-one",
    componentKey: "landing",
    expectedCurrentReleaseId: null,
    expectedConfigRevision: "site-config-one",
    requestId: "publish-request-one",
  });
  assert.equal(released.sourceType, "agent");

  const create = requests.find(
    (request) => request.url.endsWith("/sites") && request.method === "POST",
  );
  const connect = requests.find((request) =>
    request.url.endsWith("/sites/site-one/source"),
  );
  const publish = requests.find((request) =>
    request.url.endsWith("/sites/site-one/releases"),
  );
  assert.deepEqual(create?.body.source, source);
  assert.deepEqual(connect?.body, { source, expectedSource: null });
  assert.deepEqual(publish?.body, {
    expectedSource: source,
    sourceRevision: "agent-revision-one",
    componentKey: "landing",
    expectedCurrentReleaseId: null,
    expectedConfigRevision: "site-config-one",
    requestId: "publish-request-one",
  });
  for (const request of requests) {
    assert.equal(request.headers.get("authorization"), "runtime-fixture");
    assert.equal(request.headers.get("workspace"), "workspace-one");
  }
});

test("Agent Utility keeps conversation scope and pagination without invoking work", async (t) => {
  const requests: { url: URL; method: string; headers: Headers }[] = [];
  t.mock.method(globalThis, "fetch", async (url: URL, options: RequestInit) => {
    const parsed = new URL(String(url));
    requests.push({
      url: parsed,
      method: options.method || "GET",
      headers: new Headers(options.headers),
    });
    return Response.json(
      parsed.searchParams.has("kind")
        ? {
            data: [
              {
                id: "file-one",
                label: "Brief.md",
                activityAt: "2026-11-07T12:00:00Z",
              },
            ],
            meta: { page: 1, pageSize: 3, total: 4 },
          }
        : { data: { plan: false, outputs: [], sourceItems: [] } },
    );
  });
  const sdk = new PlaybooksSDK({
    baseUrl: "http://localhost:9140",
    apiKey: "runtime-fixture",
  });
  const agent = sdk.workspaces
    .reference("workspace-one")
    .agents.reference("agent-one");
  const summary = await agent.conversations.utility("conversation-one");
  assert.deepEqual(summary.outputs, []);
  const list = await agent.conversations.utilityItems("conversation-one", {
    kind: "files",
    page: 1,
    pageSize: 3,
    search: "Brief",
  });
  assert.equal(list.data[0].label, "Brief.md");
  assert.ok(list.meta);
  assert.equal(list.meta.page, 1);
  for (const request of requests) {
    assert.equal(
      request.url.pathname,
      "/agents/agent-one/conversations/conversation-one/utility",
    );
    assert.equal(request.method, "GET");
    assert.equal(request.headers.get("workspace"), "workspace-one");
    assert.equal(request.headers.get("authorization"), "runtime-fixture");
  }
  assert.equal(requests[1].url.searchParams.get("kind"), "files");
  assert.equal(requests[1].url.searchParams.get("page"), "1");
  assert.equal(requests[1].url.searchParams.get("search"), "Brief");
});
