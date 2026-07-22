// The codex dispatch module: one place assembles every `codex exec`
// invocation, and --dry-run exposes the assembly for pinning. The two resume
// traps (resume drops -s and -C silently) are the reason this script exists;
// both are asserted here.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const SCRIPT = join(import.meta.dirname, "..", "scripts", "codex-exec");

// A process is alive if signal 0 does not throw ESRCH.
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

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

  it("enables the native web_search tool with --search, fresh and on resume", () => {
    const { status, argv } = dryRun("--search");
    expect(status).toBe(0);
    expect(argv).toContain("tools.web_search=true");

    const resumed = dryRun("--search", "--resume", "thread-123");
    expect(resumed.status).toBe(0);
    expect(resumed.argv).toContain("tools.web_search=true");

    expect(dryRun().argv).not.toContain("tools.web_search=true");
  });

  it("adds --output-schema for schema-constrained dispatches", () => {
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
// authority; these pin every exit-0 outcome that is not a finished run.
describe("codex-exec completion verification", () => {
  const STUB = `#!/usr/bin/env node
const { writeFileSync } = require("node:fs");
const args = process.argv.slice(2);
const out = args[args.indexOf("-o") + 1];
const resumed = args[1] === "resume" ? args[2] : null;
const mode = process.env.CODEX_STUB_MODE ?? "ok";
const threadId = mode === "fork" ? "t-forked" : (resumed ?? "t-fresh");
const emit = (event) => process.stdout.write(JSON.stringify(event) + "\\n");
const okOut = () => writeFileSync(out, '{"word":"ok"}');
const okUsage = { input_tokens: 1, output_tokens: 1, cached_input_tokens: 0, reasoning_output_tokens: 0 };
if (mode === "hang") setTimeout(() => {}, 60000);
else if (mode === "raw") {
  // Emit a caller-supplied byte sequence verbatim, then a valid final message.
  process.stdout.write(process.env.CODEX_STUB_RAW ?? "");
  okOut();
  process.exit(0);
}
else if (mode === "descendant") {
  // Spawn a detached descendant that inherits fd 1, outlives codex, and writes
  // a late line to the shared pipe after codex has exited.
  emit({ type: "thread.started", thread_id: threadId });
  emit({ type: "item.completed", item: { type: "agent_message", text: "done" } });
  emit({ type: "turn.completed", usage: okUsage });
  okOut();
  const { spawn } = require("node:child_process");
  const grandchild = spawn(
    process.execPath,
    ["-e", "setTimeout(() => { try { require('fs').writeSync(1, 'LATE-LINE-SHOULD-NOT-APPEAR\\\\n'); } catch {} }, 4000)"],
    { detached: true, stdio: ["ignore", 1, "ignore"] },
  );
  grandchild.unref();
  process.exit(0);
}
else if (mode === "reshaped") {
  // Load-bearing events with a missing field, followed by a valid pair so the
  // run still verifies as finished.
  emit({ type: "thread.started" });
  emit({ type: "item.completed", item: { type: "command_execution", exit_code: 0 } });
  emit({ type: "item.completed", item: { type: "command_execution", command: "ls", exit_code: "]0;x" } });
  emit({ type: "turn.completed" });
  emit({ type: "item.completed", item: { type: "agent_message", text: "ok" } });
  emit({ type: "turn.completed", usage: okUsage });
  okOut();
  process.exit(0);
}
else if (mode === "ansi") {
  // agent text carrying an OSC title sequence and an SGR color sequence; the
  // JSON serializer escapes the ESC and BEL bytes on the wire.
  const esc = String.fromCharCode(27);
  const bel = String.fromCharCode(7);
  emit({ type: "thread.started", thread_id: threadId });
  emit({ type: "item.completed", item: { type: "agent_message", text: esc + "]0;pwned" + bel + esc + "[31mRED" + esc + "[0m" } });
  emit({ type: "turn.completed", usage: okUsage });
  okOut();
  process.exit(0);
}
else if (mode === "progress") {
  emit({ type: "thread.started", thread_id: threadId });
  emit({ type: "item.completed", item: { type: "command_execution", command: "npm test", exit_code: 0 } });
  emit({ type: "item.completed", item: { type: "agent_message", text: "working on it" } });
  emit({ type: "item.completed", item: { type: "file_change", changes: [{ path: "a.ts" }, { path: "b.ts" }] } });
  emit({ type: "turn.completed", usage: { input_tokens: 100, cached_input_tokens: 10, output_tokens: 5, reasoning_output_tokens: 0 } });
  okOut();
  process.exit(0);
}
else if (mode === "error-progress") {
  emit({ type: "thread.started", thread_id: threadId });
  emit({ type: "error", message: "sandbox denied the write" });
  emit({ type: "turn.completed", usage: {} });
  okOut();
  process.exit(0);
}
else if (mode === "slow") {
  // Emit one line, then a gap longer than the heartbeat interval.
  emit({ type: "thread.started", thread_id: threadId });
  setTimeout(() => {
    emit({ type: "item.completed", item: { type: "agent_message", text: "done" } });
    emit({ type: "turn.completed", usage: {} });
    okOut();
    process.exit(0);
  }, 500);
}
else {
  emit({ type: "thread.started", thread_id: threadId });
  if (mode === "fail") {
    emit({ type: "turn.failed", error: { message: "usage limit reached" } });
    process.exit(1);
  }
  emit({ type: "item.completed", item: { type: "agent_message", text: "done" } });
  if (mode !== "no-turn-completed") emit({ type: "turn.completed", usage: {} });
  if (mode === "bad-json") writeFileSync(out, "not json");
  else if (mode !== "empty-out") okOut();
  process.exit(0);
}
`;

  const dirs: string[] = [];
  afterAll(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  });

  function runStubbed(
    mode: string,
    options: {
      schema?: boolean;
      resume?: string;
      staleOut?: string;
      stallMs?: number;
      heartbeatMs?: number;
      raw?: string;
    } = {},
  ) {
    const dir = mkdtempSync(join(tmpdir(), "codex-exec-test-"));
    dirs.push(dir);
    writeFileSync(join(dir, "codex"), STUB, { mode: 0o755 });
    writeFileSync(join(dir, "brief.md"), "the brief");
    if (options.staleOut !== undefined) writeFileSync(join(dir, "out.txt"), options.staleOut);
    const args = [
      "--model", "gpt-5.6-sol",
      "--effort", "high",
      "--sandbox", "read-only",
      "--cwd", dir,
      "--brief", join(dir, "brief.md"),
      "--out", join(dir, "out.txt"),
      "--events", join(dir, "events.jsonl"),
    ];
    if (options.schema) {
      writeFileSync(join(dir, "schema.json"), "{}");
      args.push("--schema", join(dir, "schema.json"));
    }
    if (options.resume) args.push("--resume", options.resume);
    const result = spawnSync("node", [SCRIPT, ...args], {
      encoding: "utf-8",
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        CODEX_STUB_MODE: mode,
        CODEX_STUB_RAW: options.raw ?? "",
        CODEX_EXEC_STALL_MS: String(options.stallMs ?? 300000),
        CODEX_EXEC_HEARTBEAT_MS: String(options.heartbeatMs ?? 60000),
      },
    });
    return Object.assign(result, { dir });
  }

  it("passes a clean run, fresh and resumed", () => {
    expect(runStubbed("ok").status).toBe(0);
    expect(runStubbed("ok", { resume: "t-123" }).status).toBe(0);
  });

  it("fails an exit-0 run that never emitted turn.completed", () => {
    const result = runStubbed("no-turn-completed");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/without a turn.completed event/);
  });

  it("fails an exit-0 run that wrote no final message, even over a stale out file", () => {
    const empty = runStubbed("empty-out");
    expect(empty.status).toBe(1);
    expect(empty.stderr).toMatch(/wrote no final message/);

    // A prior dispatch's final message at the same --out path must not pass.
    const stale = runStubbed("empty-out", { staleOut: '{"word":"stale"}' });
    expect(stale.status).toBe(1);
    expect(stale.stderr).toMatch(/wrote no final message/);
  });

  it("fails a schema'd run whose out file is not JSON", () => {
    const result = runStubbed("bad-json", { schema: true });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not valid JSON/);
  });

  it("fails a resume that forked a new session instead of continuing the thread", () => {
    const result = runStubbed("fork", { resume: "t-123" });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/started a new session t-forked/);
  });

  it("surfaces the turn.failed reason from the event stream on a failed run", () => {
    const result = runStubbed("fail");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/usage limit reached/);
  });

  it("kills a run that emits no stdout line for the stall window and reports the stall", () => {
    const result = runStubbed("hang", { stallMs: 400 });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/without event activity/);
  });

  // stdout is piped through the parent: every raw line is appended to the
  // events file verbatim, and each line is also parsed for a progress line on
  // stderr. Progress is display-only and never changes exit semantics.
  it("prints a progress line to stderr for each event kind", () => {
    const result = runStubbed("progress");
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/codex-exec: thread t-fresh/);
    expect(result.stderr).toMatch(/codex-exec: \$ npm test \(exit 0\)/);
    expect(result.stderr).toMatch(/codex-exec: agent:/);
    expect(result.stderr).toMatch(/working on it/);
    expect(result.stderr).toMatch(/codex-exec: files a\.ts, b\.ts/);
    expect(result.stderr).toMatch(/codex-exec: turn complete, tokens in=100 out=5 cached=10 reasoning=0/);
  });

  it("prints the turn.failed/error progress line, distinct from the post-run reason writer", () => {
    // Exit 0 so the post-run reason writer (status !== 0) stays silent: the
    // reason on stderr can only come from the display-only error progress
    // branch, so a broken or emptied branch fails this test.
    const result = runStubbed("error-progress");
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/codex-exec: sandbox denied the write/);
  });

  it("writes the events file byte-identical to the stub's stdout, malformed and unknown lines included", () => {
    const raw =
      '{"type":"thread.started","thread_id":"t-fresh"}\n' +
      "this is not valid json\n" +
      '{"type":"mystery.event","n":1}\n' +
      '{"type":"item.completed","item":{"type":"agent_message","text":"OK"}}\n' +
      '{"type":"turn.completed","usage":{"input_tokens":1,"cached_input_tokens":0,"output_tokens":2,"reasoning_output_tokens":0}}\n';
    const result = runStubbed("raw", { raw });
    expect(result.status).toBe(0);
    expect(readFileSync(join(result.dir, "events.jsonl"), "utf8")).toBe(raw);
  });

  it("exits 0 on a stream of only unknown and malformed events with a valid turn.completed", () => {
    const raw =
      '{"type":"wibble"}\n' +
      '{"type":"wobble","data":123}\n' +
      "not even json\n" +
      '{"type":"turn.completed","usage":{}}\n';
    const result = runStubbed("raw", { raw });
    expect(result.status).toBe(0);
  });

  it("emits a heartbeat when no stdout line arrives within the interval", () => {
    const result = runStubbed("slow", { heartbeatMs: 100 });
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/codex-exec: still running, \d+s elapsed, last event \d+s ago/);
  });

  it("exits 0 when a descendant inherits fd 1, outlives codex, and writes a late line", () => {
    // The descendant holds the pipe open past codex's exit, so the drain waits
    // its bound and then detaches and destroys stdout. codex-exec must exit 0
    // (not hang, not fail by write-after-end) and the late line must not reach
    // the record.
    const result = runStubbed("descendant");
    expect(result.status).toBe(0);
    const events = readFileSync(join(result.dir, "events.jsonl"), "utf8");
    expect(events).toMatch(/"type":"turn.completed"/);
    expect(events).not.toMatch(/LATE-LINE-SHOULD-NOT-APPEAR/);
  });

  it("prints nothing for reshaped load-bearing events and still exits 0", () => {
    const result = runStubbed("reshaped");
    expect(result.status).toBe(0);
    expect(result.stderr).not.toMatch(/undefined/);
    expect(result.stderr).not.toMatch(/codex-exec: thread\b/); // thread.started with no id
    expect(result.stderr).not.toMatch(/codex-exec: \$/); // command_execution with no command
    expect(result.stderr).not.toMatch(/in=0 out=0 cached=0 reasoning=0/); // no zeroed usage
    expect(result.stderr).toMatch(/turn complete, tokens in=1/); // the valid turn.completed prints
  });

  it("sanitizes ANSI/OSC control sequences on stderr while the events file keeps the bytes", () => {
    const result = runStubbed("ansi");
    expect(result.status).toBe(0);
    // No raw ESC byte reaches the terminal, and the OSC payload is gone.
    const esc = String.fromCharCode(27);
    expect(result.stderr).not.toContain(esc);
    expect(result.stderr).not.toContain("pwned");
    expect(result.stderr).toMatch(/agent:\nRED/); // the visible text survives
    // The events file preserves codex's original bytes (the stub JSON
    // serializes ESC as the six characters backslash u 0 0 1 b).
    const events = readFileSync(join(result.dir, "events.jsonl"), "utf8");
    expect(events).toContain("\\u001b");
  });

  it("kills codex and its subtree when a signal reaches it, leaving no orphan", async () => {
    // codex spawns a node-plus-tools subtree; a kill of codex's pid alone
    // orphans it. codex runs as a group leader and every kill targets the
    // group, so a signal to codex-exec takes the whole tree down. The stub
    // spawns a grandchild, both record their pid, both sleep unbounded; after
    // SIGTERM reaches codex-exec, neither pid is still alive.
    const dir = mkdtempSync(join(tmpdir(), "codex-exec-test-"));
    dirs.push(dir);
    const codexPidFile = join(dir, "codex.pid");
    const grandchildPidFile = join(dir, "grandchild.pid");
    const groupStub = `#!/usr/bin/env node
const { writeFileSync } = require("node:fs");
const { spawn } = require("node:child_process");
const out = process.argv.slice(2)[process.argv.slice(2).indexOf("-o") + 1];
writeFileSync(out, "");
writeFileSync(${JSON.stringify(codexPidFile)}, String(process.pid));
// A grandchild in the same process group, sleeping unbounded.
const grandchild = spawn(process.execPath, ["-e", "setInterval(() => {}, 1e9)"], { stdio: "ignore" });
writeFileSync(${JSON.stringify(grandchildPidFile)}, String(grandchild.pid));
process.stdout.write(JSON.stringify({ type: "thread.started", thread_id: "t-grp" }) + "\\n");
setInterval(() => {}, 1e9);
`;
    writeFileSync(join(dir, "codex"), groupStub, { mode: 0o755 });
    writeFileSync(join(dir, "brief.md"), "the brief");
    const child = spawn(
      "node",
      [
        SCRIPT,
        "--model", "gpt-5.6-sol",
        "--effort", "high",
        "--sandbox", "read-only",
        "--cwd", dir,
        "--brief", join(dir, "brief.md"),
        "--out", join(dir, "out.txt"),
        "--events", join(dir, "events.jsonl"),
      ],
      { env: { ...process.env, PATH: `${dir}:${process.env.PATH}` }, stdio: "ignore" },
    );
    // Wait until both pids are recorded (codex is up and has spawned its child).
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      if (existsSync(codexPidFile) && existsSync(grandchildPidFile)) break;
      await new Promise((r) => setTimeout(r, 50));
    }
    const codexPid = Number(readFileSync(codexPidFile, "utf8"));
    const grandchildPid = Number(readFileSync(grandchildPidFile, "utf8"));
    expect(alive(codexPid)).toBe(true);
    expect(alive(grandchildPid)).toBe(true);

    child.kill("SIGTERM");
    await new Promise((resolve) => child.on("exit", resolve));
    // Give the group kill a beat to propagate before checking liveness.
    await new Promise((r) => setTimeout(r, 300));
    expect(alive(codexPid)).toBe(false);
    expect(alive(grandchildPid)).toBe(false);
  });

  it("keeps its exit semantics when the stderr destination is closed early", async () => {
    const dir = mkdtempSync(join(tmpdir(), "codex-exec-test-"));
    dirs.push(dir);
    writeFileSync(join(dir, "codex"), STUB, { mode: 0o755 });
    writeFileSync(join(dir, "brief.md"), "the brief");
    const args = [
      "--model", "gpt-5.6-sol",
      "--effort", "high",
      "--sandbox", "read-only",
      "--cwd", dir,
      "--brief", join(dir, "brief.md"),
      "--out", join(dir, "out.txt"),
      "--events", join(dir, "events.jsonl"),
    ];
    const child = spawn("node", [SCRIPT, ...args], {
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        CODEX_STUB_MODE: "progress",
        CODEX_EXEC_STALL_MS: "300000",
        CODEX_EXEC_HEARTBEAT_MS: "60000",
      },
      stdio: ["ignore", "ignore", "pipe"],
    });
    // Close the read end so every progress write on the parent's stderr hits a
    // broken pipe. The installed error listener swallows the EPIPE and the run
    // finishes with its normal exit code.
    child.stderr.destroy();
    const status = await new Promise<number | null>((resolve) =>
      child.on("exit", (code) => resolve(code)),
    );
    expect(status).toBe(0);
  });
});
