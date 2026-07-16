import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = join(import.meta.dirname, "..", "scripts", "claude-exec");
const SCHEMA = join(import.meta.dirname, "fixtures", "smoke.schema.json");
const HEAD_SHA = "a".repeat(40);
const TREE_SHA = "b".repeat(40);

const BASE = [
  "--role", "reviewer",
  "--cwd", "/tmp/review",
  "--brief", "/tmp/brief.md",
  "--out", "/tmp/out.json",
  "--events", "/tmp/events.json",
  "--head", HEAD_SHA,
  "--tree", TREE_SHA,
  "--schema", SCHEMA,
];

function dryRun(args: string[]) {
  return spawnSync("node", [SCRIPT, ...args, "--dry-run"], {
    encoding: "utf8",
  });
}

describe("claude-exec", () => {
  it("assembles one fresh, schema-bound Opus reviewer at the frozen target", () => {
    const result = dryRun(BASE);

    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.command).toBe("claude");
    expect(raw.argv).toContain("-p");
    expect(raw.argv).toContain("--safe-mode");
    expect(raw.argv).toContain("opus");
    expect(raw.argv).toContain("xhigh");
    expect(raw.argv).toContain("dontAsk");
    expect(raw.argv).toContain("Bash,Read,Glob,Grep");
    expect(raw.argv).toContain("--no-session-persistence");
    expect(raw.argv[raw.argv.indexOf("--json-schema") + 1]).toBe(
      readFileSync(SCHEMA, "utf8"),
    );
    expect(raw.route.timeoutMs).toBe(1_200_000);
    expect(raw.frozenTarget).toEqual({ headSha: HEAD_SHA, treeSha: TREE_SHA });
  });

  it("requires structured output and the complete reviewer target", () => {
    const withoutSchema = BASE.slice(0, -2);
    const missingSchema = dryRun(withoutSchema);
    expect(missingSchema.status).toBe(2);
    expect(missingSchema.stderr).toMatch(/--schema is required/i);

    const withoutTarget = BASE.filter((value, index) => (
      !["--head", "--tree"].includes(value)
      && !["--head", "--tree"].includes(BASE[index - 1] ?? "")
    ));
    const missingTarget = dryRun(withoutTarget);
    expect(missingTarget.status).toBe(2);
    expect(missingTarget.stderr).toMatch(/--head is required/i);
  });

  it("requires separate report and provenance paths", () => {
    const collision = [...BASE];
    collision[collision.indexOf("--events") + 1] = collision[
      collision.indexOf("--out") + 1
    ]!;
    const result = dryRun(collision);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/--out and --events.*distinct/i);
  });

  it.each([
    ["panelist", "xhigh", "Bash,Read,Glob,Grep"],
    ["judge", "high", ""],
  ])("keeps the external %s route cold and fixed", (role, effort, tools) => {
    const result = dryRun(BASE.map((value) => (
      value === "reviewer" ? role : value
    )));
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.argv).toContain("--no-session-persistence");
    expect(raw.route.model).toBe("opus");
    expect(raw.route.effort).toBe(effort);
    expect(raw.route.tools).toBe(tools);
  });

  it.each(["user-facing-builder", "qa", "docs"])(
    "rejects non-cross-family role %s",
    (role) => {
      const result = dryRun(BASE.map((value) => (
        value === "reviewer" ? role : value
      )));
      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(/unknown role/i);
    },
  );

  it("does not expose session resume options", () => {
    const result = dryRun([...BASE, "--resume", "session-123"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/resume|unknown option/i);
  });

  it("rejects an empty brief before spawning Claude", () => {
    const root = mkdtempSync(join(tmpdir(), "bottega-claude-brief-"));
    try {
      const brief = join(root, "brief.md");
      writeFileSync(brief, "  \n");
      const result = spawnSync("node", [
        SCRIPT,
        "--role", "panelist",
        "--cwd", root,
        "--brief", brief,
        "--out", join(root, "out.json"),
        "--events", join(root, "events.json"),
        "--schema", SCHEMA,
      ], { encoding: "utf8" });

      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(/brief is empty/i);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("records successful Opus usage and structured output", () => {
    const root = mkdtempSync(join(tmpdir(), "bottega-claude-success-"));
    try {
      const bin = join(root, "bin");
      mkdirSync(bin);
      const fakeClaude = join(bin, "claude");
      writeFileSync(fakeClaude, `#!/usr/bin/env node
if (process.argv.includes("--version")) {
  process.stdout.write("test-claude 1.0\\n");
} else {
  process.stdout.write(JSON.stringify({
    subtype: "success",
    is_error: false,
    modelUsage: { "claude-opus-4-8": { outputTokens: 1 } },
    structured_output: { status: "ok" },
  }));
}
`);
      chmodSync(fakeClaude, 0o755);

      const brief = join(root, "brief.md");
      const out = join(root, "out.json");
      const events = join(root, "events.json");
      writeFileSync(brief, "Return the schema.\n");
      const result = spawnSync("node", [
        SCRIPT,
        "--role", "panelist",
        "--cwd", root,
        "--brief", brief,
        "--out", out,
        "--events", events,
        "--schema", SCHEMA,
      ], {
        encoding: "utf8",
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
      });

      expect(result.status).toBe(0);
      expect(JSON.parse(readFileSync(out, "utf8"))).toEqual({ status: "ok" });
      const provenance = JSON.parse(readFileSync(events, "utf8"));
      expect(provenance.provider).toBe("claude");
      expect(provenance.cli_version).toBe("test-claude 1.0");
      expect(provenance.requested_role).toBe("panelist");
      expect(provenance.requested_route.model).toBe("opus");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a reviewer checkout that does not match the frozen target", () => {
    const root = mkdtempSync(join(tmpdir(), "bottega-claude-target-"));
    const repo = join(root, "repo");
    const review = join(root, "review");
    const bin = join(root, "bin");
    mkdirSync(repo);
    mkdirSync(bin);
    const git = (cwd: string, ...args: string[]) => spawnSync("git", args, {
      cwd,
      encoding: "utf8",
    });

    try {
      expect(git(repo, "init", "-q").status).toBe(0);
      expect(git(repo, "config", "user.name", "Bottega Test").status).toBe(0);
      expect(git(repo, "config", "user.email", "test@example.com").status).toBe(0);
      expect(git(repo, "config", "commit.gpgsign", "false").status).toBe(0);
      writeFileSync(join(repo, "tracked.txt"), "frozen\n");
      expect(git(repo, "add", "tracked.txt").status).toBe(0);
      expect(git(repo, "commit", "-qm", "frozen").status).toBe(0);
      expect(git(repo, "worktree", "add", "--detach", review, "HEAD").status).toBe(0);

      const fakeClaude = join(bin, "claude");
      writeFileSync(fakeClaude, `#!/usr/bin/env node
if (process.argv.includes("--version")) process.stdout.write("test-claude 1.0\\n");
else process.stdout.write(JSON.stringify({
  subtype: "success",
  is_error: false,
  modelUsage: { "claude-opus-4-8": { outputTokens: 1 } },
  structured_output: { status: "ok" },
}));
`);
      chmodSync(fakeClaude, 0o755);
      const brief = join(root, "brief.md");
      writeFileSync(brief, "Review the frozen target.\n");
      const treeSha = git(review, "rev-parse", "HEAD^{tree}").stdout.trim();
      const result = spawnSync("node", [
        SCRIPT,
        "--role", "reviewer",
        "--cwd", review,
        "--brief", brief,
        "--out", join(root, "out.json"),
        "--events", join(root, "events.json"),
        "--head", "0".repeat(40),
        "--tree", treeSha,
        "--schema", SCHEMA,
      ], {
        encoding: "utf8",
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
      });

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/does not match.*frozen target/i);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails when an adapter-owned output modifies the frozen target", () => {
    const root = mkdtempSync(join(tmpdir(), "bottega-claude-output-guard-"));
    const repo = join(root, "repo");
    const review = join(root, "review");
    const bin = join(root, "bin");
    mkdirSync(repo);
    mkdirSync(bin);
    const git = (cwd: string, ...args: string[]) => spawnSync("git", args, {
      cwd,
      encoding: "utf8",
    });

    try {
      expect(git(repo, "init", "-q").status).toBe(0);
      expect(git(repo, "config", "user.name", "Bottega Test").status).toBe(0);
      expect(git(repo, "config", "user.email", "test@example.com").status).toBe(0);
      expect(git(repo, "config", "commit.gpgsign", "false").status).toBe(0);
      writeFileSync(join(repo, "tracked.txt"), "frozen\n");
      expect(git(repo, "add", "tracked.txt").status).toBe(0);
      expect(git(repo, "commit", "-qm", "frozen").status).toBe(0);
      expect(git(repo, "worktree", "add", "--detach", review, "HEAD").status).toBe(0);

      const fakeClaude = join(bin, "claude");
      writeFileSync(fakeClaude, `#!/usr/bin/env node
if (process.argv.includes("--version")) process.stdout.write("test-claude 1.0\\n");
else process.stdout.write(JSON.stringify({
  subtype: "success",
  is_error: false,
  modelUsage: { "claude-opus-4-8": { outputTokens: 1 } },
  structured_output: { status: "ok" },
}));
`);
      chmodSync(fakeClaude, 0o755);
      const brief = join(root, "brief.md");
      const events = join(root, "events.json");
      writeFileSync(brief, "Return the schema.\n");
      const headSha = git(review, "rev-parse", "HEAD").stdout.trim();
      const treeSha = git(review, "rev-parse", "HEAD^{tree}").stdout.trim();

      const result = spawnSync("node", [
        SCRIPT,
        "--role", "reviewer",
        "--cwd", review,
        "--brief", brief,
        "--out", join(review, "tracked.txt"),
        "--events", events,
        "--head", headSha,
        "--tree", treeSha,
        "--schema", SCHEMA,
      ], {
        encoding: "utf8",
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
      });

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/frozen target|modified tracked files/i);
      expect(JSON.parse(readFileSync(events, "utf8")).frozen_target).toEqual({
        headSha,
        treeSha,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
