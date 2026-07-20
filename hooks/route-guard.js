#!/usr/bin/env node

// PreToolUse route guard: enforces model routing on Agent/Task/Workflow
// dispatches.
//
// Three scopes, because the narrow one alone proved insufficient (in the
// nadia-0001 run, 103 of 132 dispatches went through general-purpose agents
// the old guard never saw):
//
//   1. Named bottega worker agents (builder and QA), always checked, run
//      or no run: a dispatch that omits `model` inherits the dispatching
//      session's model (from the orchestrator that is a silent escalation to
//      fable), fable never runs a worker agent, and each named worker has
//      exactly one Claude model family in the routing table; a mismatch is a
//      misroute, denied. Effort is not a dispatch parameter this hook can
//      see; the routing table states it, unenforced here.
//
//   2. Every other dispatch, but only from a session that owns a live run
//      here. Runs are keyed by feature slug and coexist in one repo, each
//      driven from its own session; a run is live while its owner file
//      .bottega/run/<slug>/owner exists (written by the orchestrator at
//      Isolate, rewritten on resume, deleted at delivery), and the check
//      fires only when the event's session_id matches a recorded owner.
//      Anything else is silence: a bystander session in the same repo (the
//      observed failure: a codex-plugin dispatch denied with a message whose
//      remedy routes nothing on a codex dispatch), a missing owner file, no
//      session_id. This guard fails open, and scope 1 (which caught the
//      nadia run) never relaxes.
//
//   3. Workflow tool calls, from a run-owning session only. A workflow
//      agent() call that names no model inherits the session's model, so
//      from the orchestrator a single workflow multiplies fable silently
//      (observed: one /code-review invocation during a run put 19 fable
//      agents on a diff, unseen by scope 2 because none of them was an
//      Agent dispatch). The check is static, on the script text: every
//      agent() call must name a model, and none may name fable. A script
//      the guard cannot read (name-only invocation, unreadable scriptPath,
//      unparseable call) is denied, not waved through: inside the fence,
//      unverifiable routing is unrouted routing.
//
// The checks are mechanical, not trusted to memory.

import { readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

// The sessions owning live runs here: .bottega/run/<slug>/owner. Any failure
// to read is a slug that doesn't fence; a guard must never break unrelated
// dispatches.
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
      if (owner) owners.add(owner);
    } catch {
      // not a run-state dir or no owner recorded: silence
    }
  }
  return owners;
}

const FABLE = /fable/i;
const OPUS = /^(?:claude-)?opus(?:[-.][a-z0-9]+)*$/i;
// The Claude column of the routing table (skills/deliver/SKILL.md). Codex
// workers run through `codex exec`, never the Agent tool, so every Claude
// dispatch of a named worker is fully checkable here: the Claude builder
// (user-facing slices) and QA worker both run on opus.
const WORKER_MODEL = {
  builder: OPUS,
  qa: OPUS,
};
const ROLES = Object.keys(WORKER_MODEL).join("|");
// Plugin agents register as <plugin>:<agent>, so every real dispatch names
// bottega:<role>; a bare role name resolves to nothing in the harness and, if
// it did, could be the project's own agent, which this guard never routes.
const WORKER_AGENT = new RegExp("^bottega:(" + ROLES + ")$");
// A deleted plugin seat must not fall through as if it belonged to the project.
// Keep this separate from WORKER_MODEL: it has no valid route.
const REMOVED_ROLE = "reviewer";
const UNKNOWN_SEAT = new RegExp("^bottega:(" + REMOVED_ROLE + ")$");

const DENY_UNROUTED =
  "the dispatch was rejected because it names no model. An omitted model " +
  "inherits the dispatching session's own model, which from the orchestrator " +
  "silently escalates the worker to fable; re-issue the same dispatch with an " +
  "explicit model from the routing table in skills/deliver/SKILL.md (Claude " +
  "workers, builder and QA, run on opus).";

const DENY_FABLE =
  "the dispatch was rejected because it routes a worker agent to fable. " +
  "Fable is not a builder or QA worker; re-issue from " +
  "the routing table in skills/deliver/SKILL.md (Claude workers, builder, " +
  "and QA, run on opus), and if you believe this work genuinely needs " +
  "fable-tier judgment, do that part yourself in your own turns instead of " +
  "dispatching it.";

function denyMisrouted(role, model) {
  return (
    "the dispatch was rejected because it routes the " + role + " agent to '" +
    model + "'. The routing table in skills/deliver/SKILL.md gives each named " +
    "Claude worker exactly one model family (builder and QA: opus); re-issue " +
    "with the table's model, and treat wanting a different one as a " +
    "routing-table change to propose, never a per-dispatch override."
  );
}

function denyUnknownSeat(role) {
  return (
    "the dispatch was rejected because it claims the unknown bottega seat '" +
    role + "'. This seat is not present in the routing table or installed agents."
  );
}

const DENY_UNROUTED_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this dispatch names no model. An omitted model inherits the dispatching " +
  "session's own model, which from the orchestrator silently escalates the " +
  "dispatch to fable; re-issue with an explicit model from the routing table in " +
  "skills/deliver/SKILL.md.";

const DENY_FABLE_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this dispatch routes fable. Fable is the orchestrator, not a general " +
  "worker; the panel's fable seats run through the claude CLI (skills/panel), " +
  "never a dispatch. Re-issue from the routing table in skills/deliver/SKILL.md, " +
  "and do fable-tier work in your own turns instead of dispatching it.";

const DENY_WORKFLOW_UNPINNED_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this workflow script has an agent() call that names no model. A workflow " +
  "agent that names no model inherits the session's model, which from the " +
  "orchestrator silently escalates every such agent to fable; re-issue the " +
  "workflow with an explicit model on every agent() call, from the routing " +
  "table in skills/deliver/SKILL.md.";

const DENY_WORKFLOW_FABLE_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this workflow script routes an agent to fable. Fable is the orchestrator " +
  "seat and no workflow routes it; re-issue from the routing table in " +
  "skills/deliver/SKILL.md.";

const DENY_WORKFLOW_UNCHECKED_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this workflow's script cannot be read, so its model routing cannot be " +
  "checked. Re-issue with the script inline or at a readable scriptPath, with " +
  "an explicit model on every agent() call.";

// The script under check: scriptPath wins over inline script, matching the
// Workflow tool's own precedence; a name-only invocation resolves elsewhere
// and is unreadable here.
function workflowScript(input, cwd) {
  const path = typeof input.scriptPath === "string" && input.scriptPath.length > 0
    ? (isAbsolute(input.scriptPath) ? input.scriptPath : join(cwd, input.scriptPath))
    : null;
  if (path) {
    try {
      return readFileSync(path, "utf8");
    } catch {
      return null;
    }
  }
  if (typeof input.script === "string" && input.script.length > 0) return input.script;
  return null;
}

// The argument text of every agent(...) call, by balanced-paren scan with
// string skipping; null when a call never closes, which the caller treats as
// unreadable.
function agentCalls(script) {
  const calls = [];
  const re = /\bagent\s*\(/g;
  let match;
  while ((match = re.exec(script))) {
    let depth = 1;
    let quote = "";
    let i = re.lastIndex;
    for (; i < script.length && depth > 0; i++) {
      const ch = script[i];
      if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = "";
      } else if (ch === "'" || ch === '"' || ch === "`") quote = ch;
      else if (ch === "(") depth++;
      else if (ch === ")") depth--;
    }
    if (depth > 0) return null;
    calls.push(script.slice(re.lastIndex, i - 1));
    re.lastIndex = i;
  }
  return calls;
}

// A pin is a plain quoted literal; an expression (`model: input.model`) or a
// template literal is statically unverifiable and counts as unrouted. Both
// regexes run on the call's options object only, never on prompt prose.
const MODEL_LITERAL = /\bmodel\s*:\s*(['"])([^'"]*)\1/;
const WORKFLOW_WORKER = new RegExp(
  "\\bagentType\\s*:\\s*['\"`]bottega:(" + ROLES + ")['\"`]"
);
const WORKFLOW_UNKNOWN_SEAT = new RegExp(
  "\\bagentType\\s*:\\s*['\"`]bottega:(" + REMOVED_ROLE + ")['\"`]"
);

// The options object of one agent() call: the last top-level `{ ... }` in
// the call's argument text, found with the same string-skipping scan as
// agentCalls. Prompt strings are skipped whole, so their contents can never
// read as routing.
function optionsText(call) {
  let quote = "";
  let depth = 0;
  let start = -1;
  let last = "";
  for (let i = 0; i < call.length; i++) {
    const ch = call[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = "";
    } else if (ch === "'" || ch === '"' || ch === "`") quote = ch;
    else if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        last = call.slice(start, i + 1);
        start = -1;
      }
    }
  }
  return last;
}

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

const agentType = input.subagent_type;
const model = input.model;
const routed = typeof model === "string" && model.length > 0;

// Scope 1: named bottega worker agents, unconditional.
const unknownSeat = typeof agentType === "string" ? agentType.match(UNKNOWN_SEAT) : null;
if (unknownSeat) deny(denyUnknownSeat(unknownSeat[1]));

const workerMatch = typeof agentType === "string" ? agentType.match(WORKER_AGENT) : null;
if (workerMatch) {
  const role = workerMatch[1];
  if (!routed) deny(DENY_UNROUTED);
  if (FABLE.test(model)) deny(DENY_FABLE);
  if (!WORKER_MODEL[role].test(model)) deny(denyMisrouted(role, model));
  process.exit(0);
}

// Scope 2: everything else, only from a session that owns a live run here.
const cwd =
  typeof event.cwd === "string" && event.cwd.length > 0 ? event.cwd : process.cwd();
const isWorkflow = event.tool_name === "Workflow";
const script = isWorkflow ? workflowScript(input, cwd) : null;
const calls = script === null ? null : agentCalls(script);

// Removed plugin seats fail closed in workflows even outside a run. The rest
// of workflow routing remains fenced to the session that owns a live run.
if (calls) {
  for (const call of calls) {
    const removed = optionsText(call).match(WORKFLOW_UNKNOWN_SEAT);
    if (removed) deny(denyUnknownSeat(removed[1]));
  }
}

const session = typeof event.session_id === "string" ? event.session_id : "";
if (!session || !liveOwners(cwd).has(session)) process.exit(0); // not a run's session

// Scope 3: workflow scripts, checked statically.
if (isWorkflow) {
  if (calls === null) deny(DENY_WORKFLOW_UNCHECKED_RUN);
  for (const call of calls) {
    const options = optionsText(call);
    const pin = options.match(MODEL_LITERAL);
    if (!pin) deny(DENY_WORKFLOW_UNPINNED_RUN);
    if (FABLE.test(pin[2])) deny(DENY_WORKFLOW_FABLE_RUN);
    // A named worker inside a workflow obeys the same routing table as a
    // direct dispatch.
    const worker = options.match(WORKFLOW_WORKER);
    if (worker && !WORKER_MODEL[worker[1]].test(pin[2]))
      deny(denyMisrouted(worker[1], pin[2]));
  }
  process.exit(0);
}

if (!routed) deny(DENY_UNROUTED_RUN);
if (FABLE.test(model)) deny(DENY_FABLE_RUN);

process.exit(0); // routed off fable; the choice is the orchestrator's
