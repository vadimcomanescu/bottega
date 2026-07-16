// The codex dispatch module: one place assembles every `codex exec`
// invocation, and --dry-run exposes the assembly for pinning. The two resume
// traps (resume drops -s and -C silently) are the reason this script exists;
// both are asserted here.
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = join(import.meta.dirname, "..", "scripts", "codex-exec");

const BASE = [
  "--model", "gpt-5.6-sol",
  "--effort", "high",
  "--sandbox", "danger-full-access",
  "--cwd", "/tmp/worktree",
  "--brief", "/tmp/brief.md",
  "--out", "/tmp/out.txt",
  "--events", "/tmp/events.jsonl",
];

function dryRun(...extra: string[]): { status: number | null; argv?: string[]; raw: any } {
  const result = spawnSync("node", [SCRIPT, ...BASE, ...extra, "--dry-run"], {
    encoding: "utf-8",
  });
  const raw = result.status === 0 ? JSON.parse(result.stdout) : null;
  return { status: result.status, argv: raw?.argv, raw };
}

describe("codex-exec assembly", () => {
  it("assembles a fresh dispatch with the sandbox and worktree as flags", () => {
    const { status, argv, raw } = dryRun();
    expect(status).toBe(0);
    expect(argv).toEqual([
      "exec",
      "--ignore-user-config",
      "-m", "gpt-5.6-sol",
      "-c", "model_reasoning_effort=high",
      "-s", "danger-full-access",
      "-C", "/tmp/worktree",
      "--json",
      "-o", "/tmp/out.txt",
    ]);
    expect(raw.stdin).toBe("/tmp/brief.md");
    expect(raw.stdout).toBe("/tmp/events.jsonl");
  });

  it("re-enters the sandbox as config and drops -s/-C on resume, with the stdin marker", () => {
    const { argv } = dryRun("--resume", "thread-123");
    expect(argv).toEqual([
      "exec",
      "resume", "thread-123",
      "--ignore-user-config",
      "-m", "gpt-5.6-sol",
      "-c", "model_reasoning_effort=high",
      "-c", "sandbox_mode=danger-full-access",
      "--json",
      "-o", "/tmp/out.txt",
      "-",
    ]);
    expect(argv).not.toContain("-s");
    expect(argv).not.toContain("-C");
  });

  it("adds --output-schema for reviewer dispatches", () => {
    const { argv } = dryRun("--schema", "/abs/report.schema.json");
    expect(argv).toContain("--output-schema");
    expect(argv![argv!.indexOf("--output-schema") + 1]).toBe("/abs/report.schema.json");
  });

  it("refuses a missing required argument and an unknown sandbox", () => {
    const missing = spawnSync("node", [SCRIPT, "--model", "x", "--dry-run"], { encoding: "utf-8" });
    expect(missing.status).toBe(2);
    const badSandbox = spawnSync(
      "node",
      [SCRIPT, ...BASE.map((v) => (v === "danger-full-access" ? "workspace-write" : v)), "--dry-run"],
      { encoding: "utf-8" },
    );
    expect(badSandbox.status).toBe(2);
    expect(badSandbox.stderr).toMatch(/read-only or danger-full-access/);
  });

  it("refuses a relative path: it would resolve against the dispatching shell's cwd", () => {
    for (const flag of ["--cwd", "--brief", "--out", "--events"]) {
      const args = [...BASE];
      args[args.indexOf(flag) + 1] = "relative/path";
      const result = spawnSync("node", [SCRIPT, ...args, "--dry-run"], { encoding: "utf-8" });
      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(/must be an absolute path/);
    }
    const schema = spawnSync("node", [SCRIPT, ...BASE, "--schema", "report.json", "--dry-run"], {
      encoding: "utf-8",
    });
    expect(schema.status).toBe(2);
    expect(schema.stderr).toMatch(/must be an absolute path/);
  });

  it("refuses an empty optional flag instead of silently degrading it", () => {
    // --resume "" would silently assemble a fresh dispatch; --schema "" an
    // unenforced one.
    for (const flag of ["--resume", "--schema"]) {
      const result = spawnSync("node", [SCRIPT, ...BASE, flag, "", "--dry-run"], {
        encoding: "utf-8",
      });
      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(/must not be empty/);
    }
  });
});

// Post-run verification, exercised against a stub codex binary that emits a
// controllable event stream and out file. The event stream is the completion
// authority; these pin every way a run can lie with exit code 0.
describe("codex-exec completion verification", () => {
  const STUB = `#!/usr/bin/env node
const { writeFileSync } = require("node:fs");
const args = process.argv.slice(2);
const out = args[args.indexOf("-o") + 1];
const resumed = args[1] === "resume" ? args[2] : null;
const mode = process.env.CODEX_STUB_MODE ?? "ok";
const threadId = mode === "fork" ? "t-forked" : (resumed ?? "t-fresh");
const emit = (event) => process.stdout.write(JSON.stringify(event) + "\\n");
emit({ type: "thread.started", thread_id: threadId });
if (mode === "fail") {
  emit({ type: "turn.failed", error: { message: "usage limit reached" } });
  process.exit(1);
}
emit({ type: "item.completed", item: { type: "agent_message", text: "done" } });
if (mode !== "no-turn-completed") emit({ type: "turn.completed", usage: {} });
if (mode === "bad-json") writeFileSync(out, "not json");
else if (mode !== "empty-out") writeFileSync(out, '{"word":"ok"}');
process.exit(0);
`;

  function runStubbed(mode: string, ...extra: string[]) {
    const dir = mkdtempSync(join(tmpdir(), "codex-exec-test-"));
    writeFileSync(join(dir, "codex"), STUB, { mode: 0o755 });
    writeFileSync(join(dir, "brief.md"), "the brief");
    writeFileSync(join(dir, "schema.json"), "{}");
    const args = [
      "--model", "gpt-5.6-sol",
      "--effort", "high",
      "--sandbox", "read-only",
      "--cwd", dir,
      "--brief", join(dir, "brief.md"),
      "--out", join(dir, "out.txt"),
      "--events", join(dir, "events.jsonl"),
      ...extra.map((v) => (v === "<schema>" ? join(dir, "schema.json") : v)),
    ];
    return spawnSync("node", [SCRIPT, ...args], {
      encoding: "utf-8",
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, CODEX_STUB_MODE: mode },
    });
  }

  it("passes a clean run, fresh and resumed", () => {
    expect(runStubbed("ok").status).toBe(0);
    expect(runStubbed("ok", "--resume", "t-123").status).toBe(0);
  });

  it("fails an exit-0 run that never emitted turn.completed", () => {
    const result = runStubbed("no-turn-completed");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/without a turn.completed event/);
  });

  it("fails an exit-0 run that wrote no final message", () => {
    const result = runStubbed("empty-out");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/wrote no final message/);
  });

  it("fails a schema'd run whose out file is not JSON", () => {
    const result = runStubbed("bad-json", "--schema", "<schema>");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not valid JSON/);
  });

  it("fails a resume that forked a new session instead of continuing the thread", () => {
    const result = runStubbed("fork", "--resume", "t-123");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/started a new session t-forked/);
  });

  it("surfaces the turn.failed reason from the event stream on a failed run", () => {
    const result = runStubbed("fail");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/usage limit reached/);
  });
});
