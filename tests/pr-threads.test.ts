// The pr-threads script: one place assembles every `gh api graphql` call for a
// PR's review threads, and --dry-run exposes the assembly for pinning. The same
// pattern as scripts/codex-exec, so the assertions mirror codex-exec.test.ts.
// Each subcommand pins the full { command, argv } object so a mutated query,
// missing flag, or swapped field fails, not just a substring probe.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

// The exact query strings the script assembles. Pinned here so a query mutation
// (dropped pagination, wrong operation, missing field) fails the deepEqual.
const LIST_QUERY =
  "query($owner: String!, $name: String!, $pr: Int!, $endCursor: String) {\n" +
  "  repository(owner: $owner, name: $name) {\n" +
  "    pullRequest(number: $pr) {\n" +
  "      reviewThreads(first: 100, after: $endCursor) {\n" +
  "        pageInfo { hasNextPage endCursor }\n" +
  "        nodes { id isResolved path line }\n" +
  "      }\n" +
  "    }\n" +
  "  }\n" +
  "}";

const REPLY_QUERY =
  "mutation($threadId: ID!, $body: String!) {\n" +
  "  addPullRequestReviewThreadReply(input: {pullRequestReviewThreadId: $threadId, body: $body}) {\n" +
  "    comment { id url }\n" +
  "  }\n" +
  "}";

const RESOLVE_QUERY =
  "mutation($threadId: ID!) {\n" +
  "  resolveReviewThread(input: {threadId: $threadId}) {\n" +
  "    thread { id isResolved }\n" +
  "  }\n" +
  "}";

describe("pr-threads assembly", () => {
  it("assembles the paginated reviewThreads query for list, with no --jq (gh forbids it with --slurp)", () => {
    const { status, raw } = dryRun("list", "--pr", "42", "--repo", "owner/name");
    expect(status).toBe(0);
    expect(raw).toEqual({
      command: "gh",
      argv: [
        "api", "graphql", "--paginate", "--slurp",
        "-f", "query=" + LIST_QUERY,
        "-f", "owner=owner",
        "-f", "name=name",
        "-F", "pr=42",
      ],
    });
  });

  it("paginates list: --paginate/--slurp flags and pageInfo/endCursor in the query", () => {
    const { raw } = dryRun("list", "--pr", "42", "--repo", "owner/name");
    const { argv } = raw;
    expect(argv).toContain("--paginate");
    expect(argv).toContain("--slurp");
    const query = argv.find((a: string) => a.startsWith("query="));
    expect(query).toContain("$endCursor: String");
    expect(query).toContain("after: $endCursor");
    expect(query).toContain("pageInfo { hasNextPage endCursor }");
  });

  it("flattens the slurped pages to one thread array on a live list run", () => {
    // A stub gh on PATH returns two slurped pages; list must emit one flat
    // array across them, projected to {id, isResolved, path, line}.
    const dir = mkdtempSync(join(tmpdir(), "pr-threads-gh-stub-"));
    try {
      const page = (id: string) => ({
        data: { repository: { pullRequest: { reviewThreads: { nodes: [
          { id, isResolved: id === "T_1", path: "src/a.ts", line: 3, extra: "dropped" },
        ] } } } },
      });
      writeFileSync(
        join(dir, "gh"),
        "#!/usr/bin/env node\nprocess.stdout.write(JSON.stringify(" +
          JSON.stringify([page("T_1"), page("T_2")]) + "));\n",
        { mode: 0o755 },
      );
      const result = spawnSync("node", [SCRIPT, "list", "--pr", "42", "--repo", "owner/name"], {
        encoding: "utf-8",
        env: { ...process.env, PATH: dir + ":" + process.env.PATH },
      });
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout)).toEqual([
        { id: "T_1", isResolved: true, path: "src/a.ts", line: 3 },
        { id: "T_2", isResolved: false, path: "src/a.ts", line: 3 },
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("assembles the addPullRequestReviewThreadReply mutation for reply", () => {
    const { status, raw } = dryRun("reply", "--thread-id", "T_abc", "--body", "fixed in a1b2c3");
    expect(status).toBe(0);
    expect(raw).toEqual({
      command: "gh",
      argv: [
        "api", "graphql",
        "-f", "query=" + REPLY_QUERY,
        "-f", "threadId=T_abc",
        "-f", "body=fixed in a1b2c3",
      ],
    });
  });

  it("assembles the resolveReviewThread mutation for resolve", () => {
    const { status, raw } = dryRun("resolve", "--thread-id", "T_abc");
    expect(status).toBe(0);
    expect(raw).toEqual({
      command: "gh",
      argv: [
        "api", "graphql",
        "-f", "query=" + RESOLVE_QUERY,
        "-f", "threadId=T_abc",
      ],
    });
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
    expect(raw).toEqual({
      command: "gh",
      argv: [
        "api", "repos/owner/name/pulls/42/comments",
        "-f", "body=please fix",
        "-f", "commit_id=abc123",
        "-f", "path=src/foo.ts",
        "-F", "line=10",
      ],
    });
  });

  it("emits -f side=<value> for comment when --side is LEFT or RIGHT", () => {
    for (const side of ["LEFT", "RIGHT"]) {
      const { status, raw } = dryRun(
        "comment",
        "--pr", "42",
        "--repo", "owner/name",
        "--commit", "abc123",
        "--path", "src/foo.ts",
        "--line", "10",
        "--side", side,
        "--body", "please fix",
      );
      expect(status).toBe(0);
      expect(raw).toEqual({
        command: "gh",
        argv: [
          "api", "repos/owner/name/pulls/42/comments",
          "-f", "body=please fix",
          "-f", "commit_id=abc123",
          "-f", "path=src/foo.ts",
          "-F", "line=10",
          "-f", "side=" + side,
        ],
      });
    }
  });

  it("emits no side field for comment when --side is absent", () => {
    const { raw } = dryRun(
      "comment",
      "--pr", "42",
      "--repo", "owner/name",
      "--commit", "abc123",
      "--path", "src/foo.ts",
      "--line", "10",
      "--body", "please fix",
    );
    expect(raw.argv.some((a: string) => a.startsWith("side="))).toBe(false);
  });

  it("rejects --side values other than LEFT or RIGHT", () => {
    const bad = dryRun(
      "comment",
      "--pr", "42",
      "--repo", "owner/name",
      "--commit", "abc123",
      "--path", "src/foo.ts",
      "--line", "10",
      "--side", "BOTH",
      "--body", "please fix",
    );
    expect(bad.status).toBe(2);
    expect(bad.stderr).toMatch(/--side must be LEFT or RIGHT/);
  });

  it("reads the body from a file when --body-file is given", () => {
    const { status, raw } = dryRun(
      "reply",
      "--thread-id", "T_abc",
      "--body-file", "/tmp/reply.md",
    );
    expect(status).toBe(0);
    expect(raw).toEqual({
      command: "gh",
      argv: [
        "api", "graphql",
        "-f", "query=" + REPLY_QUERY,
        "-f", "threadId=T_abc",
        "-F", "body=@/tmp/reply.md",
      ],
    });
  });

  it("rejects an empty --body and an empty --body-file", () => {
    const emptyBody = dryRun("reply", "--thread-id", "T_abc", "--body", "");
    expect(emptyBody.status).toBe(2);
    expect(emptyBody.stderr).toMatch(/--body must not be empty/);
    const emptyFile = dryRun("reply", "--thread-id", "T_abc", "--body-file", "");
    expect(emptyFile.status).toBe(2);
    expect(emptyFile.stderr).toMatch(/--body-file must not be empty/);
  });

  it("rejects --body and --body-file given together, and neither given", () => {
    const both = dryRun(
      "reply",
      "--thread-id", "T_abc",
      "--body", "text",
      "--body-file", "/tmp/reply.md",
    );
    expect(both.status).toBe(2);
    expect(both.stderr).toMatch(/exactly one of --body or --body-file/);
    const neither = dryRun("reply", "--thread-id", "T_abc");
    expect(neither.status).toBe(2);
    expect(neither.stderr).toMatch(/exactly one of --body or --body-file/);
  });

  it("rejects a comment body given both ways or neither", () => {
    const base = [
      "comment",
      "--pr", "42",
      "--repo", "owner/name",
      "--commit", "abc123",
      "--path", "src/foo.ts",
      "--line", "10",
    ];
    expect(dryRun(...base).status).toBe(2);
    expect(dryRun(...base, "--body", "x", "--body-file", "/tmp/c.md").status).toBe(2);
  });

  it("rejects malformed --line, --pr, and --repo before assembling any call", () => {
    const cases: string[][] = [
      ["comment", "--pr", "42", "--repo", "owner/name", "--commit", "abc123", "--path", "src/foo.ts", "--line", "@/etc/passwd", "--body", "x"],
      ["comment", "--pr", "42", "--repo", "owner/name", "--commit", "abc123", "--path", "src/foo.ts", "--line", "abc", "--body", "x"],
      ["list", "--pr", "0", "--repo", "owner/name"],
      ["list", "--pr", "-3", "--repo", "owner/name"],
      ["list", "--pr", "42", "--repo", "owner/name/extra"],
    ];
    for (const args of cases) {
      expect(dryRun(...args).status).toBe(2);
    }
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
});
