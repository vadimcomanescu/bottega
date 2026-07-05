// End-to-end: the real CLI, a real git repo, exit codes and stdout as the
// contract. Covers what the library tests can't — the git plumbing behind
// stale-qa and the flag wiring.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const BIN = join(import.meta.dirname, "..", "bin", "bottega.js");

function bottega(cwd: string, ...args: string[]) {
  const result = spawnSync("node", [BIN, ...args], { cwd, encoding: "utf-8" });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf-8" }).trim();
}

const cleanRecord = {
  slice: "a-spine",
  builder: { family: "codex", model: "gpt-5.5" },
  rounds: [{ round: 1, reviewer: { family: "claude", model: "opus-4.8" }, verdict: "clean" }],
};

describe("bottega verify --delivery", () => {
  let repo: string;
  let recordsDir: string;

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), "bottega-delivery-"));
    git(repo, "init", "-q");
    git(repo, "config", "user.email", "t@t");
    git(repo, "config", "user.name", "t");
    mkdirSync(join(repo, "features"));
    writeFileSync(join(repo, "features", "a.feature"), "Feature: a\n");
    expect(bottega(repo, "sign").code).toBe(0);
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "bottega: sign commission");
    recordsDir = join(repo, ".bottega", "run", "records");
    mkdirSync(recordsDir, { recursive: true });
    writeFileSync(join(recordsDir, "a-spine.json"), JSON.stringify(cleanRecord));
    writeFileSync(
      join(recordsDir, "qa.json"),
      JSON.stringify({ verified_commit: git(repo, "rev-parse", "HEAD") }),
    );
  });

  afterEach(() => rmSync(repo, { recursive: true, force: true }));

  it("exits 0 clean when records hold and nothing landed after QA", () => {
    expect(bottega(repo, "verify", "--delivery")).toMatchObject({ code: 0, out: "clean\n" });
  });

  it("plain verify ignores records entirely", () => {
    writeFileSync(join(recordsDir, "a-spine.json"), "{ corrupt");
    expect(bottega(repo, "verify")).toMatchObject({ code: 0, out: "clean\n" });
  });

  it("exits 1 stale-qa on a product commit after QA, but not on bookkeeping", () => {
    writeFileSync(join(repo, "late.txt"), "x");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "bottega: runstate — evidence archived");
    expect(bottega(repo, "verify", "--delivery").code).toBe(0);

    writeFileSync(join(repo, "late2.txt"), "x");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "fix-late: patch the toast (green)");
    const result = bottega(repo, "verify", "--delivery");
    expect(result.code).toBe(1);
    expect(result.out).toMatch(/^stale-qa .*fix-late/m);
  });

  it("exits 1 per record violation, naming the code", () => {
    writeFileSync(
      join(recordsDir, "b-bad.json"),
      JSON.stringify({
        slice: "b-bad",
        builder: { family: "claude", model: "claude-fable-5" },
        rounds: [
          { round: 1, reviewer: { family: "claude", model: "opus-4.8" }, verdict: "findings" },
        ],
      }),
    );
    const result = bottega(repo, "verify", "--delivery");
    expect(result.code).toBe(1);
    for (const code of ["same-family-review", "unreviewed-fix", "fable-worker"]) {
      expect(result.out).toMatch(new RegExp(`^${code} `, "m"));
    }
  });

  it("exits 1 missing-records when the audit has nothing to read", () => {
    rmSync(recordsDir, { recursive: true });
    const result = bottega(repo, "verify", "--delivery");
    expect(result.code).toBe(1);
    expect(result.out).toMatch(/^missing-records /m);
  });

  it("exits 3 on a corrupt record", () => {
    writeFileSync(join(recordsDir, "a-spine.json"), "{ corrupt");
    const result = bottega(repo, "verify", "--delivery");
    expect(result.code).toBe(3);
    expect(result.err).toMatch(/corrupt run record/);
  });

  it("flags an unresolvable QA commit as stale-qa, not a crash", () => {
    writeFileSync(
      join(recordsDir, "qa.json"),
      JSON.stringify({ verified_commit: "0000000000000000000000000000000000000000" }),
    );
    const result = bottega(repo, "verify", "--delivery");
    expect(result.code).toBe(1);
    expect(result.out).toMatch(/^stale-qa .*not resolvable/m);
  });
});
