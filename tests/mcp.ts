import assert from "node:assert/strict";

import type { Json } from "./support/environment.js";
import { MCP } from "./support/processes.js";

export async function mcpChecks(state: Json, config: string, mcp: MCP) {
  const tools = (await mcp.request("tools/list")).tools;
  assert(tools.some((tool: Json) => tool.name === "playbooks_project"));
  assert(
    tools.some(
      (tool: Json) => tool.name === "playbooks_project_message_create",
    ),
  );
  const scope = { workspace: state.workspaceUuid, project: state.projectUuid };
  const missingScope = await mcp.call("playbooks_project", {
    project: state.projectUuid,
  });
  assert.equal(missingScope.isError, true);
  const get = await mcp.call("playbooks_project", scope);
  assert(!get.isError);
  assert.equal(get.structuredContent.data.uuid, state.projectUuid);
  const tests = await mcp.call("playbooks_project_tests", scope);
  assert(!tests.isError);
  assert.deepEqual(tests.structuredContent.data.tests, []);
  assert.equal(tests.structuredContent.data.summary.tests, 0);
  assert(!("environments" in tests.structuredContent.data));
  const updated = await mcp.call("playbooks_project_update", {
    ...scope,
    data: { name: `Clients ${state.id} MCP` },
  });
  assert(!updated.isError);
  assert.equal(updated.structuredContent.data.name, `Clients ${state.id} MCP`);
  const invalid = await mcp.call("playbooks_project_update", {
    ...scope,
    data: { name: "" },
  });
  assert.equal(invalid.isError, true);
  assert(invalid.structuredContent.error.status >= 400);
  const refused = await mcp.call("playbooks_project_delete", {
    ...scope,
    data: { confirmation: `Clients ${state.id} MCP` },
  });
  assert.equal(refused.isError, true);
  const filtered = new MCP(config, ["--toolsets", "core", "--read-only"]);
  try {
    await filtered.initialize();
    const selected = (await filtered.request("tools/list")).tools;
    assert(selected.some((tool: Json) => tool.name === "playbooks_project"));
    assert(
      selected.every((tool: Json) => tool.annotations.readOnlyHint === true),
    );
    assert(
      !selected.some(
        (tool: Json) => tool.name === "playbooks_project_message_create",
      ),
    );
    assert(
      !selected.some((tool: Json) => tool.name === "playbooks_project_update"),
    );
  } finally {
    await filtered.close();
  }
}
