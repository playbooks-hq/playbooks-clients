import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import {
  adminRequest,
  api,
  configuration,
  identityFile,
  lease,
  login,
  read,
  save,
  serverEnvironment,
  validateTarget,
} from "./environment.js";

export async function setup() {
  await validateTarget();
  const release = lease("setup");
  try {
    const config = configuration();
    const env = serverEnvironment();
    let state = existsSync(identityFile) ? read(identityFile) : null;
    if (!state) {
      const uuid = randomUUID();
      state = {
        origin: config.origin,
        uuid,
        email: `bot+pbtest-clients-${uuid}@playbooks.ai`,
        password: randomBytes(32).toString("base64url"),
        workspaceUuid: randomUUID(),
      };
      save(identityFile, state);
    }
    assert.equal(state.origin, config.origin);
    assert(/^bot\+pbtest-clients-[a-f0-9-]+@playbooks\.ai$/.test(state.email));
    const { Client } = createRequire(
      resolve(config.serverRoot, "package.json"),
    )("pg");
    const db = new Client({
      host: "127.0.0.1",
      port: 5432,
      database: env.APP_DB_NAME,
      user: env.APP_DB_USER,
      password: env.APP_DB_PASS,
      connectionTimeoutMillis: 5000,
    });
    await db.connect();
    try {
      let observed = await db.query(
        "SELECT uuid, email, role FROM users WHERE uuid = $1",
        [state.uuid],
      );
      if (!observed.rowCount) {
        if (state.registrationDispatched)
          throw Error(
            "BLOCKED: registration outcome is unresolved; do not create a replacement.",
          );
        state.registrationDispatched = true;
        save(identityFile, state);
        await api("/auth/register", undefined, undefined, "POST", {
          uuid: state.uuid,
          email: state.email,
          password: state.password,
          name: "Playbooks Clients Test",
        });
        observed = await db.query(
          "SELECT uuid, email, role FROM users WHERE uuid = $1",
          [state.uuid],
        );
      }
      assert.equal(observed.rowCount, 1);
      assert.equal(observed.rows[0].email, state.email);
      assert.equal(observed.rows[0].role, "basic");
      // Same exact-account local verification fixture as Auto; never alters roles or funding.
      const activated = await db.query(
        "UPDATE users SET status = 'active', activated_at = COALESCE(activated_at, NOW()) WHERE uuid = $1 AND email = $2 AND role = 'basic' AND archived = false AND status IN ('pending', 'active') RETURNING id",
        [state.uuid, state.email],
      );
      assert.equal(activated.rowCount, 1);
      state.userId = activated.rows[0].id;
      save(identityFile, state);
    } finally {
      await db.end();
    }
    const user = await login(state.email, state.password);
    assert.equal(user.uuid, state.uuid);
    const token = user.token.rawToken;
    const workspaces = await api("/session/workspaces", token);
    let workspace = workspaces.find(
      (item: any) => item.uuid === state.workspaceUuid,
    );
    if (!workspace) {
      if (state.workspaceId || state.workspaceDispatched)
        throw Error("BLOCKED: recorded Workspace is missing; reconcile setup.");
      state.workspaceDispatched = true;
      save(identityFile, state);
      workspace = await api("/session/workspaces", token, undefined, "POST", {
        uuid: state.workspaceUuid,
        name: "Clients",
        visibility: "private",
      });
    }
    assert.equal(workspace.uuid, state.workspaceUuid);
    const full = await api("/workspace", token, state.workspaceUuid);
    assert.equal(full.ownerUserId, state.userId);
    state.workspaceId = full.id;
    save(identityFile, state);
    if (!state.apiKey) {
      if (state.keyDispatched)
        throw Error(
          "BLOCKED: key creation outcome unresolved; revoke its recorded key before issuing another.",
        );
      state.keyDispatched = true;
      save(identityFile, state);
      const key = await api("/session/tokens", token, undefined, "POST", {
        name: `Clients integration ${state.uuid}`,
        expiration: null,
        apiPolicy: {
          version: 1,
          workspaceMode: "selected",
          workspaceIds: [state.workspaceId],
          projectMode: "all",
          projectIds: [],
          permissions: [
            "workspaces.read",
            "projects.read",
            "projects.create",
            "projects.settings",
            "projects.delete",
            "agents.read",
            "agents.resources",
            "agents.project.run",
            "usage.read",
            "usage.budgets.read",
            "billing.read",
          ],
        },
      });
      assert(key.rawToken && key.id);
      state.apiKey = key.rawToken;
      state.keyId = key.id;
      save(identityFile, state);
    }
    await fund();
    console.log(
      "Dedicated Clients identity, Workspace, and scoped developer key are ready.",
    );
  } finally {
    release();
  }
}
export async function fund() {
  const state = read(identityFile);
  const budget = await api(
    "/workspace/budget",
    state.apiKey,
    state.workspaceUuid,
  );
  const usage = await api(
    "/workspace/usage",
    state.apiKey,
    state.workspaceUuid,
  );
  const available =
    Number(usage.remainingCredits) - Number(budget.outstandingCredits);
  assert(Number.isFinite(available), "Funding balance is unavailable");
  if (available >= 6 && !state.pendingGrant) return;
  state.pendingGrant ??= {
    amount: 100,
    reason: "courtesy",
    explanation: "Local Clients integration funding",
    internalNote: `Clients Workspace ${state.workspaceUuid}`,
    idempotencyKey: `clients-funding:${randomUUID()}`,
  };
  save(identityFile, state);
  const receipt = await adminRequest(
    `/admin/workspaces/${state.workspaceUuid}/credit-grants`,
    state.pendingGrant,
  );
  assert.equal(receipt.grants?.[0]?.amount, 100);
  state.grants = [
    ...(state.grants || []),
    {
      id: receipt.grants[0].id,
      idempotencyKey: state.pendingGrant.idempotencyKey,
    },
  ];
  delete state.pendingGrant;
  save(identityFile, state);
  const refreshed = await api(
    "/workspace/budget",
    state.apiKey,
    state.workspaceUuid,
  );
  const refreshedUsage = await api(
    "/workspace/usage",
    state.apiKey,
    state.workspaceUuid,
  );
  assert(
    Number(refreshedUsage.remainingCredits) -
      Number(refreshed.outstandingCredits) >=
      6,
    "BLOCKED: grant balance is not yet available",
  );
}
