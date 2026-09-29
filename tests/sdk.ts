import assert from "node:assert/strict";

import type { Project, Workspace } from "../packages/sdk/dist/index.js";
import { PlaybooksError } from "../packages/sdk/dist/index.js";
import { identity } from "./support/environment.js";

export async function sdkChecks(workspace: Workspace, project: Project) {
  const snapshot = project.toJSON();
  assert.equal(await project.update({ name: `${project.name} SDK` }), project);
  assert.notEqual(project.name, snapshot.name);
  assert.equal(Reflect.set(project, "name", "local"), false);
  assert.notEqual(project.name, "local");
  const current = project.toJSON();
  await assert.rejects(
    project.update({ name: "" }),
    (error: unknown) =>
      error instanceof PlaybooksError &&
      error.status >= 400 &&
      error.status < 500,
  );
  assert.deepEqual(project.toJSON(), current);
  const serialized = JSON.stringify(project);
  assert.deepEqual(JSON.parse(serialized), project.toJSON());
  assert(!serialized.includes(identity().apiKey));
  const copy = project.toJSON();
  copy.name = "detached";
  assert.notEqual(project.name, copy.name);
  const page = await workspace.projects.list({ page: 0, pageSize: 20 });
  assert.equal(page.meta?.pagination, "page");
  assert.equal(
    page.meta && "page" in page.meta ? page.meta.page : undefined,
    0,
  );
  assert(page.data.some((item) => item.uuid === project.uuid));
  assert.equal((await workspace.projects.get(project.uuid)).name, project.name);
}
