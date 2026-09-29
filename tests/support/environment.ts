import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { parseEnv } from "node:util";

export const root = process.cwd();
export const store = resolve(root, ".runs");
export const identityFile = resolve(store, "identity.json");
export type Json = Record<string, any>;
export function read(path: string): Json {
  return JSON.parse(readFileSync(path, "utf8"));
}
export function save(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(value, null, 2) + "\n", {
    mode: 0o600,
  });
  renameSync(temporary, path);
}
export function configuration() {
  const origin = process.env.CLIENTS_TEST_API_URL;
  if (process.env.CLIENTS_TEST_APPROVED !== "true" || !origin)
    throw Error("BLOCKED: configure .env.test and approve the local target.");
  const url = new URL(origin);
  if (
    url.origin !== origin ||
    !["https:", "http:"].includes(url.protocol) ||
    !["api.playbooks.dev", "localhost", "127.0.0.1", "[::1]"].includes(
      url.hostname,
    )
  )
    throw Error("BLOCKED: tests require an explicit local API origin.");
  return {
    origin,
    serverRoot: resolve(
      process.env.CLIENTS_TEST_SERVER_ROOT || "../playbooks-server",
    ),
  };
}
export async function validateTarget() {
  const config = configuration();
  serverEnvironment();
  const addresses = await lookup(new URL(config.origin).hostname, {
    all: true,
  });
  assert(
    addresses.length &&
      addresses.every((item) => ["127.0.0.1", "::1"].includes(item.address)),
    "BLOCKED: API must resolve to the local host",
  );
}
export function identity() {
  const data = read(identityFile);
  assert.equal(
    data.origin,
    configuration().origin,
    "Identity belongs to another target",
  );
  assert(
    data.apiKey && data.workspaceUuid && data.workspaceId,
    "BLOCKED: run test:setup first",
  );
  return data;
}
export function serverEnvironment() {
  const config = configuration();
  const env = parseEnv(
    readFileSync(resolve(config.serverRoot, ".env"), "utf8"),
  );
  assert.equal(env.NODE_ENV, "development");
  assert.equal(env.API_DOMAIN, config.origin);
  assert.equal(env.APP_DB_NAME, "app_db");
  assert.equal(env.APP_DB_HOST, "playbooks-db");
  return env;
}
/** Only setup and observation helpers use raw APIs; acceptance uses client libraries. */
export async function api(
  path: string,
  token?: string,
  workspace?: string,
  method = "GET",
  data?: unknown,
): Promise<any> {
  const response = await fetch(configuration().origin + path, {
    method,
    redirect: "error",
    signal: AbortSignal.timeout(30000),
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: token } : {}),
      ...(workspace ? { workspace } : {}),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  }).catch((error: unknown) => {
    const code = (error as { cause?: { code?: string } }).cause?.code;
    throw Error(
      `BLOCKED: local API connection failed (${/^[A-Z_]+$/.test(code || "") ? code : "network"}); inspect dispatched mutation state before retrying.`,
    );
  });
  if (!response.ok)
    throw Error(
      `API ${method} ${path.split("?")[0]} returned ${response.status}`,
    );
  if (response.status === 204) return null;
  const body = (await response.json()) as Json;
  return body.data;
}
export async function login(email: string, password: string) {
  const user = await api("/auth/login", undefined, undefined, "POST", {
    email,
    password,
  });
  assert(user?.token?.rawToken, "Login returned no session");
  return user;
}
export async function admin() {
  const email = process.env.CLIENTS_TEST_ADMIN_EMAIL;
  const password = process.env.CLIENTS_TEST_ADMIN_PASSWORD;
  assert(
    email && password,
    "BLOCKED: configure local setup administrator credentials",
  );
  const user = await login(email, password);
  assert.equal(user.role, "admin");
  assert.equal(user.status, "active");
  return user.token.rawToken as string;
}
/** The separate administrator process returns observations, never its session. */
export async function adminRequest(path: string, data?: Json): Promise<any> {
  return new Promise((resolveResult, reject) => {
    const child = spawn(
      process.execPath,
      ["scripts/run-tests.mjs", "admin", path],
      {
        env: {
          PATH: process.env.PATH,
          NODE_EXTRA_CA_CERTS: process.env.NODE_EXTRA_CA_CERTS,
        },
        stdio: "pipe",
        timeout: 90000,
      },
    );
    let output = "";
    child.stdout.on("data", (value) => {
      output += value;
      if (output.length > 1024 * 1024) child.kill();
    });
    child.stderr.resume();
    child.on("error", () =>
      reject(Error("BLOCKED: administrator helper could not start")),
    );
    child.on("close", (code) => {
      if (code !== 0)
        return reject(
          Error("BLOCKED: administrator readiness/funding helper failed"),
        );
      try {
        resolveResult(JSON.parse(output));
      } catch {
        reject(Error("BLOCKED: invalid administrator helper response"));
      }
    });
    child.stdin.end(JSON.stringify(data ?? null));
  });
}
export function lease(owner: string) {
  mkdirSync(store, { recursive: true, mode: 0o700 });
  const file = resolve(store, "clients.lock");
  if (existsSync(file)) {
    const previous = read(file);
    // Only an explicit cleanup can recover a dead run's lease.
    if (previous.owner !== owner)
      throw Error("BLOCKED: another run owns the lease; resume its cleanup.");
    try {
      process.kill(previous.pid, 0);
      throw Error("BLOCKED: lease owner is still running.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
    }
    unlinkSync(file);
  }
  writeFileSync(
    file,
    JSON.stringify({ owner, pid: process.pid, origin: configuration().origin }),
    { flag: "wx", mode: 0o600 },
  );
  return () => {
    if (read(file).owner === owner) unlinkSync(file);
  };
}
export function childEnvironment(configPath: string): NodeJS.ProcessEnv {
  const user = identity();
  const result: NodeJS.ProcessEnv = {
    PATH: process.env.PATH,
    HOME: dirname(configPath),
    TMPDIR: dirname(configPath),
    PLAYBOOKS_API_URL: user.origin,
    PLAYBOOKS_TOKEN: user.apiKey,
    NO_COLOR: "1",
    FORCE_COLOR: "0",
  };
  if (process.env.NODE_EXTRA_CA_CERTS)
    result.NODE_EXTRA_CA_CERTS = process.env.NODE_EXTRA_CA_CERTS;
  return result;
}
export function safeFailure(error: unknown) {
  if (!(error instanceof Error)) return "Unknown client operation failure";
  if (/^(BLOCKED:|API (GET|POST|PUT|DELETE) )/.test(error.message))
    return error.message;
  const location = error.stack?.match(/\.test-dist\/([\w/.-]+:\d+:\d+)/)?.[1];
  const status = (error as Error & { status?: number }).status;
  return `Client check failed (${error.name}${Number.isInteger(status) ? `, HTTP ${status}` : ""}${location ? `, ${location}` : ""}); response contents withheld.`;
}
