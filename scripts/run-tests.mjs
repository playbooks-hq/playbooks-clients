import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";

// Node reads additional CA certificates at process startup, before dotenv loading.
const settings = parseEnv(
  readFileSync(new URL("../.env.test", import.meta.url), "utf8"),
);
const [action, ...args] = process.argv.slice(2).filter((arg) => arg !== "--");
const environment = { PATH: process.env.PATH, ...settings };
if (action !== "admin") {
  delete environment.CLIENTS_TEST_ADMIN_EMAIL;
  delete environment.CLIENTS_TEST_ADMIN_PASSWORD;
}
const child = spawn(
  process.execPath,
  action === "run"
    ? ["--test", "--test-concurrency=1", ".test-dist/journey.test.js"]
    : action === "admin"
      ? [".test-dist/support/admin.js", ...args]
      : [".test-dist/manage.js", action, ...args],
  { stdio: "inherit", env: environment },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("error", () => {
  console.error("Test process could not start.");
  process.exitCode = 1;
});
child.on("close", (code) => {
  process.exitCode = code ?? 1;
});
