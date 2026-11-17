import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { PlaybooksSDK, type Workspace } from "../../packages/sdk/dist/index.js";
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
  await checkFunding(workspace);
  const readiness = await adminRequest("/admin/inference-models/readiness");
  assert(
    readiness.productionKeyReachable &&
      readiness.operator?.some(
        (item: Json) => item.consumer === "project_operator" && item.ready,
      ),
    "BLOCKED: local Operator routing is not ready",
  );
  return { workspace };
}
export async function checkFunding(workspace: Workspace, minimum = 6) {
  const budget = await workspace.budget.get();
  const usage = await workspace.usage.get();
  const available =
    Number(usage.toJSON().remainingCredits) -
    Number(budget.toJSON().outstandingCredits);
  assert(Number.isFinite(available), "BLOCKED: funding balance is unavailable");
  assert(available >= minimum, "BLOCKED: insufficient existing test funding");
}
export async function cleanup(state: Json, deadline = Date.now() + 5 * 60000) {
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
  assert.equal(state.userId, user.userId);
  // The direct-deletion receipt survives Project removal and is readable by its requester.
  const observer = await login(user.email, user.password);
  assert.equal(observer.uuid, user.uuid);
  const observerToken = observer.token.rawToken;
  let receipt = state.lifecycleReceipt;
  if (!receipt) {
    if (state.deletionDispatched)
      throw Error(
        "BLOCKED: Project deletion outcome unresolved; reconcile its exact receipt.",
      );
    const project = await client()
      .workspaces.get(user.workspaceUuid)
      .then((workspace) => workspace.projects.get(state.projectUuid));
    assert.equal(project.id, state.projectId);
    assert.equal(project.workspaceId, user.workspaceId);
    assert.equal(project.visibility, "workspace");
    assert.equal(project.access.role, "admin");
    state.deletionDispatched = true;
    save(runPath(state.id), state);
    receipt = await project.delete({ confirmation: project.name });
    state.lifecycleReceipt = receipt;
    save(runPath(state.id), state);
  }
  const operationId = receipt.operationId;
  assert.match(operationId, /^[a-f0-9-]{36}$/);
  function verifyReceipt(current: Json) {
    assert.equal(current.operationId, operationId);
    assert.equal(current.resourceType, "project");
    assert.equal(current.resourceId, state.projectId);
    assert(
      [
        "queued",
        "quarantining",
        "retained",
        "purging",
        "failed",
        "canceled",
        "completed",
      ].includes(current.status),
      "Unexpected Project deletion receipt status",
    );
    if (current.status === "completed") assert.equal(current.error, null);
    assert.equal(
      current.purgeAfter,
      null,
      "Project was scheduled for retention",
    );
  }
  verifyReceipt(receipt);
  while (receipt.status !== "completed") {
    if (receipt.status === "canceled")
      throw Error("BLOCKED: Project lifecycle cleanup was canceled.");
    // The lifecycle worker revisits failed and purging operations.
    if (Date.now() >= deadline)
      throw Error(
        `BLOCKED: Project lifecycle cleanup deadline reached (${receipt.status}).`,
      );
    receipt = await api(
      `/session/project-deletions/${operationId}`,
      observerToken,
    );
    verifyReceipt(receipt);
    state.lifecycleReceipt = receipt;
    save(runPath(state.id), state);
    if (receipt.status !== "completed") await delay(2000);
  }
  // The direct-deletion worker completes only after Project lifecycle purge completes.
  state.cleanup = "complete";
  delete state.cleanupFailure;
  save(runPath(state.id), state);
}
export function loadRun(id: string) {
  return read(runPath(id));
}
