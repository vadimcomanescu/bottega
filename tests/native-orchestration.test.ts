import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function read(path: string) {
  return readFileSync(join(ROOT, path), "utf8");
}

function section(source: string, heading: string, nextHeading?: string) {
  const start = source.indexOf(heading);
  const end = nextHeading ? source.indexOf(nextHeading, start + heading.length) : source.length;
  if (start < 0 || end < 0) return "";
  return source.slice(start, end);
}

describe("dual-host orchestration", () => {
  it("keeps one host-neutral run method and selects one transport", () => {
    const run = read("skills/run/SKILL.md");
    const transports = read("skills/run/references/host-transports.md");

    expect(run).toContain("references/host-transports.md");
    expect(run).toMatch(/active Bottega orchestrator/i);
    expect(run).toMatch(/The user appears twice/i);
    expect(run).not.toMatch(/You are the orchestrator: Fable/i);
    expect(transports).toMatch(/## Codex host/);
    expect(transports).toMatch(/## Claude Code host/);
  });

  it("uses the active GPT-5.6 Sol Ultra task and native subagents on Codex", () => {
    const transports = read("skills/run/references/host-transports.md");
    const codex = section(transports, "## Codex host", "## Claude Code host");

    expect(codex).toMatch(/GPT-5\.6 Sol/);
    expect(codex).toMatch(/Ultra/);
    expect(codex).toMatch(/current Codex task|active Codex task/i);
    expect(codex).toMatch(/native subagents/i);
    expect(codex).toMatch(/Never launch another Codex process/i);
    expect(codex).toContain("scripts/claude-exec");
    expect(codex).not.toContain("scripts/codex-exec");
    expect(existsSync(join(ROOT, ".codex", "agents"))).toBe(false);
    expect(existsSync(join(ROOT, "skills", "setup"))).toBe(false);
  });

  it("retains the Claude host route guard and bounded Codex adapter", () => {
    const transports = read("skills/run/references/host-transports.md");
    const claude = section(transports, "## Claude Code host");

    expect(claude).toMatch(/Fable 5/i);
    expect(claude).toContain("hooks/route-guard.js");
    expect(claude).toContain("scripts/codex-exec");
    expect(claude).toContain("$CLAUDE_PLUGIN_ROOT");
  });

  it("ships reusable native worker inputs instead of installed Codex agents", () => {
    expect(existsSync(join(ROOT, "agents", "mechanic.md"))).toBe(true);
    expect(read("agents/builder.md")).toMatch(/orchestrator's architecture brief/i);
    expect(read("agents/reviewer.md")).toMatch(/orchestrator's architecture brief/i);
    expect(read("agents/qa.md")).toMatch(/orchestrator can classify and route it/i);
  });

  it("keeps review and panel doctrine shared while transport stays host-specific", () => {
    const review = read("skills/review/SKILL.md");
    const panel = read("skills/panel/SKILL.md");

    expect(review).toContain("../run/references/host-transports.md");
    expect(panel).toContain("../run/references/host-transports.md");
    expect(review).not.toContain("Workflow({");
    expect(panel).not.toContain("Workflow({");
    expect(panel).toMatch(/orchestrator.*makes the decision/i);
  });
});
