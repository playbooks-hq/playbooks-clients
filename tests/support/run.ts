import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { PlaybooksSDK } from "../../packages/sdk/dist/index.js";
import {
  adminRequest,
  api,
  configuration,
  identity,
  identityFile,
  type Json,
  login,
  read,
  save,
  store,
  validateTarget,
} from "./environment.js";

export function client() {
  const user = identity();
  return new PlaybooksSDK({ apiKey: user.apiKey, baseUrl: user.origin });
}
export function runPath(id: string) {
  assert(/^[a-f0-9-]{36}$/.test(id), "Invalid run ID");
  return resolve(store, id, "manifest.json");
}
export function newRun() {
  const user = read(identityFile);
  const state: Json = {
    id: randomUUID(),
    origin: configuration().origin,
    workspaceUuid: user.workspaceUuid,
    userId: user.userId,
    startedAt: new Date().toISOString(),
    deadline: Date.now() + 30 * 60000,
    scenarios: Object.fromEntries(
      [
        "SDK resource contracts",
        "CLI contracts",
        "MCP contracts",
        "Files across all clients",
        "One bounded Operator run",
      ].map((name) => [name, "not-run"]),
    ),
    cleanup: "pending",
    operatorChecks: Object.fromEntries(
      [
        "submission",
        "run-discovery",
        "scoped-filters",
        "sdk-stream",
        "cli-stream",
        "final-inspection",
      ].map((name) => [name, "not-run"]),
    ),
    untested: [
      "publication",
      "payments",
      "exhaustive routes and authorization",
      "retry fault injection",
    ],
  };
  save(runPath(state.id), state);
  return state;
}
export async function check() {
  await validateTarget();
  const user = identity();
  const sdk = client();
  const session = await sdk.session.get();
  assert.equal(session.toJSON().uuid, user.uuid);
  const discovered = await sdk.workspaces.list();
  assert(
    discovered.data.some((workspace) => workspace.uuid === user.workspaceUuid),
  );
  const workspace = await sdk.workspaces.get(user.workspaceUuid);
  assert.equal(workspace.id, user.workspaceId);
  const budget = await workspace.budget.get();
  const usage = await workspace.usage.get();
  assert(
    Number(usage.toJSON().remainingCredits) -
      Number(budget.toJSON().outstandingCredits) >=
      6,
    "BLOCKED: insufficient funding; run test:setup",
  );
  // Project creation requires at least one supported application type.
  const types = await sdk.types.list();
  assert(types.data.length > 0, "BLOCKED: no Project Types available");
  const readiness = await adminRequest("/inference-models-readiness");
  assert(
    readiness.productionKeyReachable &&
      readiness.operator?.some(
        (item: Json) => item.consumer === "project_operator" && item.ready,
      ),
    "BLOCKED: local Operator routing is not ready",
  );
  return { workspace, types };
}
export async function cleanup(
  state: Json,
  deadline = Date.now() + 5 * 60000,
  resume = false,
) {
  if (!state.projectUuid) {
    if (state.creationDispatched)
      throw Error(
        "BLOCKED: Project creation outcome unresolved; exact ownership must be reconciled.",
      );
    state.cleanup = "complete";
    save(runPath(state.id), state);
    return;
  }
  const user = identity();
  assert.equal(state.origin, user.origin);
  assert.equal(state.workspaceUuid, user.workspaceUuid);
  // A normal test-user session can inspect receipts after developer-key
  // middleware can no longer resolve the deleted Project.
  const observer = await login(user.email, user.password);
  assert.equal(observer.uuid, user.uuid);
  const observerToken = observer.token.rawToken;
  const path = `/workspace/projects/${state.projectUuid}`;
  let receipt = await api(
    `${path}/lifecycle`,
    observerToken,
    user.workspaceUuid,
  );
  if (receipt?.action !== "delete" || (resume && receipt.status === "failed")) {
    const project = await client()
      .workspaces.get(user.workspaceUuid)
      .then((workspace) => workspace.projects.get(state.projectUuid));
    assert.equal(project.id, state.projectId);
    assert.equal(project.workspaceId, user.workspaceId);
    assert.equal(project.projectOwnerId, user.userId);
    state.deletionDispatched = true;
    save(runPath(state.id), state);
    receipt = await project.delete({ confirmation: project.name });
  }
  state.lifecycleReceipt = receipt;
  save(runPath(state.id), state);
  while (receipt.status !== "completed") {
    if (receipt.status === "failed")
      throw Error(
        "BLOCKED: Project lifecycle cleanup failed; inspect its receipt.",
      );
    if (Date.now() >= deadline)
      throw Error("BLOCKED: Project lifecycle cleanup deadline reached.");
    await delay(2000);
    receipt = await api(`${path}/lifecycle`, observerToken, user.workspaceUuid);
    state.lifecycleReceipt = receipt;
    save(runPath(state.id), state);
  }
  assert.equal(receipt.action, "delete");
  assert.equal(receipt.progress?.shutdown, true);
  assert.equal(receipt.progress?.storage, true);
  state.cleanup = "complete";
  save(runPath(state.id), state);
}
export function loadRun(id: string) {
  return read(runPath(id));
}
