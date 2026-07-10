#!/usr/bin/env node

// PreToolUse route guard — the money fences on Agent/Task dispatches.
//
// Two scopes, because the nadia-0001 run proved the narrow one insufficient
// (103 of 132 dispatches rode general-purpose seats the old guard never saw):
//
//   1. Named bottega worker seats (builder, reviewer, qa, documenter,
//      storyboarder, mechanic) — always fenced, run or no run: an unrouted
//      dispatch inherits the dispatching seat's model (from the maestro that
//      is a silent fable escalation), fable never rides a worker seat, and
//      each named seat has exactly one Claude model in the routing table —
//      a mismatch is a misroute, denied. Effort is not a dispatch parameter
//      this hook can see; it rides the agent frontmatter defaults and the
//      table. The cold read is not an exception here — it never rides a
//      worker seat by doctrine.
//
//   2. Every other dispatch, but only from a session that owns a live run
//      here. Runs are keyed by feature slug and coexist in one repo, each
//      driven from its own session; a run is live when its worktree entry
//      .bottega/wt/<slug>/ is non-empty (the one liveness signal with a real
//      teardown — Close reaps it; never contract state or branch refs,
//      nothing retires those), and its owning session is recorded in
//      .bottega/run/<slug>/owner, written by the maestro at Isolation and
//      rewritten on Resume. The fence fires only when the event's session_id
//      matches a live run's owner. Anything else — a bystander session in
//      the same repo (the observed failure: a codex-plugin dispatch denied
//      with a maestro-premised message whose remedy, a Claude model from the
//      routing table, routes nothing on a codex seat), a missing owner file,
//      no session_id — is silence: fail open is this guard's own creed, and
//      scope 1 (which caught the nadia run) never relaxes. Same two fences,
//      with one whitelist — a dispatch whose description begins "cold read"
//      may route fable, because the cold read is one of the two sanctioned
//      fable seats. Outside all of that the guard stays silent so the plugin
//      never breaks unrelated sessions, concurrent or later.
//
// Fences are mechanical, not trusted to memory.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The sessions owning live runs here: .bottega/run/<slug>/owner, counted only
// while the same slug's worktree entry .bottega/wt/<slug>/ is non-empty. Any
// failure to read is a slug that doesn't fence — a guard must never break
// unrelated dispatches.
function liveOwners(cwd) {
  const owners = new Set();
  let slugs = [];
  try {
    slugs = readdirSync(join(cwd, ".bottega", "run"));
  } catch {
    return owners;
  }
  for (const slug of slugs) {
    try {
      const owner = readFileSync(join(cwd, ".bottega", "run", slug, "owner"), "utf8").trim();
      if (owner && readdirSync(join(cwd, ".bottega", "wt", slug)).length > 0) owners.add(owner);
    } catch {
      // not a run-state dir, no owner recorded, or no live worktree — silence
    }
  }
  return owners;
}

const WORKER_SEAT = /(^|:)bottega-(builder|reviewer|qa|documenter|storyboarder|mechanic)$/;
const FABLE = /fable/i;
// The Claude column of the routing table (skills/execute/SKILL.md). Codex
// seats (gpt-5.6-sol) ride `codex exec`, never the Agent tool, so every
// Claude dispatch of a named seat is fully checkable here: a Claude builder
// is the user-facing slice (opus), a Claude reviewer reviews codex-built
// code (opus); qa, documenter, and mechanic are sonnet; the storyboarder
// produces the signed visual target (opus).
const SEAT_MODEL = {
  builder: /opus/i,
  reviewer: /opus/i,
  qa: /sonnet/i,
  documenter: /sonnet/i,
  storyboarder: /opus/i,
  mechanic: /sonnet/i,
};
// Anchored, description-only: replaying the nadia-0001 run, a loose match on
// prompt text passed 3 non-cold-read seats (fix cycles that merely *mention*
// cold-read findings); a description that BEGINS "cold read" passed only the
// cold read itself.
const COLD_READ = /^cold[\s-]?read\b/i;

const DENY_UNROUTED =
  "the dispatch was rejected because it names no model — an omitted model " +
  "inherits the dispatching seat's own model, which from the maestro seat " +
  "silently escalates the worker to fable; re-issue the same dispatch with an " +
  "explicit model from the routing table in skills/execute/SKILL.md (Claude " +
  "seats: builder/reviewer/storyboarder ride opus, qa/documenter/mechanic " +
  "ride sonnet).";

const DENY_FABLE =
  "the dispatch was rejected because it routes a worker seat to fable — fable " +
  "runs exactly twice per run, the maestro seat and the cold read, and the " +
  "cold read never rides a worker seat; re-issue from the routing table in " +
  "skills/execute/SKILL.md (Claude seats: builder/reviewer/storyboarder ride " +
  "opus, qa/documenter/mechanic ride sonnet), and if you believe this slice " +
  "genuinely needs fable-tier judgment, stop and put the escalation to the " +
  "user — their budget, never a self-serve seat.";

function denyMisrouted(role, model) {
  return (
    "the dispatch was rejected because it routes the " + role + " seat to '" +
    model + "' — the routing table in skills/execute/SKILL.md gives each " +
    "named Claude seat exactly one model (builder/reviewer/storyboarder: " +
    "opus; qa/documenter/mechanic: sonnet); re-issue with the table's model, " +
    "and treat wanting a different one as a doctrine change to propose, " +
    "never a per-dispatch override."
  );
}

const DENY_UNROUTED_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this dispatch names no model — an omitted model inherits the dispatching " +
  "seat's own model, which from the maestro seat silently escalates the seat to " +
  "fable; re-issue with an explicit model from the routing table in " +
  "skills/execute/SKILL.md.";

const DENY_FABLE_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this dispatch routes fable — fable runs exactly twice per run, the " +
  "maestro seat and the cold read; a cold-read dispatch's description begins " +
  "with 'cold read', and anything else re-issues from the routing table in " +
  "skills/execute/SKILL.md or goes to the user as an escalation.";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

const raw = await readStdin();

let event;
try {
  event = JSON.parse(raw);
} catch {
  process.exit(0); // a guard must never break unrelated dispatches
}

const input = event && typeof event === "object" ? event.tool_input : null;
if (!input || typeof input !== "object") process.exit(0);

const seat = input.subagent_type;
const model = input.model;
const routed = typeof model === "string" && model.length > 0;

// Scope 1 — named bottega worker seats, unconditional.
const seatMatch = typeof seat === "string" ? seat.match(WORKER_SEAT) : null;
if (seatMatch) {
  const role = seatMatch[2];
  if (!routed) deny(DENY_UNROUTED);
  if (FABLE.test(model)) deny(DENY_FABLE);
  if (!SEAT_MODEL[role].test(model)) deny(denyMisrouted(role, model));
  process.exit(0);
}

// Scope 2 — everything else, only from a session that owns a live run here.
const cwd =
  typeof event.cwd === "string" && event.cwd.length > 0 ? event.cwd : process.cwd();
const session = typeof event.session_id === "string" ? event.session_id : "";
if (!session || !liveOwners(cwd).has(session)) process.exit(0); // not a run's session

if (!routed) deny(DENY_UNROUTED_RUN);
if (FABLE.test(model)) {
  const description = typeof input.description === "string" ? input.description : "";
  if (!COLD_READ.test(description)) deny(DENY_FABLE_RUN);
}

process.exit(0); // routed off fable, or a named cold read — the seat is the maestro's call
