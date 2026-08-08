// The codex-task wrapper: one detached `codex exec` per job, job state on
// disk per workspace, pins required on every dispatch. These tests run the
// real script against a stub `codex` binary on PATH and pin the contract its
// header states: argument assembly, the background receipt and watch cycle,
// pinned resume, cancel, and the unsandboxed default.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const SCRIPT = join(import.meta.dirname, "..", "skills", "use-codex", "scripts", "codex-task");

const STUB = `#!/bin/sh
out=""
prev=""
for a in "$@"; do
  if [ "$prev" = "--output-last-message" ]; then out="$a"; fi
  prev="$a"
done
if [ -n "$CODEX_STUB_ARGV" ]; then printf '%s\\n' "$@" > "$CODEX_STUB_ARGV"; fi
echo "session id: 019fe000-0000-7000-8000-0000000000ab"
case "$*" in *SLEEP*) sleep 30 ;; esac
if [ -n "$out" ]; then echo "STUB-REPORT" > "$out"; fi
`;

let binDir: string;
let stateDir: string;
let workspace: string;

function run(args: string[], extraEnv: Record<string, string> = {}) {
  return spawnSync("node", [SCRIPT, ...args], {
    cwd: workspace,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${binDir}:${process.env.PATH}`,
      XDG_STATE_HOME: stateDir,
      ...extraEnv
    }
  });
}

function argvFile(name: string) {
  return join(stateDir, `${name}.argv`);
}

function recordedArgs(name: string) {
  return readFileSync(argvFile(name), "utf8").trim().split("\n");
}

async function waitDone(jobId: string, ms = 20000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const status = run(["status", jobId]);
    if (!/running/.test(status.stdout)) return status.stdout;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`job ${jobId} still running after ${ms}ms`);
}

beforeAll(() => {
  binDir = mkdtempSync(join(tmpdir(), "codex-task-stub-"));
  stateDir = mkdtempSync(join(tmpdir(), "codex-task-state-"));
  workspace = mkdtempSync(join(tmpdir(), "codex-task-ws-"));
  writeFileSync(join(binDir, "codex"), STUB);
  chmodSync(join(binDir, "codex"), 0o755);
  execFileSync("git", ["init", "--quiet", workspace]);
});

describe("codex-task pins", () => {
  it("refuses a task naming no model", () => {
    const result = run(["task", "--effort", "low", "do the thing"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/--model is required/);
  });

  it("refuses a task naming no effort", () => {
    const result = run(["task", "--model", "gpt-5.6-luna", "do the thing"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/--effort is required/);
  });
});

describe("codex-task assembly", () => {
  it("runs a foreground task unsandboxed by default and prints the report and session id", () => {
    const result = run(
      ["task", "--model", "gpt-5.6-luna", "--effort", "low", "do the thing"],
      { CODEX_STUB_ARGV: argvFile("fg") }
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("STUB-REPORT");
    expect(result.stdout).toContain("019fe000-0000-7000-8000-0000000000ab");
    const args = recordedArgs("fg");
    expect(args[0]).toBe("exec");
    expect(args).toContain("--model");
    expect(args).toContain("gpt-5.6-luna");
    expect(args).toContain('model_reasoning_effort="low"');
    expect(args[args.indexOf("--sandbox") + 1]).toBe("danger-full-access");
    expect(args[args.length - 1]).toBe("do the thing");
  });

  it("maps --read-only to the read-only sandbox", () => {
    const result = run(
      ["task", "--model", "gpt-5.6-luna", "--effort", "low", "--read-only", "read the thing"],
      { CODEX_STUB_ARGV: argvFile("ro") }
    );
    expect(result.status).toBe(0);
    const args = recordedArgs("ro");
    expect(args[args.indexOf("--sandbox") + 1]).toBe("read-only");
  });
});

describe("codex-task background cycle", () => {
  it("returns a receipt, watches to done, and reads the report", async () => {
    const dispatch = run([
      "task", "--background", "--model", "gpt-5.6-luna", "--effort", "low", "background thing"
    ]);
    expect(dispatch.status).toBe(0);
    const jobId = dispatch.stdout.match(/^(task-[a-z0-9-]+) started in the background/)?.[1];
    expect(jobId).toBeTruthy();

    const status = await waitDone(jobId!);
    expect(status).toMatch(/done \(exit 0\)/);

    const result = run(["result", jobId!]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("STUB-REPORT");
    expect(result.stdout).toContain("019fe000-0000-7000-8000-0000000000ab");
  });

  it("resumes the workspace's last session with the pins replayed", () => {
    const result = run(
      ["task", "--resume-last", "--model", "gpt-5.6-luna", "--effort", "low", "continue the thing"],
      { CODEX_STUB_ARGV: argvFile("resume") }
    );
    expect(result.status).toBe(0);
    const args = recordedArgs("resume");
    expect(args[0]).toBe("exec");
    expect(args[1]).toBe("resume");
    expect(args[2]).toBe("019fe000-0000-7000-8000-0000000000ab");
    expect(args).toContain("--model");
    expect(args).toContain('model_reasoning_effort="low"');
    expect(args).toContain('sandbox_mode="danger-full-access"');
  });

  it("cancels a running job", async () => {
    const dispatch = run([
      "task", "--background", "--model", "gpt-5.6-luna", "--effort", "low", "SLEEP forever"
    ]);
    const jobId = dispatch.stdout.match(/^(task-[a-z0-9-]+) /)?.[1];
    expect(jobId).toBeTruthy();

    const cancel = run(["cancel", jobId!]);
    expect(cancel.status).toBe(0);
    const status = await waitDone(jobId!);
    expect(status).toMatch(/cancelled/);
  });
});
