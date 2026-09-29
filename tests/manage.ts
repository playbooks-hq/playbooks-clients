import { lease, safeFailure } from "./support/environment.js";
import { check, cleanup, loadRun } from "./support/run.js";
import { setup } from "./support/setup.js";

try {
  const [action, ...args] = process.argv.slice(2).filter((arg) => arg !== "--");
  if (action === "setup") await setup();
  else if (action === "check") {
    await check();
    console.log(
      "Local identity, Workspace, funding and discovery checks passed.",
    );
  } else if (action === "cleanup" && args[0] === "--run" && args[1]) {
    const state = loadRun(args[1]);
    const release = lease(state.id);
    await cleanup(state, Date.now() + 5 * 60000, true);
    release();
    console.log(`Cleanup completed: ${state.id}`);
  } else throw Error("BLOCKED: use setup, check, or cleanup --run <id>");
} catch (error) {
  console.error(safeFailure(error));
  process.exitCode = 1;
}
