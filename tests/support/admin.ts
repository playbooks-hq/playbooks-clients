import assert from "node:assert/strict";

import {
  admin,
  api,
  identity,
  safeFailure,
  validateTarget,
} from "./environment.js";

// Only these two administrative operations belong to client test infrastructure.
try {
  await validateTarget();
  const path = process.argv[2];
  const user = identity();
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  const data = JSON.parse(Buffer.concat(chunks).toString());
  const readiness = path === "/admin/inference-models/readiness";
  if (!readiness) {
    assert.equal(path, `/admin/workspaces/${user.workspaceUuid}/credit-grants`);
    assert.equal(data.amount, 100);
    assert.equal(data.idempotencyKey, user.pendingGrant?.idempotencyKey);
    assert.equal(data.reason, "courtesy");
  }
  const response = await api(
    path,
    await admin(),
    readiness ? undefined : user.workspaceUuid,
    readiness ? "GET" : "POST",
    readiness ? undefined : data,
  );
  process.stdout.write(JSON.stringify(response));
} catch (error) {
  console.error(safeFailure(error));
  process.exitCode = 1;
}
