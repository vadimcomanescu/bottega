import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const HOOKS = join(import.meta.dirname, "..", "hooks");
const ROUTE_GUARD = join(HOOKS, "route-guard.mjs");
const OWNER = "owner-session";

const cleanups: string[] = [];
afterEach(() => {
  while (cleanups.length > 0) rmSync(cleanups.pop()!, { recursive: true, force: true });
});

function repoWithRun(owner?: string): string {
  const dir = mkdtempSync(join(tmpdir(), "bottega-route-guard-"));
  cleanups.push(dir);
  if (owner) {
    const run = join(dir, ".bottega", "run", "cross-harness");
    mkdirSync(run, { recursive: true });
    writeFileSync(join(run, "owner"), owner + "\n");
  }
  return dir;
}

function run(
  event: unknown,
  harness: "claude" | "codex" = "claude",
): string {
  const {
    CLAUDE_PLUGIN_ROOT: _claudeRoot,
    CODEX_HOME: _codexHome,
    CODEX_PLUGIN_ROOT: _codexPluginRoot,
    PLUGIN_ROOT: _pluginRoot,
    ...baseEnv
  } = process.env;
  const harnessEnv =
    harness === "codex"
      ? { CODEX_HOME: join(tmpdir(), "codex-home"), PLUGIN_ROOT: HOOKS }
      : { CLAUDE_PLUGIN_ROOT: HOOKS };
  const result = spawnSync("node", [ROUTE_GUARD], {
    input: typeof event === "string" ? event : JSON.stringify(event),
    encoding: "utf8",
    env: { ...baseEnv, ...harnessEnv },
  });
  expect(result.status).toBe(0);
  return result.stdout;
}

function claudeDenial(stdout: string): string {
  const parsed = JSON.parse(stdout);
  expect(parsed.hookSpecificOutput).toMatchObject({
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
  });
  return parsed.hookSpecificOutput.permissionDecisionReason;
}

function ownedEvent(tool_input: object, tool_name = "Agent") {
  return {
    cwd: repoWithRun(OWNER),
    session_id: OWNER,
    tool_name,
    tool_input,
  };
}

describe("route guard ownership rule", () => {
  it("denies an owner-session dispatch without a model", () => {
    const reason = claudeDenial(
      run(ownedEvent({ subagent_type: "general-purpose", prompt: "build the slice" })),
    );
    expect(reason).toMatch(/names no model/i);
    expect(reason).toMatch(/skills\/routing/);
  });

  it("denies an owner-session dispatch routed to fable", () => {
    const reason = claudeDenial(
      run(ownedEvent({ subagent_type: "general-purpose", model: "claude-fable-5" })),
    );
    expect(reason).toMatch(/fable/i);
    expect(reason).toMatch(/skills\/routing/);
  });

  it("allows an owner-session dispatch with a non-fable model", () => {
    expect(run(ownedEvent({ subagent_type: "general-purpose", model: "opus-4.8" }))).toBe("");
  });

  it("allows a non-owner session regardless of model", () => {
    const cwd = repoWithRun(OWNER);
    for (const tool_input of [
      { subagent_type: "general-purpose" },
      { subagent_type: "general-purpose", model: "fable-5" },
    ]) {
      expect(
        run({ cwd, session_id: "bystander-session", tool_name: "Task", tool_input }),
      ).toBe("");
    }
  });

  it("passes malformed input and failed reads", () => {
    expect(run("not json")).toBe("");
    expect(run({ cwd: repoWithRun(OWNER), session_id: OWNER, tool_input: null })).toBe("");
    expect(
      run(ownedEvent({ scriptPath: "/path/that/does/not/exist.js" }, "Workflow")),
    ).toBe("");
  });
});

describe("route guard workflow rule", () => {
  it("denies an owner-session workflow with an unpinned agent call", () => {
    const script = "const result = await agent('review the diff', { label: 'review' })";
    const reason = claudeDenial(run(ownedEvent({ script }, "Workflow")));
    expect(reason).toMatch(/agent\(\).*names no literal model/i);
    expect(reason).toMatch(/skills\/routing/);
  });

  it("denies an owner-session workflow with a fable agent model", () => {
    const script = "const result = await agent('review the diff', { model: 'fable-5' })";
    const reason = claudeDenial(run(ownedEvent({ script }, "Workflow")));
    expect(reason).toMatch(/fable/i);
  });

  it("allows an owner-session workflow whose agent calls use non-fable literal models", () => {
    const script = `
const review = await agent('review the diff', { model: 'opus-4.8' })
const check = await agent('run checks', { label: 'check', model: "gpt-5.6-sol" })
`;
    expect(run(ownedEvent({ script }, "Workflow"))).toBe("");
  });
});

describe("route guard harness responses", () => {
  it("emits the documented Codex PreToolUse denial", () => {
    const parsed = JSON.parse(run(ownedEvent({ subagent_type: "worker" }), "codex"));
    expect(parsed).toMatchObject({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
      },
    });
  });

});

describe("route guard registrations", () => {
  it.each([
    ["Claude Code", "hooks.json", "PreToolUse"],
    ["Codex", "hooks-codex.json", "PreToolUse"],
  ])("parses the %s registration and references route-guard.mjs", (_harness, file, event) => {
    const raw = readFileSync(join(HOOKS, file), "utf8");
    const registration = JSON.parse(raw);
    expect(registration.hooks[event]).toBeInstanceOf(Array);
    expect(raw).toContain("route-guard.mjs");
  });
});
