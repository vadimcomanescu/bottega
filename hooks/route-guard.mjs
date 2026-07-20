#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

const FABLE = /fable/i;
const MODEL_LITERAL = /\bmodel\s*:\s*(['"])([^'"]*)\1/;

const DIRECT_UNPINNED =
  "This live run dispatch names no model. Choose an explicit model using skills/routing and retry.";
const DIRECT_FABLE =
  "This live run dispatch routes to Fable. Choose a non-Fable model using skills/routing and retry.";
const WORKFLOW_UNPINNED =
  "This live run workflow has an agent() call that names no literal model. Choose an explicit model using skills/routing and retry.";
const WORKFLOW_FABLE =
  "This live run workflow has an agent() call routed to Fable. Choose a non-Fable model using skills/routing and retry.";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function ownsLiveRun(cwd, session) {
  let slugs;
  try {
    slugs = readdirSync(join(cwd, ".bottega", "run"));
  } catch {
    return false;
  }

  for (const slug of slugs) {
    try {
      const owner = readFileSync(join(cwd, ".bottega", "run", slug, "owner"), "utf8").trim();
      if (owner && owner === session) return true;
    } catch {
      // A guard must not break dispatches when run state cannot be read.
    }
  }
  return false;
}

function workflowScript(input, cwd) {
  if (typeof input.scriptPath === "string" && input.scriptPath.length > 0) {
    const path = isAbsolute(input.scriptPath) ? input.scriptPath : join(cwd, input.scriptPath);
    try {
      return readFileSync(path, "utf8");
    } catch {
      return null;
    }
  }
  return typeof input.script === "string" ? input.script : null;
}

function agentCalls(script) {
  const calls = [];
  const agent = /\bagent\s*\(/g;
  let match;
  while ((match = agent.exec(script))) {
    let depth = 1;
    let quote = "";
    let index = agent.lastIndex;
    for (; index < script.length && depth > 0; index++) {
      const character = script[index];
      if (quote) {
        if (character === "\\") index++;
        else if (character === quote) quote = "";
      } else if (character === "'" || character === '"' || character === "`") {
        quote = character;
      } else if (character === "(") {
        depth++;
      } else if (character === ")") {
        depth--;
      }
    }
    if (depth > 0) return null;
    calls.push(script.slice(agent.lastIndex, index - 1));
    agent.lastIndex = index;
  }
  return calls;
}

function optionsText(call) {
  let quote = "";
  let depth = 0;
  let start = -1;
  let options = "";
  for (let index = 0; index < call.length; index++) {
    const character = call[index];
    if (quote) {
      if (character === "\\") index++;
      else if (character === quote) quote = "";
    } else if (character === "'" || character === '"' || character === "`") {
      quote = character;
    } else if (character === "{") {
      if (depth === 0) start = index;
      depth++;
    } else if (character === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        options = call.slice(start, index + 1);
        start = -1;
      }
    }
  }
  return options;
}

function harness() {
  if (process.env.CURSOR_PLUGIN_ROOT || process.env.CURSOR_HOME) return "cursor";
  if (process.env.CODEX_HOME || process.env.CODEX_PLUGIN_ROOT || process.env.PLUGIN_ROOT) {
    return "codex";
  }
  return "claude";
}

function deny(reason) {
  if (harness() === "cursor") {
    process.stdout.write(
      JSON.stringify({
        permission: "deny",
        user_message: reason,
        agent_message: reason,
      }),
    );
    return;
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
}

const raw = await readStdin();
let event;
try {
  event = JSON.parse(raw);
} catch {
  process.exit(0);
}

if (!event || typeof event !== "object") process.exit(0);
const cwd = typeof event.cwd === "string" && event.cwd.length > 0 ? event.cwd : null;
const session =
  typeof event.session_id === "string"
    ? event.session_id
    : typeof event.conversation_id === "string"
      ? event.conversation_id
      : null;
const input = event.tool_input;
if (!cwd || !session || !input || typeof input !== "object") process.exit(0);
if (!ownsLiveRun(cwd, session)) process.exit(0);

if (event.tool_name === "Workflow") {
  const script = workflowScript(input, cwd);
  if (script === null) process.exit(0);
  const calls = agentCalls(script);
  if (calls === null) process.exit(0);
  for (const call of calls) {
    const model = optionsText(call).match(MODEL_LITERAL)?.[2]?.trim();
    if (!model) {
      deny(WORKFLOW_UNPINNED);
      process.exit(0);
    }
    if (FABLE.test(model)) {
      deny(WORKFLOW_FABLE);
      process.exit(0);
    }
  }
  process.exit(0);
}

if (event.tool_name !== "Agent" && event.tool_name !== "Task") process.exit(0);
const model = typeof input.model === "string" ? input.model.trim() : "";
if (!model) {
  deny(DIRECT_UNPINNED);
  process.exit(0);
}
if (FABLE.test(model)) deny(DIRECT_FABLE);

process.exit(0);
