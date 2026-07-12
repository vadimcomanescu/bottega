// The codex dispatch module: one place assembles every `codex exec`
// invocation, and --dry-run exposes the assembly for pinning. The two resume
// traps (resume drops -s and -C silently) are the reason this script exists;
// both are asserted here.
import { spawnSync } from "node:child_process";
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
});
