import assert from "node:assert/strict";

import type { Json } from "./support/environment.js";
import { cli } from "./support/processes.js";

export async function cliChecks(state: Json, config: string) {
  const scope = [
    "--workspace",
    state.workspaceUuid,
    "--project",
    state.projectUuid,
  ];
  assert.equal((await cli(config, ["--help"])).code, 0);
  assert.equal((await cli(config, ["--version"])).code, 0);
  const get = await cli(config, ["project", ...scope]);
  assert.equal(get.code, 0);
  assert.equal(JSON.parse(get.stdout).data.uuid, state.projectUuid);
  const updated = await cli(
    config,
    ["project", "update", ...scope, "--data", "-"],
    { name: `Clients ${state.id} CLI` },
  );
  assert.equal(updated.code, 0);
  assert.equal(JSON.parse(updated.stdout).data.name, `Clients ${state.id} CLI`);
  const page = await cli(config, [
    "projects",
    "--workspace",
    state.workspaceUuid,
    "--page",
    "0",
    "--page-size",
    "20",
  ]);
  assert.equal(page.code, 0);
  assert.equal(JSON.parse(page.stdout).meta.page, 0);
  const invalid = await cli(
    config,
    ["project", "update", ...scope, "--data", "-"],
    { name: "" },
  );
  assert.notEqual(invalid.code, 0);
  assert(JSON.parse(invalid.stderr || invalid.stdout).error.status >= 400);
  const unconfirmed = await cli(
    config,
    ["project", "delete", ...scope, "--data", "-"],
    { confirmation: `Clients ${state.id} CLI` },
  );
  assert.notEqual(unconfirmed.code, 0);
}
