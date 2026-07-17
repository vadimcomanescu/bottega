// The issue-claim script: one place assembles every `gh api` call for an issue's
// advisory session claim, the agent:working label, and the self-assignment.
// --dry-run exposes the static assembly the same way pr-claim does. Beyond
// assembly, these tests drive real behavior against a stubbed `gh` on PATH: the
// stub is one node script configured through ISSUE_CLAIM_STUB, returning canned
// responses per call type and staying stateful through a state file so read-
// backs reflect writes. A posted comment appears in the next comment list, an
// added label and assignee appear in the next issue read, and raceComment models
// a second session that posts concurrently (visible only after this run posts).
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = join(import.meta.dirname, "..", "scripts", "issue-claim");
const LOGIN = "botlogin";
const HOST = hostname();

const STUB = `#!/usr/bin/env node
const fs = require("fs");
const cfg = JSON.parse(process.env.ISSUE_CLAIM_STUB || "{}");
const argv = process.argv.slice(2);
if (cfg.logFile) fs.appendFileSync(cfg.logFile, JSON.stringify(argv) + "\\n");
function out(v){ process.stdout.write(typeof v === "string" ? v : JSON.stringify(v)); process.exit(0); }
function state(){ try { return JSON.parse(fs.readFileSync(cfg.stateFile, "utf8")); } catch { return { posts: [], labels: [], assignees: [], labelCreated: false }; } }
function save(s){ if (cfg.stateFile) fs.writeFileSync(cfg.stateFile, JSON.stringify(s)); }
const joined = argv.join(" ");
if (cfg.failOn && joined.includes(cfg.failOn)) {
  process.stderr.write(cfg.failStderr || "gh: request failed\\n");
  process.exit(cfg.failStatus || 1);
}
const path = argv.find((a) => a.startsWith("repos/")) || "";
const methodIdx = argv.indexOf("--method");
const method = methodIdx >= 0 ? argv[methodIdx + 1] : null;
const hasF = argv.includes("-f");
const fval = hasF ? (argv[argv.indexOf("-f") + 1] || "") : "";
if (argv[0] === "api" && argv[1] === "user") out(cfg.user || { login: "${LOGIN}" });
if (argv.includes("--paginate") && /\\/comments$/.test(path)) {
  const s = state();
  const all = [...(cfg.comments || []), ...s.posts];
  if (cfg.raceComment && s.posts.length > 0) all.push(cfg.raceComment);
  out(all);
}
if (method === "DELETE" && path.includes("/labels/")) {
  const http = cfg.removeLabelHttp || 204;
  if (http !== 204) { process.stderr.write("gh: HTTP " + http + "\\n"); process.exit(1); }
  const s = state(); s.labels = s.labels.filter((n) => n !== "agent:working"); save(s); process.exit(0);
}
if (method === "DELETE" && /\\/assignees$/.test(path)) {
  const s = state(); s.assignees = s.assignees.filter((l) => l !== fval.replace(/^assignees\\[\\]=/, "")); save(s); process.exit(0);
}
if (hasF && /\\/issues\\/\\d+\\/comments$/.test(path)) {
  const id = cfg.createdId || 9001;
  const body = fval.replace(/^body=/, "");
  const s = state(); s.posts.push({ id, user: { login: "${LOGIN}" }, created_at: new Date().toISOString(), body }); save(s);
  out(cfg.created || { id });
}
if (hasF && /\\/issues\\/\\d+\\/labels$/.test(path)) {
  const s = state(); s.labels.push("agent:working"); save(s); out([{ name: "agent:working" }]);
}
if (hasF && /\\/issues\\/\\d+\\/assignees$/.test(path)) {
  const s = state(); s.assignees.push(fval.replace(/^assignees\\[\\]=/, "")); save(s); out({ number: 1 });
}
if (/\\/issues\\/\\d+$/.test(path)) {
  const s = state();
  out({ number: 1, labels: s.labels.map((n) => ({ name: n })), assignees: s.assignees.map((l) => ({ login: l })) });
}
if (hasF && /\\/labels$/.test(path)) {
  const s = state(); s.labelCreated = true; save(s); out({ name: "agent:working" });
}
if (/\\/labels\\/[^/]+$/.test(path)) {
  const s = state();
  if (cfg.labelExists || s.labelCreated) out({ name: "agent:working" });
  process.stderr.write("gh: HTTP 404 Not Found\\n");
  process.exit(1);
}
process.stderr.write("gh stub: unhandled: " + joined + "\\n");
process.exit(1);
`;

type StubConfig = {
  user?: { login: string };
  comments?: unknown[];
  created?: { id: number | string };
  createdId?: number;
  raceComment?: unknown;
  labelExists?: boolean;
  removeLabelHttp?: number;
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

// Run issue-claim with a fresh gh stub on PATH. Returns the parsed stdout (raw,
// null when the script exited nonzero) and the logged gh call sequence.
function withStub(cfg: StubConfig, args: string[]): RunResult {
  const dir = mkdtempSync(join(tmpdir(), "issue-claim-gh-stub-"));
  const logFile = join(dir, "calls.log");
  const stateFile = join(dir, "state.json");
  try {
    writeFileSync(join(dir, "gh"), STUB, { mode: 0o755 });
    const result = spawnSync("node", [SCRIPT, ...args], {
      encoding: "utf-8",
      env: { ...process.env, PATH: dir + ":" + process.env.PATH, ISSUE_CLAIM_STUB: JSON.stringify({ ...cfg, logFile, stateFile }) },
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

// Comment bodies exactly as the script assembles them, so stubbed comment lists
// stay in lockstep with the one source of the claim-line format.
function claimBodyText(agent: string, host: string, createdIso: string, expiresIso: string): string {
  const marker = "agent-claim: " + agent + "@" + host + " " + createdIso + " expires:" + expiresIso;
  return marker + "\nBottega agent " + agent + " on host " + host + " holds this issue until " + expiresIso + ".";
}

function claimComment(
  id: number,
  agent: string,
  host: string,
  createdIso: string,
  expiresIso: string,
  login = LOGIN,
) {
  return { id, user: { login }, created_at: createdIso, body: claimBodyText(agent, host, createdIso, expiresIso) };
}

const HOURS = 3600000;
const iso = (msFromNow: number) => new Date(Date.now() + msFromNow).toISOString();

const posted = (calls: string[][]) =>
  calls.some((argv) => argv.includes("-f") && argv.some((a) => /\/issues\/\d+\/comments$/.test(a)));
const removedLabel = (calls: string[][]) =>
  calls.some(
    (argv) => argv.includes("--method") && argv[argv.indexOf("--method") + 1] === "DELETE" && argv.some((a) => /\/labels\//.test(a)),
  );
const removedAssignee = (calls: string[][]) =>
  calls.some(
    (argv) => argv.includes("--method") && argv[argv.indexOf("--method") + 1] === "DELETE" && argv.some((a) => /\/assignees$/.test(a)),
  );

describe("issue-claim assembly", () => {
  it("assembles a single label read for ensure-label --dry-run", () => {
    const { status, raw } = dryRun("ensure-label", "--repo", "owner/name");
    expect(status).toBe(0);
    expect(raw).toEqual([{ command: "gh", argv: ["api", "repos/owner/name/labels/agent%3Aworking"] }]);
  });

  it("assembles user, comment-list, and claim-post calls for acquire --dry-run", () => {
    const { status, raw } = dryRun("acquire", "--repo", "owner/name", "--issue", "42", "--agent", "a1");
    expect(status).toBe(0);
    expect(raw[0]).toEqual({ command: "gh", argv: ["api", "user"] });
    expect(raw[1]).toEqual({ command: "gh", argv: ["api", "--paginate", "repos/owner/name/issues/42/comments"] });
    expect(raw[2].argv.slice(0, 2)).toEqual(["api", "repos/owner/name/issues/42/comments"]);
    expect(raw[2].argv[2]).toBe("-f");
    expect(raw[2].argv[3].startsWith("body=agent-claim: a1@" + HOST + " ")).toBe(true);
  });

  it("assembles a single claim-post call for refresh --dry-run", () => {
    const { status, raw } = dryRun("refresh", "--repo", "owner/name", "--issue", "42", "--agent", "a1", "--duration-minutes", "30");
    expect(status).toBe(0);
    expect(raw).toHaveLength(1);
    expect(raw[0].argv.slice(0, 2)).toEqual(["api", "repos/owner/name/issues/42/comments"]);
    expect(raw[0].argv[3].startsWith("body=agent-claim: a1@" + HOST + " ")).toBe(true);
  });

  it("assembles user, comment-list, and label/assignee removals for release --abandon --dry-run", () => {
    const { status, raw } = dryRun("release", "--repo", "owner/name", "--issue", "42", "--agent", "a1", "--abandon");
    expect(status).toBe(0);
    expect(raw).toEqual([
      { command: "gh", argv: ["api", "user"] },
      { command: "gh", argv: ["api", "--paginate", "repos/owner/name/issues/42/comments"] },
      { command: "gh", argv: ["api", "--method", "DELETE", "repos/owner/name/issues/42/labels/agent%3Aworking"] },
      { command: "gh", argv: ["api", "--method", "DELETE", "repos/owner/name/issues/42/assignees", "-f", "assignees[]=@me"] },
    ]);
  });
});

describe("issue-claim ensure-label", () => {
  it("reports the label present when it already exists", () => {
    const res = withStub({ labelExists: true }, ["ensure-label", "--repo", "owner/name"]);
    expect(res.status).toBe(0);
    expect(res.raw).toEqual({ state: "label-present", name: "agent:working" });
  });

  it("creates the label when missing, then reads it back", () => {
    const res = withStub({ labelExists: false }, ["ensure-label", "--repo", "owner/name"]);
    expect(res.status).toBe(0);
    expect(res.raw).toEqual({ state: "label-created", name: "agent:working" });
    const createdLabel = res.calls.some((argv) => argv.includes("-f") && argv.some((a) => a === "name=agent:working"));
    expect(createdLabel).toBe(true);
  });
});

describe("issue-claim acquire", () => {
  const base = ["acquire", "--repo", "owner/name", "--issue", "42", "--agent", "mine"];

  it("posts, wins the election, assigns @me and adds the label when no claim exists", () => {
    const res = withStub({ comments: [], createdId: 7001 }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("acquired");
    expect(res.raw.commentId).toBe(7001);
    expect(typeof res.raw.expiresAt).toBe("string");
    expect(posted(res.calls)).toBe(true);
    const addedLabel = res.calls.some((argv) => argv.some((a) => /\/issues\/\d+\/labels$/.test(a)) && argv.includes("-f"));
    const addedAssignee = res.calls.some((argv) => argv.some((a) => /\/issues\/\d+\/assignees$/.test(a)) && argv.includes("-f"));
    expect(addedLabel).toBe(true);
    expect(addedAssignee).toBe(true);
  });

  it("takes over an expired claim: the dead claim is excluded and this session wins", () => {
    const comments = [claimComment(10, "old", "old-host", iso(-20 * HOURS), iso(-8 * HOURS))];
    const res = withStub({ comments, createdId: 7002 }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("acquired");
    expect(res.raw.commentId).toBe(7002);
  });

  it("refuses when a live foreign claim is already the earliest contender", () => {
    const comments = [claimComment(20, "other", "other-host", iso(-1 * HOURS), iso(3 * HOURS))];
    const res = withStub({ comments }, base);
    expect(res.status).toBe(3);
    const held = JSON.parse(res.stdout);
    expect(held.state).toBe("held");
    expect(held.winner).toMatchObject({ agent: "other", host: "other-host" });
    // We posted a contender before discovering we lost, but never assigned or labeled.
    expect(posted(res.calls)).toBe(true);
    const addedLabel = res.calls.some((argv) => argv.some((a) => /\/issues\/\d+\/labels$/.test(a)) && argv.includes("-f"));
    expect(addedLabel).toBe(false);
  });

  it("post-write election: loses the race when a concurrent claim lands earlier", () => {
    // Both sessions read no claim and post. The concurrent session's claim (same
    // login, different session) carries an earlier created time and wins.
    const racer = claimComment(500, "racer", "racer-host", iso(-1 * HOURS), iso(3 * HOURS));
    const res = withStub({ comments: [], createdId: 6001, raceComment: racer }, base);
    expect(res.status).toBe(3);
    const held = JSON.parse(res.stdout);
    expect(held.state).toBe("held");
    expect(held.winner).toMatchObject({ agent: "racer", host: "racer-host" });
    expect(posted(res.calls)).toBe(true);
  });

  it("post-write election: wins the race when its own claim is the earliest live contender", () => {
    const racer = claimComment(500, "racer", "racer-host", iso(1 * HOURS), iso(4 * HOURS));
    const res = withStub({ comments: [], createdId: 6002, raceComment: racer }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("acquired");
    expect(res.raw.commentId).toBe(6002);
  });

  it("ignores and reports a foreign-author claim and a malformed claim, then acquires", () => {
    const foreign = claimComment(40, "x", "attacker-host", iso(-1 * HOURS), iso(3 * HOURS), "someone-else");
    const malformed = { id: 41, user: { login: LOGIN }, created_at: iso(-1 * HOURS), body: "agent-claim: not a real line\nbogus" };
    const res = withStub({ comments: [foreign, malformed], createdId: 7200 }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("acquired");
    const reasons = res.raw.ignored.map((i: any) => i.reason).sort();
    expect(reasons).toEqual(["foreign-author", "malformed"]);
    expect(res.raw.ignored.map((i: any) => i.commentId).sort()).toEqual([40, 41]);
  });

  it("propagates a gh failure (comment list) as a hard exit", () => {
    const res = withStub({ failOn: "--paginate" }, base);
    expect(res.status).toBe(1);
    expect(res.stderr).toMatch(/failed/);
  });
});

describe("issue-claim refresh", () => {
  it("posts a fresh claim and reports the extended expiry", () => {
    const res = withStub({ createdId: 8001 }, ["refresh", "--repo", "owner/name", "--issue", "42", "--agent", "mine", "--duration-minutes", "30"]);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("refreshed");
    expect(res.raw.commentId).toBe(8001);
    expect(typeof res.raw.expiresAt).toBe("string");
    expect(posted(res.calls)).toBe(true);
  });
});

describe("issue-claim release", () => {
  const base = ["release", "--repo", "owner/name", "--issue", "42", "--agent", "mine"];

  it("removes the label when a read-back elects this session's own claim", () => {
    const comments = [claimComment(60, "mine", HOST, iso(-1 * HOURS), iso(3 * HOURS))];
    const res = withStub({ comments }, base);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("released");
    expect(removedLabel(res.calls)).toBe(true);
    expect(removedAssignee(res.calls)).toBe(false);
  });

  it("also removes the assignment with --abandon", () => {
    const comments = [claimComment(60, "mine", HOST, iso(-1 * HOURS), iso(3 * HOURS))];
    const res = withStub({ comments }, [...base, "--abandon"]);
    expect(res.status).toBe(0);
    expect(res.raw.state).toBe("abandoned");
    expect(removedLabel(res.calls)).toBe(true);
    expect(removedAssignee(res.calls)).toBe(true);
  });

  it("changes nothing when another live claim is the elected winner", () => {
    const comments = [claimComment(61, "other", "other-host", iso(-2 * HOURS), iso(3 * HOURS))];
    const res = withStub({ comments }, base);
    expect(res.status).toBe(3);
    const held = JSON.parse(res.stdout);
    expect(held.state).toBe("held");
    expect(held.winner).toMatchObject({ agent: "other", host: "other-host" });
    expect(removedLabel(res.calls)).toBe(false);
  });

  it("changes nothing when this session's claim has expired and no claim is live", () => {
    const comments = [claimComment(62, "mine", HOST, iso(-5 * HOURS), iso(-1 * HOURS))];
    const res = withStub({ comments }, base);
    expect(res.status).toBe(3);
    expect(JSON.parse(res.stdout).state).toBe("held");
    expect(removedLabel(res.calls)).toBe(false);
  });
});

describe("issue-claim usage errors", () => {
  it("rejects an unknown subcommand", () => {
    const { status, stderr } = run("wat", "--repo", "owner/name");
    expect(status).toBe(2);
    expect(stderr).toMatch(/subcommand must be ensure-label, acquire, refresh, or release/);
  });

  it("rejects each subcommand with a required flag missing", () => {
    expect(dryRun("acquire", "--repo", "owner/name", "--issue", "42").status).toBe(2); // no --agent
    expect(dryRun("refresh", "--repo", "owner/name", "--issue", "42", "--agent", "a1").status).toBe(2); // no --duration-minutes
    expect(dryRun("release", "--repo", "owner/name", "--issue", "42").status).toBe(2); // no --agent
  });

  it("rejects malformed --issue, --repo, --agent, and non-positive durations before any gh call", () => {
    const cases: string[][] = [
      ["acquire", "--repo", "owner/name", "--issue", "0", "--agent", "a1"],
      ["acquire", "--repo", "owner/name/extra", "--issue", "42", "--agent", "a1"],
      ["acquire", "--repo", "owner/name", "--issue", "42", "--agent", "bad agent"],
      ["acquire", "--repo", "owner/name", "--issue", "42", "--agent", "a1", "--ttl-minutes", "0"],
      ["refresh", "--repo", "owner/name", "--issue", "42", "--agent", "a1", "--duration-minutes", "-5"],
    ];
    for (const args of cases) {
      expect(dryRun(...args).status).toBe(2);
    }
  });
});
