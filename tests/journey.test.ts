import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import { PlaybooksError } from "../packages/sdk/dist/index.js";
import { cliChecks } from "./cli.js";
import { mcpChecks } from "./mcp.js";
import { sdkChecks } from "./sdk.js";
import {
  api,
  identity,
  lease,
  safeFailure,
  save,
} from "./support/environment.js";
import { cli, MCP } from "./support/processes.js";
import { check, cleanup, newRun, runPath } from "./support/run.js";
import { fund } from "./support/setup.js";

test(
  "SDK, CLI, and MCP share a real local Project",
  { timeout: 30 * 60000 },
  async (t) => {
    const state = newRun();
    const release = lease(state.id);
    const config = resolve(dirname(runPath(state.id)), "cli.json");
    save(config, { version: 1 });
    const controller = new AbortController();
    const interrupt = () => controller.abort();
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", interrupt);
    const watchdog = setTimeout(interrupt, 25 * 60000);
    let mcp: MCP | undefined;
    let failed = false;
    let fundingTimer: NodeJS.Timeout | undefined;
    let funding = Promise.resolve();
    async function scenario(name: string, task: () => Promise<void>) {
      if (controller.signal.aborted) throw Error("BLOCKED: run interrupted");
      let failure: unknown;
      await t.test(name, async () => {
        try {
          await task();
          state.scenarios[name] = "passed";
        } catch (error) {
          failure = error;
          state.scenarios[name] = safeFailure(error).startsWith("BLOCKED:")
            ? "blocked"
            : "failed";
          throw Error(safeFailure(error));
        } finally {
          save(runPath(state.id), state);
        }
      });
      if (failure) throw failure;
    }
    try {
      identity();
      await fund();
      const { workspace } = await check();
      const user = identity();
      const discovery = await workspace.projects.list({ page: 0, pageSize: 1 });
      assert(discovery.meta);
      state.creationDispatched = true;
      save(runPath(state.id), state);
      const project = await workspace.projects.create({
        name: `Clients ${state.id}`,
      });
      state.projectUuid = project.uuid;
      state.projectId = project.id;
      save(runPath(state.id), state);
      assert.equal(project.workspaceId, user.workspaceId);
      assert.equal(project.projectOwnerId, user.userId);
      await scenario("SDK resource contracts", () =>
        sdkChecks(workspace, project),
      );
      await scenario("CLI contracts", () => cliChecks(state, config));
      mcp = new MCP(config);
      await mcp.initialize();
      await scenario("MCP contracts", () => mcpChecks(state, config, mcp!));
      const scope = {
        workspace: state.workspaceUuid,
        project: state.projectUuid,
      };
      const marker = `clients-reference-${randomUUID()}`;
      await scenario("Files across all clients", async () => {
        state.fileIntent = "reference/clients-smoke.txt";
        save(runPath(state.id), state);
        await project.files.upload({
          name: state.fileIntent,
          content: new Blob([marker]),
          expectedRevision: null,
        });
        const files = await project.files.list();
        const file = files.data.find((item) => item.name === state.fileIntent);
        assert(file?.uuid);
        state.fileId = file.uuid;
        save(runPath(state.id), state);
        const destination = resolve(dirname(config), "download.txt");
        const downloaded = await cli(config, [
          "project",
          "file",
          "download",
          "--workspace",
          state.workspaceUuid,
          "--project",
          project.uuid,
          "--file-id",
          String(file.uuid),
          "--output",
          destination,
        ]);
        assert.equal(downloaded.code, 0);
        assert.equal(readFileSync(destination, "utf8"), marker);
        const listed = await mcp!.call("playbooks_project_files", scope);
        assert(!listed.isError);
        assert(
          listed.structuredContent.data.some(
            (item: any) => item.uuid === file.uuid,
          ),
        );
        await assert.rejects(
          project.files.upload({
            name: state.fileIntent,
            content: new Blob(["wrong"]),
            expectedRevision: randomUUID(),
          }),
          (error: unknown) =>
            error instanceof PlaybooksError && error.status === 409,
        );
        assert.equal(
          Buffer.from(await project.files.download(file.uuid)).toString(),
          marker,
        );
      });
      await scenario("One bounded Operator run", async () => {
        async function phase<T>(
          name: string,
          task: () => Promise<T>,
        ): Promise<T> {
          state.operatorChecks[name] = "running";
          save(runPath(state.id), state);
          try {
            const result = await task();
            state.operatorChecks[name] = "passed";
            return result;
          } catch (error) {
            state.operatorChecks[name] = safeFailure(error).startsWith(
              "BLOCKED:",
            )
              ? "blocked"
              : "failed";
            throw error;
          } finally {
            save(runPath(state.id), state);
          }
        }
        const conversation = await project.conversations.resolve();
        state.conversationUuid = conversation.uuid;
        save(runPath(state.id), state);
        const branches = await project.branches.list();
        const selected =
          branches.data.find(
            (item) => item.id === conversation.latestBranchId,
          ) ?? branches.data[0];
        state.branchId = selected?.id;
        assert(state.branchId);
        save(runPath(state.id), state);
        const branch = await conversation.branches.get(state.branchId);
        state.messageKey = `clients:${state.id}`;
        state.operatorPhase = "submission";
        save(runPath(state.id), state);
        const started = Date.now();
        const signal = AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(10 * 60000),
        ]);
        fundingTimer = setInterval(() => {
          funding = funding
            .then(async () => {
              if (!signal.aborted) await fund();
            })
            .catch((error) => {
              controller.abort(error);
            });
        }, 30000);
        const submitted = await phase("submission", async () => {
          const result = await mcp!.call("playbooks_project_message_create", {
            ...scope,
            conversation: conversation.uuid,
            branch: state.branchId,
            confirm: true,
            data: {
              text: "Read the Agent File reference/clients-smoke.txt and respond with its exact marker. Do not modify source, publish, provision services, or access external integrations.",
              mode: "execute",
              maxCredits: 5,
              idempotencyKey: state.messageKey,
            },
          });
          assert(!result.isError);
          return result;
        });
        state.messageId = submitted.structuredContent.data.id;
        assert(state.messageId);
        state.operatorPhase = "run-discovery";
        save(runPath(state.id), state);
        await phase("run-discovery", async () => {
          let runs = await project.runs.list({ messageId: state.messageId });
          while (!runs.data.length && Date.now() - started < 60000) {
            await delay(1000, undefined, { signal });
            runs = await project.runs.list({ messageId: state.messageId });
          }
          assert.equal(runs.data.length, 1);
          state.operatorRunId = runs.data[0].id;
        });
        await phase("scoped-filters", async () => {
          for (const options of [
            { messageId: state.messageId },
            { conversationId: state.conversationUuid },
            { branchId: state.branchId },
            {
              messageId: state.messageId,
              conversationId: state.conversationUuid,
              branchId: state.branchId,
            },
          ]) {
            const filtered = await project.runs.list(options);
            assert.deepEqual(
              filtered.data.map((item) => item.id),
              [state.operatorRunId],
            );
          }
        });
        state.operatorPhase = "streaming";
        save(runPath(state.id), state);
        const observations = await Promise.allSettled([
          phase("sdk-stream", async () => {
            let finish: any;
            for await (const event of project.runs.stream(state.operatorRunId, {
              signal,
            }))
              if (event.data?.type === "finish") finish = event.data;
            assert.equal(finish?.runId, state.operatorRunId);
            assert.equal(finish.status, "completed");
          }),
          phase("cli-stream", async () => {
            const stream = await cli(
              config,
              [
                "project",
                "run",
                "stream",
                "--workspace",
                state.workspaceUuid,
                "--project",
                project.uuid,
                "--run",
                String(state.operatorRunId),
                "--timeout",
                "600",
              ],
              undefined,
              signal,
            );
            assert.equal(stream.code, 0);
            const events = stream.stdout
              .trim()
              .split("\n")
              .map((line) => JSON.parse(line));
            const finish = events.find(
              (event) => event.data?.type === "finish",
            );
            assert.equal(finish?.data.runId, state.operatorRunId);
            assert.equal(finish?.data.status, "completed");
            const status = events.find((event) => event.event === "run-status");
            assert.equal(status?.data.id, state.operatorRunId);
            assert.equal(status?.data.status, "completed");
          }),
        ]);
        for (const result of observations)
          if (result.status === "rejected") throw result.reason;
        state.operatorPhase = "final-inspection";
        save(runPath(state.id), state);
        await phase("final-inspection", async () => {
          const run = await mcp!.call("playbooks_project_run", {
            ...scope,
            run: state.operatorRunId,
          });
          assert(!run.isError);
          assert.equal(run.structuredContent.data.status, "completed");
          assert.equal(run.structuredContent.data.id, state.operatorRunId);
          const messages = await branch.messages.list();
          assert(
            messages.data.some(
              (message) =>
                message.role === "assistant" &&
                JSON.stringify(message.toJSON()).includes(marker),
            ),
          );
          const inspected = await mcp!.call("playbooks_project_messages", {
            ...scope,
            conversation: conversation.uuid,
            branch: state.branchId,
          });
          assert(!inspected.isError);
          assert(
            inspected.structuredContent.data.some(
              (message: any) =>
                message.role === "assistant" &&
                (
                  message.text ||
                  (message.parts || [])
                    .filter((part: any) => part.type === "text")
                    .map((part: any) => part.text)
                    .join("\n")
                ).includes(marker),
            ),
          );
        });
        state.operatorElapsedMs = Date.now() - started;
        state.operatorPhase = "completed";
      });
    } catch (error) {
      failed = true;
      state.failure = safeFailure(error);
      console.error(state.failure);
    } finally {
      controller.abort();
      clearInterval(fundingTimer);
      await funding;
      clearTimeout(watchdog);
      await mcp?.close();
      if (state.projectUuid) {
        try {
          const user = identity();
          const budget = await api(
            `/projects/${state.projectUuid}/budget`,
            user.apiKey,
            user.workspaceUuid,
          );
          state.observedCredits = budget.usedCredits;
        } catch {
          state.observedCredits = null;
        }
      }
      try {
        await cleanup(state, Math.min(state.deadline, Date.now() + 5 * 60000));
        release();
      } catch (error) {
        failed = true;
        state.cleanup = "blocked";
        state.cleanupFailure = safeFailure(error);
      }
      state.elapsedMs = Date.now() - Date.parse(state.startedAt);
      process.removeListener("SIGINT", interrupt);
      process.removeListener("SIGTERM", interrupt);
      state.outcome = failed
        ? state.failure?.startsWith("BLOCKED:")
          ? "blocked"
          : "failed"
        : "passed";
      if (state.cleanup !== "complete") state.outcome = "blocked";
      save(runPath(state.id), state);
      console.log(
        JSON.stringify({
          runId: state.id,
          outcome: state.outcome,
          elapsedMs: state.elapsedMs,
          observedCredits: state.observedCredits ?? null,
          cleanup: state.cleanup,
        }),
      );
    }
    assert.equal(
      failed,
      false,
      "See sanitized run manifest for failure or cleanup details",
    );
  },
);
