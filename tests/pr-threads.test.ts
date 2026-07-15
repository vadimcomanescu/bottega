// The pr-threads script: one place assembles every `gh api graphql` call for a
// PR's review threads, and --dry-run exposes the assembly for pinning. The same
// pattern as scripts/codex-exec, so the assertions mirror codex-exec.test.ts.
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = join(import.meta.dirname, "..", "scripts", "pr-threads");

function run(...args: string[]): { status: number | null; stderr: string; raw: any } {
  const result = spawnSync("node", [SCRIPT, ...args], { encoding: "utf-8" });
  const raw = result.status === 0 ? JSON.parse(result.stdout) : null;
  return { status: result.status, stderr: result.stderr, raw };
}

function dryRun(...args: string[]) {
  return run(...args, "--dry-run");
}

describe("pr-threads assembly", () => {
  it("assembles a reviewThreads query for list, projecting id/isResolved/path/line", () => {
    const { status, raw } = dryRun("list", "--pr", "42", "--repo", "owner/name");
    expect(status).toBe(0);
    expect(raw.command).toBe("gh");
    const { argv } = raw;
    expect(argv.slice(0, 2)).toEqual(["api", "graphql"]);
    expect(argv.some((a: string) => a.startsWith("query=") && a.includes("reviewThreads"))).toBe(true);
    expect(argv).toContain("owner=owner");
    expect(argv).toContain("name=name");
    expect(argv).toContain("-F");
    expect(argv).toContain("pr=42");
    expect(argv).toContain("--jq");
    expect(argv[argv.indexOf("--jq") + 1]).toContain("{id, isResolved, path, line}");
  });

  it("assembles an addPullRequestReviewThreadReply mutation for reply", () => {
    const { status, raw } = dryRun("reply", "--thread-id", "T_abc", "--body", "fixed in a1b2c3");
    expect(status).toBe(0);
    const { argv } = raw;
    expect(argv.slice(0, 2)).toEqual(["api", "graphql"]);
    expect(argv.some((a: string) => a.startsWith("query=") && a.includes("addPullRequestReviewThreadReply"))).toBe(true);
    expect(argv).toContain("threadId=T_abc");
    expect(argv).toContain("body=fixed in a1b2c3");
  });

  it("assembles a resolveReviewThread mutation for resolve", () => {
    const { status, raw } = dryRun("resolve", "--thread-id", "T_abc");
    expect(status).toBe(0);
    const { argv } = raw;
    expect(argv.slice(0, 2)).toEqual(["api", "graphql"]);
    expect(argv.some((a: string) => a.startsWith("query=") && a.includes("resolveReviewThread"))).toBe(true);
    expect(argv).toContain("threadId=T_abc");
  });

  it("assembles a REST inline review comment for comment", () => {
    const { status, raw } = dryRun(
      "comment",
      "--pr", "42",
      "--repo", "owner/name",
      "--commit", "abc123",
      "--path", "src/foo.ts",
      "--line", "10",
      "--body", "please fix",
    );
    expect(status).toBe(0);
    expect(raw.command).toBe("gh");
    const { argv } = raw;
    expect(argv.slice(0, 2)).toEqual(["api", "repos/owner/name/pulls/42/comments"]);
    expect(argv).toContain("-f");
    expect(argv).toContain("body=please fix");
    expect(argv).toContain("commit_id=abc123");
    expect(argv).toContain("path=src/foo.ts");
    expect(argv).toContain("-F");
    expect(argv).toContain("line=10");
  });

  it("rejects the comment subcommand with each required flag missing", () => {
    const flags: Record<string, string[]> = {
      pr: ["--pr", "42"],
      repo: ["--repo", "owner/name"],
      commit: ["--commit", "abc123"],
      path: ["--path", "src/foo.ts"],
      line: ["--line", "10"],
      body: ["--body", "please fix"],
    };
    for (const missing of Object.keys(flags)) {
      const args = Object.entries(flags)
        .filter(([name]) => name !== missing)
        .flatMap(([, pair]) => pair);
      expect(dryRun("comment", ...args).status).toBe(2);
    }
  });

  it("rejects an unknown subcommand", () => {
    const { status, stderr } = dryRun("close", "--thread-id", "T_abc");
    expect(status).toBe(2);
    expect(stderr).toMatch(/subcommand must be list, reply, resolve, or comment/);
  });

  it("rejects each subcommand with a required flag missing", () => {
    expect(dryRun("list", "--pr", "42").status).toBe(2);
    expect(dryRun("list", "--repo", "owner/name").status).toBe(2);
    expect(dryRun("reply", "--thread-id", "T_abc").status).toBe(2);
    expect(dryRun("reply", "--body", "text").status).toBe(2);
    expect(dryRun("resolve").status).toBe(2);
  });

  it("rejects a malformed repo and a non-numeric pr", () => {
    const badRepo = dryRun("list", "--pr", "42", "--repo", "nameonly");
    expect(badRepo.status).toBe(2);
    expect(badRepo.stderr).toMatch(/--repo must be owner\/name/);
    const badPr = dryRun("list", "--pr", "notanumber", "--repo", "owner/name");
    expect(badPr.status).toBe(2);
    expect(badPr.stderr).toMatch(/--pr must be a number/);
  });
});
