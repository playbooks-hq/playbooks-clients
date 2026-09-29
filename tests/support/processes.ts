import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

import { childEnvironment, type Json, root } from "./environment.js";

export async function cli(
  config: string,
  args: string[],
  data?: unknown,
  signal?: AbortSignal,
) {
  return new Promise<{ code: number; stdout: string; stderr: string }>(
    (resolveResult, reject) => {
      const child = spawn(
        process.execPath,
        [
          resolve(root, "packages/cli/dist/index.cjs"),
          ...args,
          "--config",
          config,
          "--json",
        ],
        {
          env: childEnvironment(config),
          stdio: "pipe",
          signal,
          timeout: signal ? undefined : 45000,
        },
      );
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (value) => {
        stdout += value;
        if (stdout.length > 8 * 1024 * 1024) child.kill();
      });
      child.stderr.on("data", (value) => {
        stderr += value;
        if (stderr.length > 1024 * 1024) child.kill();
      });
      child.on("error", reject);
      child.on("close", (code) =>
        resolveResult({ code: code ?? 1, stdout, stderr }),
      );
      child.stdin.end(data === undefined ? undefined : JSON.stringify(data));
    },
  );
}
export class MCP {
  private child: ChildProcessWithoutNullStreams;
  private pending = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
      timer: NodeJS.Timeout;
    }
  >();
  private sequence = 0;
  constructor(config: string, extra: string[] = ["--toolsets", "all"]) {
    this.child = spawn(
      process.execPath,
      [
        resolve(root, "packages/mcp/dist/index.cjs"),
        "--config",
        config,
        ...extra,
      ],
      { env: childEnvironment(config), stdio: "pipe" },
    );
    this.child.stderr.resume();
    const lines = createInterface({ input: this.child.stdout });
    lines.on("line", (line) => {
      try {
        const reply = JSON.parse(line);
        const entry = this.pending.get(reply.id);
        if (!entry) return;
        clearTimeout(entry.timer);
        this.pending.delete(reply.id);
        if (reply.error) entry.reject(Error("MCP rejected the request"));
        else entry.resolve(reply.result);
      } catch {
        this.fail();
      }
    });
    this.child.on("error", () => this.fail());
    this.child.on("close", () => {
      lines.close();
      this.fail();
    });
  }
  private fail() {
    for (const entry of this.pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(Error("MCP connection ended"));
    }
    this.pending.clear();
  }
  request(method: string, params: Json = {}): Promise<any> {
    return new Promise((resolveResult, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(Error("MCP request timed out"));
      }, 60000);
      this.pending.set(id, { resolve: resolveResult, reject, timer });
      this.child.stdin.write(
        JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n",
      );
    });
  }
  async initialize() {
    await this.request("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "clients-integration", version: "1" },
    });
    this.child.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
        "\n",
    );
  }
  call(name: string, args: Json) {
    return this.request("tools/call", { name, arguments: args });
  }
  async close() {
    if (this.child.exitCode !== null) return;
    await new Promise<void>((done) => {
      const timer = setTimeout(() => this.child.kill("SIGKILL"), 5000);
      this.child.once("close", () => {
        clearTimeout(timer);
        done();
      });
      this.child.stdin.end();
    });
  }
}
