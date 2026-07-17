// The pr-claim script: one place assembles every `gh api` call for a PR's
// advisory session claim comment. --dry-run exposes the assembly for pinning,
// the same pattern as pr-threads. Beyond assembly, these tests drive real
// behavior against a stubbed `gh` on PATH: the stub is one node script
// configured through PR_CLAIM_STUB, returning canned responses per call type and
// logging every invocation so a test can assert the call sequence (which claims
// were deleted, whether a comment was posted).
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = join(import.meta.dirname, "..", "scripts", "pr-claim");
const LOGIN = "botlogin";

// One gh stub, configured per run through PR_CLAIM_STUB. It dispatches on argv
// to the same call shapes pr-claim assembles, logs each invocation, and returns
// the configured payload. The stub is stateful through a state file so a
// re-read after a post or delete reflects the write, which the post-write
// election depends on: a posted comment appears in the next comment list, and a
// deleted comment does not. deleteHttp lets a test force a 404; failOn forces a
// chosen call to fail so failure propagation can be checked. raceComment models
// a second session that posts concurrently: it appears in the comment list only
// after this run has posted, never in the first read.
const STUB = `#!/usr/bin/env node
const fs = require("fs");
const cfg = JSON.parse(process.env.PR_CLAIM_STUB || "{}");
const argv = process.argv.slice(2);
if (cfg.logFile) fs.appendFileSync(cfg.logFile, JSON.stringify(argv) + "\\n");
function out(v){ process.stdout.write(typeof v === "string" ? v : JSON.stringify(v)); process.exit(0); }
function state(){ try { return JSON.parse(fs.readFileSync(cfg.stateFile, "utf8")); } catch { return { posts: [], deleted: [] }; } }
function save(s){ if (cfg.stateFile) fs.writeFileSync(cfg.stateFile, JSON.stringify(s)); }
const joined = argv.join(" ");
if (cfg.failOn && joined.includes(cfg.failOn)) {
  process.stderr.write(cfg.failStderr || "gh: request failed\\n");
  process.exit(cfg.failStatus || 1);
}
const path = argv.find((a) => a.startsWith("repos/")) || "";
const methodIdx = argv.indexOf("--method");
const method = methodIdx >= 0 ? argv[methodIdx + 1] : null;
if (argv[0] === "api" && argv[1] === "user") out(cfg.user || { login: "${LOGIN}" });
if (method === "DELETE") {
  const http = cfg.deleteHttp || 204;
  if (http === 204) {
    const m = path.match(/comments\\/(\\d+)$/);
    if (m) { const s = state(); s.deleted.push(Number(m[1])); save(s); }
    process.exit(0);
  }
  process.stderr.write("gh: HTTP " + http + "\\n");
  process.exit(1);
}
if (argv.includes("-f") && /\\/issues\\/\\d+\\/comments$/.test(path)) {
  const id = cfg.createdId || 9001;
  const body = (argv[argv.indexOf("-f") + 1] || "").replace(/^body=/, "");
  const s = state();
  s.posts.push({ id, user: { login: "${LOGIN}" }, created_at: new Date().toISOString(), body });
  save(s);
  out(cfg.created || { id });
}
if (argv.includes("--paginate")) {
  const s = state();
  const deleted = new Set(s.deleted);
  const all = [...(cfg.comments || []), ...s.posts];
  if (cfg.raceComment && s.posts.length > 0) all.push(cfg.raceComment);
  out(all.filter((c) => !deleted.has(c.id)));
}
process.stderr.write("gh stub: unhandled: " + joined + "\\n");
process.exit(1);
`;

type StubConfig = {
  user?: { login: string };
  comments?: unknown[];
  created?: { id: number | string };
  createdId?: number;
  deleteHttp?: number;
  raceComment?: unknown;
  failOn?: string;
  failStatus?: number;
  failStderr?: string;
};

type RunResult = {
  status: number | null;
  stdout: string;
  stderr: string;
  raw: any;
  calls: string[][];
};

// Run pr-claim with a fresh gh stub on PATH. Returns the parsed stdout (raw,
// null when the script exited nonzero) and the logged gh call sequence.
function withStub(cfg: StubConfig, args: string[]): RunResult {
  const dir = mkdtempSync(join(tmpdir(), "pr-claim-gh-stub-"));
  const logFile = join(dir, "calls.log");
  const stateFile = join(dir, "state.json");
  try {
    writeFileSync(join(dir, "gh"), STUB, { mode: 0o755 });
    const result = spawnSync("node", [SCRIPT, ...args], {
      encoding: "utf-8",
      env: { ...process.env, PATH: dir + ":" + process.env.PATH, PR_CLAIM_STUB: JSON.stringify({ ...cfg, logFile, stateFile }) },
    });
    const calls = existsSync(logFile)
      ? readFileSync(logFile, "utf-8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
      : [];
    const raw = result.status === 0 ? JSON.parse(result.stdout) : null;
    return { status: result.status, stdout: result.stdout, stderr: result.stderr, raw, calls };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// A plain usage-error run: no stub needed, args go straight to the script.
function run(...args: string[]): { status: number | null; stderr: string; raw: any } {
  const result = spawnSync("node", [SCRIPT, ...args], { encoding: "utf-8" });
  const raw = result.status === 0 ? JSON.parse(result.stdout) : null;
  return { status: result.status, stderr: result.stderr, raw };
}

function dryRun(...args: string[]) {
  return run(...args, "--dry-run");
}

// Comment bodies exactly as the script assembles them, so assembly assertions
// and stubbed comment lists stay in lockstep with the one source of the format.
function claimBodyText(session: string, host: string, skill: string): string {
  const marker = "<!-- bottega-claim " + JSON.stringify({ session, host, skill }) + " -->";
  return marker + "\nBottega " + skill + " session " + session + " holds this PR from host " + host + ".";
}

function claimComment(id: number, session: string, host: string, skill: string, createdAt: string, login = LOGIN) {
  return { id, user: { login }, created_at: createdAt, body: claimBodyText(session, host, skill) };
}

const HOURS = 3600000;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

// True when the logged gh calls include a comment POST (a comments path with -f).
const posted = (calls: string[][]) =>
  calls.some((argv) => argv.includes("-f") && argv.some((a) => /\/issues\/\d+\/comments$/.test(a)));
const deleted = (calls: string[][]) =>
  calls.filter((argv) => argv.includes("--method") && argv[argv.indexOf("--method") + 1] === "DELETE");

describe("pr-claim assembly", () => {
  it("assembles user, comment-list, and claim-post calls for acquire --dry-run", () => {
    const { status, raw } = dryRun("acquire", "--repo", "owner/name", "--pr", "42", "--session", "s1", "--skill", "land");
    expect(status).toBe(0);
    expect(raw).toEqual([
      { command: "gh", argv: ["api", "user"] },
      { command: "gh", argv: ["api", "--paginate", "repos/owner/name/issues/42/comments"] },
      {
        command: "gh",
        argv: ["api", "repos/owner/name/issues/42/comments", "-f", "body=" + claimBodyText("s1", hostname(), "land")],
      },
    ]);
  });

  it("assembles a single DELETE call for release --dry-run", () => {
    const { status, raw } = dryRun("release", "--repo", "owner/name", "--pr", "42", "--comment-id", "555");
    expect(status).toBe(0);
    expect(raw).toEqual([
      { command: "gh", argv: ["api", "--method", "DELETE", "repos/owner/name/issues/comments/555"] },
    ]);
  });
});

describe("pr-claim acquire", () => {
  const base = ["acquire", "--repo", "owner/name", "--pr", "42", "--session", "mine", "--skill", "land"];

  it("posts its own claim when no claim exists", () => {
    const res = withStub({ comments: [], createdId: 7001 }, base);
    expect(res.status).toBe(0);
    expect(res.raw).toEqual({ state: "acquired", commentId: 7001 });
    expect(posted(res.calls)).toBe(true);
  });

  it("refuses with every fresh foreign holder listed while a fresh claim is held", () => {
    const comments = [
      claimComment(11, "other-a", "host-a", "land", iso(1 * HOURS)),
      claimComment(12, "other-b", "host-b", "review", iso(2 * HOURS)),
    ];
    const res = withStub({ comments }, base);
    expect(res.status).toBe(3);
    const held = JSON.parse(res.stdout);
    expect(held.state).toBe("held");
    expect(held.holders).toHaveLength(2);
    expect(held.holders.map((h: any) => h.host).sort()).toEqual(["host-a", "host-b"]);
    expect(held.holders.map((h: any) => h.skill).sort()).toEqual(["land", "review"]);
    for (const h of held.holders) {
      expect(typeof h.createdAt).toBe("string");
      expect(typeof h.ageHours).toBe("number");
    }
    expect(posted(res.calls)).toBe(false);
    expect(deleted(res.calls)).toHaveLength(0);
  });

  it("reuses its own claim without posting or deleting (idempotent, same session)", () => {
    const comments = [claimComment(20, "mine", "my-host", "land", iso(1 * HOURS))];
    const res = withStub({ comments }, base);
    expect(res.status).toBe(0);
    expect(res.raw).toEqual({ state: "reused", commentId: 20 });
    expect(posted(res.calls)).toBe(false);
    expect(deleted(res.calls)).toHaveLength(0);
  });

  it("reuses its own claim when it is older than a fresh foreign claim", () => {
    const comments = [
      claimComment(20, "mine", "my-host", "land", iso(5 * HOURS)),
      claimComment(21, "other", "other-host", "review", iso(1 * HOURS)),
    ];
    const res = withStub({ comments }, base);
    expect(res.status).toBe(0);
    expect(res.raw).toEqual({ state: "reused", commentId: 20 });
    expect(posted(res.calls)).toBe(false);
    expect(deleted(res.calls)).toHaveLength(0);
  });

  it("refuses (held) when its own claim is fresh but newer than a fresh foreign claim", () => {
    const comments = [
      claimComment(20, "mine", "my-host", "land", iso(1 * HOURS)),
      claimComment(21, "other", "other-host", "review", iso(5 * HOURS)),
    ];
    const res = withStub({ comments }, base);
    expect(res.status).toBe(3);
    const held = JSON.parse(res.stdout);
    expect(held.state).toBe("held");
    expect(held.holders).toHaveLength(1);
    expect(held.holders[0]).toMatchObject({ host: "other-host", skill: "review" });
    expect(posted(res.calls)).toBe(false);
    expect(deleted(res.calls)).toHaveLength(0);
  });

  it("does not reuse a stale own claim: with no other claims it deletes it and acquires fresh", () => {
    const comments = [claimComment(20, "mine", "my-host", "land", iso(20 * HOURS))];
    const res = withStub({ comments, createdId: 7050 }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("replaced-stale");
    expect(res.raw.commentId).toBe(7050);
    expect(res.raw.replaced).toHaveLength(1);
    expect(res.raw.replaced[0]).toMatchObject({ host: "my-host", skill: "land" });
    expect(deleted(res.calls).map((argv) => argv.at(-1))).toEqual(["repos/owner/name/issues/comments/20"]);
    expect(posted(res.calls)).toBe(true);
  });

  it("replaces a stale foreign claim: deletes it, posts its own, reports the replacement", () => {
    const comments = [claimComment(30, "old-session", "old-host", "review", iso(24 * HOURS))];
    const res = withStub({ comments, createdId: 7100 }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("replaced-stale");
    expect(res.raw.commentId).toBe(7100);
    expect(res.raw.replaced).toHaveLength(1);
    expect(res.raw.replaced[0]).toMatchObject({ host: "old-host", skill: "review" });
    expect(deleted(res.calls).map((argv) => argv.at(-1))).toEqual(["repos/owner/name/issues/comments/30"]);
    expect(posted(res.calls)).toBe(true);
  });

  it("ignores and reports a foreign-author claim and a malformed claim, then acquires", () => {
    const foreign = claimComment(40, "x", "attacker-host", "land", iso(1 * HOURS), "someone-else");
    const malformed = {
      id: 41,
      user: { login: LOGIN },
      created_at: iso(1 * HOURS),
      body: "<!-- bottega-claim {not valid json} -->\nbogus",
    };
    const res = withStub({ comments: [foreign, malformed], createdId: 7200 }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("acquired");
    expect(res.raw.commentId).toBe(7200);
    const reasons = res.raw.ignored.map((i: any) => i.reason).sort();
    expect(reasons).toEqual(["foreign-author", "malformed"]);
    expect(res.raw.ignored.map((i: any) => i.commentId).sort()).toEqual([40, 41]);
  });

  it("treats a claim with an unrecognized skill as malformed: never a holder, never stale, always ignored", () => {
    const badSkill = {
      id: 45,
      user: { login: LOGIN },
      created_at: iso(1 * HOURS),
      body: claimBodyText("other", "attacker-host", "deploy" as any),
    };
    const res = withStub({ comments: [badSkill], createdId: 7400 }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("acquired");
    expect(res.raw.commentId).toBe(7400);
    expect(res.raw.ignored).toEqual([{ commentId: 45, reason: "malformed" }]);
    expect(deleted(res.calls)).toHaveLength(0);
  });

  it("honors --stale-hours: a claim older than the window is stale and replaced", () => {
    const comments = [claimComment(50, "old", "old-host", "land", iso(3 * HOURS))];
    const res = withStub({ comments, createdId: 7300 }, [...base, "--stale-hours", "2"]);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("replaced-stale");
    expect(deleted(res.calls)).toHaveLength(1);
  });

  it("post-write election: loses the race when a concurrent claim lands earlier, reports held", () => {
    // Both sessions read no claim and post. The concurrent session's claim
    // (same GitHub login, different session) carries an earlier created_at, so
    // it wins the election and this run reports held even though it posted.
    const racer = claimComment(500, "racer", "racer-host", "review", iso(1 * HOURS));
    const res = withStub({ comments: [], createdId: 6001, raceComment: racer }, base);
    expect(res.status).toBe(3);
    const held = JSON.parse(res.stdout);
    expect(held.state).toBe("held");
    expect(held.holders).toHaveLength(1);
    expect(held.holders[0]).toMatchObject({ host: "racer-host", skill: "review" });
    expect(posted(res.calls)).toBe(true);
  });

  it("post-write election: wins the race when its own claim is the earliest live contender", () => {
    // The concurrent claim lands with a later created_at than ours, so our
    // just-posted claim remains the earliest live contender and we acquire.
    const racer = claimComment(500, "racer", "racer-host", "review", iso(-1 * HOURS));
    const res = withStub({ comments: [], createdId: 6002, raceComment: racer }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("acquired");
    expect(res.raw.commentId).toBe(6002);
  });

  it("propagates a gh failure (comment list) as a hard exit, not a held or acquired result", () => {
    const res = withStub({ failOn: "--paginate" }, base);
    expect(res.status).toBe(1);
    expect(res.stderr).toMatch(/failed/);
  });
});

describe("pr-claim release", () => {
  it("deletes the exact comment id and reports released", () => {
    const res = withStub({}, ["release", "--repo", "owner/name", "--pr", "42", "--comment-id", "88"]);
    expect(res.status).toBe(0);
    expect(res.raw).toEqual({ state: "released", commentId: "88" });
    expect(deleted(res.calls).map((argv) => argv.at(-1))).toEqual(["repos/owner/name/issues/comments/88"]);
  });

  it("treats a 404 (already deleted) as success", () => {
    const res = withStub({ deleteHttp: 404 }, ["release", "--repo", "owner/name", "--pr", "42", "--comment-id", "88"]);
    expect(res.status).toBe(0);
    expect(res.raw).toEqual({ state: "already-gone", commentId: "88" });
  });

  it("propagates a non-404 delete failure", () => {
    const res = withStub({ deleteHttp: 500 }, ["release", "--repo", "owner/name", "--pr", "42", "--comment-id", "88"]);
    expect(res.status).toBe(1);
    expect(res.stderr).toMatch(/delete failed/);
  });
});

describe("pr-claim usage errors", () => {
  it("rejects an unknown subcommand", () => {
    const { status, stderr } = run("wat", "--repo", "owner/name", "--pr", "42");
    expect(status).toBe(2);
    expect(stderr).toMatch(/subcommand must be acquire or release/);
  });

  it("rejects each subcommand with a required flag missing", () => {
    expect(dryRun("acquire", "--repo", "owner/name", "--pr", "42", "--session", "s1").status).toBe(2); // no --skill
    expect(dryRun("release", "--repo", "owner/name", "--pr", "42").status).toBe(2); // no --comment-id
  });

  it("rejects malformed --pr, --repo, --skill, --session, and --stale-hours before any gh call", () => {
    const cases: string[][] = [
      ["acquire", "--repo", "owner/name", "--pr", "0", "--session", "s1", "--skill", "land"],
      ["acquire", "--repo", "owner/name/extra", "--pr", "42", "--session", "s1", "--skill", "land"],
      ["acquire", "--repo", "owner/name", "--pr", "42", "--session", "s1", "--skill", "deploy"],
      ["acquire", "--repo", "owner/name", "--pr", "42", "--session", "bad session", "--skill", "land"],
      ["acquire", "--repo", "owner/name", "--pr", "42", "--session", "s1", "--skill", "land", "--stale-hours", "0"],
    ];
    for (const args of cases) {
      expect(dryRun(...args).status).toBe(2);
    }
  });
});
