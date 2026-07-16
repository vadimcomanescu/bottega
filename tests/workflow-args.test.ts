import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Executes the shipped workflow scripts the way the Workflow runtime does:
// the body wrapped in an async function with the harness hooks as arguments.
// A real run passed args as a JSON-encoded string and every panelist received
// the task "undefined"; these tests pin that both scripts normalize a string
// args value and refuse to dispatch when a required field is missing.

const ROOT = join(import.meta.dirname, "..");

type AgentCall = { prompt: string; opts: Record<string, unknown> };

const PANELIST_RESULT = {
  draft: "draft",
  claims: [],
  assumptions: [],
  would_change: [],
};
const JUDGE_RESULT = {
  consensus: [],
  contradictions: [],
  partial_coverage: [],
  unique_insights: [],
  blind_spots: [],
};

const AsyncFunction = Object.getPrototypeOf(async function () {})
  .constructor as new (...params: string[]) => (...args: unknown[]) => Promise<unknown>;

async function runScript(
  path: string,
  args: unknown,
  solExitCode = 0,
): Promise<{ calls: AgentCall[]; result: unknown }> {
  const source = readFileSync(join(ROOT, path), "utf8").replace(
    "export const meta",
    "const meta",
  );
  const calls: AgentCall[] = [];
  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    calls.push({ prompt, opts });
    if (opts.label === "panel-judge") return JUDGE_RESULT;
    if (opts.label === "panelist:sol")
      return {
        exit_code: solExitCode,
        draft: solExitCode === 0 ? PANELIST_RESULT : null,
      };
    return PANELIST_RESULT;
  };
  const parallel = (thunks: Array<() => Promise<unknown>>) =>
    Promise.all(thunks.map((t) => t().catch(() => null)));
  const body = new AsyncFunction("agent", "parallel", "phase", "log", "args", source);
  const result = await body(agent, parallel, () => {}, () => {}, args);
  return { calls, result };
}

const PANEL = "skills/panel/panel.js";
const REVIEW = "skills/reviewing/assets/review-dispatch.js";
const PANELIST_SCHEMA = JSON.parse(
  readFileSync(join(ROOT, "skills/panel/references/panelist.schema.json"), "utf8"),
);
const JUDGE_SCHEMA = JSON.parse(
  readFileSync(join(ROOT, "skills/panel/references/judge.schema.json"), "utf8"),
);
const PANEL_ARGS = {
  task: "Pick the storage engine.",
  cwd: "/tmp/example-repo",
  codexExec: "/tmp/example-repo/scripts/codex-exec",
  panelistSchema: PANELIST_SCHEMA,
  judgeSchema: JUDGE_SCHEMA,
};

describe("workflow args normalization", () => {
  it("panel dispatches the task from object args", async () => {
    const { calls } = await runScript(PANEL, PANEL_ARGS);
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.prompt).toContain("Pick the storage engine.");
      expect(call.prompt).not.toContain("undefined");
    }
    expect(calls[0]?.prompt).toContain(PANEL_ARGS.codexExec);
    expect(calls[0]?.prompt).toContain(PANEL_ARGS.cwd);
    expect(calls[1]?.opts.schema).toEqual(PANELIST_SCHEMA);
    expect(calls[2]?.opts.schema).toEqual(JUDGE_SCHEMA);
  });

  it("panel accepts args as a JSON-encoded string", async () => {
    const { calls } = await runScript(PANEL, JSON.stringify(PANEL_ARGS));
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.prompt).toContain("Pick the storage engine.");
      expect(call.prompt).not.toContain("undefined");
    }
  });

  it("panel refuses to dispatch when a required field is missing", async () => {
    for (const missing of ["task", "cwd", "codexExec", "panelistSchema", "judgeSchema"]) {
      const args: Record<string, unknown> = { ...PANEL_ARGS };
      delete args[missing];
      await expect(runScript(PANEL, args)).rejects.toThrow(
        `args.${missing} is required`,
      );
    }
  });

  it("panel refuses args that are not valid JSON", async () => {
    await expect(runScript(PANEL, "not json")).rejects.toThrow();
  });

  it("panel refuses a Sol dispatch whose codex run failed, instead of comparing a fabricated draft", async () => {
    await expect(runScript(PANEL, PANEL_ARGS, 1)).rejects.toThrow(
      "a panelist returned no draft",
    );
  });

  it("review dispatch sends the brief from object args", async () => {
    const { calls } = await runScript(REVIEW, { brief: "Review this diff." });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.prompt).toBe("Review this diff.");
  });

  it("review dispatch accepts args as a JSON-encoded string", async () => {
    const { calls } = await runScript(
      REVIEW,
      JSON.stringify({ brief: "Review this diff." }),
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]?.prompt).toBe("Review this diff.");
  });

  it("review dispatch refuses a missing brief", async () => {
    await expect(runScript(REVIEW, {})).rejects.toThrow("args.brief is required");
  });

  it("every bundled workflow script normalizes string args", () => {
    // Discovery by the meta marker, not a hardcoded list: a future workflow
    // script that skips normalization re-ships the undefined-args bug.
    const scripts = readdirSync(join(ROOT, "skills"), { recursive: true })
      .map(String)
      .filter((path) => path.endsWith(".js"))
      .filter((path) =>
        readFileSync(join(ROOT, "skills", path), "utf8").includes("export const meta"),
      );
    expect(scripts.length).toBeGreaterThanOrEqual(2);
    for (const path of scripts) {
      expect(
        readFileSync(join(ROOT, "skills", path), "utf8"),
        `${path} must parse a string args value before reading fields`,
      ).toContain("typeof args === 'string'");
    }
  });
});
