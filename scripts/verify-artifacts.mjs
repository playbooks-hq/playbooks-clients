import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { createInterface } from "node:readline";

const [directory, version] = process.argv.slice(2);
if (!directory || !version)
  throw new Error("Expected artifact directory and version.");
const temporary = mkdtempSync(
  path.join(tmpdir(), "playbooks-clients-release-"),
);
try {
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      ...["sdk", "cli", "mcp"].map((name) =>
        path.resolve(directory, `playbooks-${name}-${version}.tgz`),
      ),
    ],
    { cwd: temporary, stdio: "inherit" },
  );
  for (const name of ["sdk", "cli", "mcp"]) {
    assert(
      realpathSync(
        path.join(temporary, "node_modules/@playbooks", name),
      ).startsWith(realpathSync(temporary) + path.sep),
      "Package must not resolve through a workspace link.",
    );
  }
  const cli = path.join(
    temporary,
    "node_modules/@playbooks/cli/dist/index.cjs",
  );
  const mcp = path.join(
    temporary,
    "node_modules/@playbooks/mcp/dist/index.cjs",
  );
  assert(
    execFileSync(process.execPath, [cli, "--version"], {
      encoding: "utf8",
    }).includes(version),
  );
  assert(
    execFileSync(process.execPath, [cli, "--help"], {
      encoding: "utf8",
    }).includes("--json"),
  );
  for (const esm of [false, true]) {
    const code = `${esm ? "import { PlaybooksClient, PlaybooksError } from '@playbooks/sdk';" : "const { PlaybooksClient, PlaybooksError } = require('@playbooks/sdk');"}
   if (typeof new PlaybooksClient().projects.list !== 'function' || !(new PlaybooksError(400, 'invalid') instanceof Error)) process.exit(1);`;
    execFileSync(
      process.execPath,
      [...(esm ? ["--input-type=module"] : []), "-e", code],
      { cwd: temporary, stdio: "inherit" },
    );
  }
  const requireSdk = createRequire(
    new URL("../packages/sdk/package.json", import.meta.url),
  );
  const compiler = requireSdk.resolve("typescript/bin/tsc");
  for (const extension of ["mts", "cts"]) {
    const file = path.join(temporary, `consumer.${extension}`);
    writeFileSync(
      file,
      "import { PlaybooksClient, type ApiResponse, type Project } from '@playbooks/sdk';\nconst response: Promise<ApiResponse<Project[]>> = new PlaybooksClient({ token: 'explicit', workspace: 'selected' }).projects.list({ page: 1 });\nvoid response;\n",
    );
    execFileSync(
      process.execPath,
      [
        compiler,
        "--noEmit",
        "--strict",
        "--module",
        "NodeNext",
        "--moduleResolution",
        "NodeNext",
        "--target",
        "ES2022",
        file,
      ],
      { cwd: temporary, stdio: "inherit" },
    );
  }
  // Initialization checks the packaged CLI against every enabled MCP command.
  const child = spawn(process.execPath, [mcp, "--toolsets", "all"], {
    cwd: temporary,
    stdio: ["pipe", "pipe", "pipe"],
  });
  let stderr = "";
  child.stderr.on("data", (data) => {
    stderr += data;
  });
  const lines = createInterface({ input: child.stdout });
  let initialized = false;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("MCP artifact verification timed out."));
    }, 15000);
    const send = (message) => child.stdin.write(JSON.stringify(message) + "\n");
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      reject(new Error(`MCP exited early (${code}): ${stderr}`));
    });
    lines.on("line", (line) => {
      try {
        const response = JSON.parse(line);
        assert(!response.error, JSON.stringify(response.error));
        if (response.id === 1) {
          assert.equal(response.result.serverInfo.version, version);
          initialized = true;
          send({ jsonrpc: "2.0", method: "notifications/initialized" });
          send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
        } else if (response.id === 2) {
          assert(initialized && response.result.tools.length > 0);
          console.log(
            `Packaged MCP exposes ${response.result.tools.length} tools.`,
          );
          clearTimeout(timer);
          resolve();
        }
      } catch (error) {
        clearTimeout(timer);
        child.kill("SIGKILL");
        reject(error);
      }
    });
    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "release-verification", version: "1" },
      },
    });
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("MCP shutdown timed out."));
    }, 10000);
    child.once("close", (code) => {
      clearTimeout(timer);
      code === 0
        ? resolve()
        : reject(new Error(`MCP shutdown failed: ${stderr}`));
    });
    child.stdin.end();
  });
  lines.close();
  console.log("Isolated package imports, CLI, and MCP compatibility verified.");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
