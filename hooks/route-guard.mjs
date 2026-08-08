#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

const FABLE = /fable/i;
const MODEL_LITERAL = /\bmodel\s*:\s*(['"])([^'"]*)\1/;
const MODEL_FLAG = /(?:^|\s)(?:-m|--model)[=\s]+(\S+)/;
// The wrapper takes its subcommand first, so only "task" starts a run.
// A longer word starting with "task" is another subcommand and passes.
const CODEX_TASK = /codex-task["']?\s+task(?![\w-])/;

const NAME_IT = "Name the worker's model (Claude workers run on opus-5) and retry.";
const DIRECT_UNPINNED = `This live run dispatch names no model. ${NAME_IT}`;
const DIRECT_FABLE =
  `This live run dispatch routes to Fable, the orchestrator's model, never a worker's. ${NAME_IT}`;
const WORKFLOW_UNPINNED =
  `This live run workflow has an agent() call that names no literal model. ${NAME_IT}`;
const WORKFLOW_FABLE =
  `This live run workflow has an agent() call routed to Fable, the orchestrator's model, never a worker's. ${NAME_IT}`;
const CODEX_UNPINNED = `This live run codex dispatch names no model (-m). ${NAME_IT}`;
const CODEX_FABLE =
  `This live run codex dispatch routes to Fable, the orchestrator's model, never a worker's. ${NAME_IT}`;

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

function deny(reason) {
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
const cwd =
  typeof event.cwd === "string" && event.cwd.length > 0 ? event.cwd : process.cwd();
const session = typeof event.session_id === "string" ? event.session_id : null;
const input = event.tool_input;
if (!cwd || !session || !input || typeof input !== "object") process.exit(0);
if (!ownsLiveRun(cwd, session)) process.exit(0);

if (event.tool_name === "Bash") {
  const command = typeof input.command === "string" ? input.command : "";
  const exec = /\bcodex\s+exec\b/.test(command) && !command.includes("--help");
  if (!exec && !CODEX_TASK.test(command)) process.exit(0);
  const model = command.match(MODEL_FLAG)?.[1] ?? "";
  if (!model) {
    deny(CODEX_UNPINNED);
    process.exit(0);
  }
  if (FABLE.test(model)) deny(CODEX_FABLE);
  process.exit(0);
}

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
