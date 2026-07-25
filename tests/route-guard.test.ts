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

function run(event: unknown): string {
  const result = spawnSync("node", [ROUTE_GUARD], {
    input: typeof event === "string" ? event : JSON.stringify(event),
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: HOOKS },
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
    expect(reason).toMatch(/skills\/maestro/);
  });

  it("denies an owner-session dispatch routed to fable", () => {
    const reason = claudeDenial(
      run(ownedEvent({ subagent_type: "general-purpose", model: "claude-fable-5" })),
    );
    expect(reason).toMatch(/fable/i);
    expect(reason).toMatch(/never a worker/i);
  });

  it("allows an owner-session dispatch with a non-fable model", () => {
    expect(run(ownedEvent({ subagent_type: "general-purpose", model: "claude-opus-5" }))).toBe("");
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

describe("route guard discovery claim", () => {
  function repoWithDiscovery(owner: string): string {
    const dir = mkdtempSync(join(tmpdir(), "bottega-route-guard-"));
    cleanups.push(dir);
    mkdirSync(join(dir, ".bottega"), { recursive: true });
    writeFileSync(join(dir, ".bottega", "discovery"), owner + "\n");
    return dir;
  }

  it("denies a claim-holding session's dispatch without a model", () => {
    const reason = claudeDenial(
      run({
        cwd: repoWithDiscovery(OWNER),
        session_id: OWNER,
        tool_name: "Agent",
        tool_input: { subagent_type: "general-purpose", prompt: "explore the area" },
      }),
    );
    expect(reason).toMatch(/names no model/i);
  });

  it("allows a bystander session when only a discovery claim exists", () => {
    expect(
      run({
        cwd: repoWithDiscovery(OWNER),
        session_id: "bystander-session",
        tool_name: "Agent",
        tool_input: { subagent_type: "general-purpose" },
      }),
    ).toBe("");
  });
});

describe("route guard codex dispatch rule", () => {
  it("denies an owner-session codex exec without a model", () => {
    const reason = claudeDenial(
      run(ownedEvent({ command: "codex exec -s read-only -o /tmp/out - < /tmp/brief" }, "Bash")),
    );
    expect(reason).toMatch(/codex dispatch names no model/i);
    expect(reason).toMatch(/skills\/maestro/);
  });

  it("denies an owner-session codex exec routed to fable", () => {
    const reason = claudeDenial(
      run(ownedEvent({ command: "codex exec -m claude-fable-5 -o /tmp/out -" }, "Bash")),
    );
    expect(reason).toMatch(/fable/i);
  });

  it("allows an owner-session codex exec naming a model, resume included", () => {
    for (const command of [
      "codex exec --ignore-user-config -m gpt-5.6-sol -c model_reasoning_effort=\"xhigh\" -s read-only -o /tmp/out -",
      "(cd /tmp/wt && codex exec resume abc123 --ignore-user-config -m gpt-5.6-sol -o /tmp/out -)",
    ]) {
      expect(run(ownedEvent({ command }, "Bash"))).toBe("");
    }
  });

  it("ignores non-dispatch bash in an owner session", () => {
    for (const command of ["codex login status", "git status", "codex exec --help"]) {
      expect(run(ownedEvent({ command }, "Bash"))).toBe("");
    }
  });
});

describe("route guard workflow rule", () => {
  it("denies an owner-session workflow with an unpinned agent call", () => {
    const script = "const result = await agent('review the diff', { label: 'review' })";
    const reason = claudeDenial(run(ownedEvent({ script }, "Workflow")));
    expect(reason).toMatch(/agent\(\).*names no literal model/i);
    expect(reason).toMatch(/skills\/maestro/);
  });

  it("denies an owner-session workflow with a fable agent model", () => {
    const script = "const result = await agent('review the diff', { model: 'fable-5' })";
    const reason = claudeDenial(run(ownedEvent({ script }, "Workflow")));
    expect(reason).toMatch(/fable/i);
  });

  it("allows an owner-session workflow whose agent calls use non-fable literal models", () => {
    const script = `
const review = await agent('review the diff', { model: 'claude-opus-5' })
const check = await agent('run checks', { label: 'check', model: "gpt-5.6-sol" })
`;
    expect(run(ownedEvent({ script }, "Workflow"))).toBe("");
  });
});

describe("route guard registration", () => {
  it("parses the registration and references route-guard.mjs", () => {
    const raw = readFileSync(join(HOOKS, "hooks.json"), "utf8");
    const registration = JSON.parse(raw);
    expect(registration.hooks["PreToolUse"]).toBeInstanceOf(Array);
    expect(raw).toContain("route-guard.mjs");
  });
});
