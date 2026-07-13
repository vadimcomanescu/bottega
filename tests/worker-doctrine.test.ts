import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function phase(text: string, number: number): string {
  const start = text.indexOf(`**${number}.`);
  const end = text.indexOf(`**${number + 1}.`, start + 1);
  return text.slice(start, end < 0 ? undefined : end);
}

const run = read("skills/run/SKILL.md");
const implementing = read("skills/implementing/SKILL.md");
const reviewing = read("skills/reviewing/SKILL.md");
const codexDispatch = read("skills/run/references/codex-dispatch.md");
const panel = read("skills/run/assets/panel.js");

describe("worker doctrine boundaries", () => {
  it("separates implementation, architecture review, and product QA", () => {
    expect(implementing).toMatch(/one slice, then stop/i);
    expect(implementing).not.toMatch(/product-surface|recording|scenario verdict/i);
    expect(implementing).not.toContain("codebase-design/SKILL.md");
    expect(reviewing).toContain("../codebase-design/SKILL.md");
    expect(reviewing).toContain("`architecture` verdict");
    expect(phase(run, 5)).not.toMatch(/drive the (real )?product|recording|scenario verdict/i);
    expect(phase(run, 6)).toMatch(/accept.*reviewed head/i);
    expect(phase(run, 7)).toMatch(/changed product surface/i);
    expect(phase(run, 7)).toMatch(/never an implementer or architecture reviewer/i);
  });

  it("keeps the Ponytail ladder ordered and the slice fenced", () => {
    const rungs = [
      "need not exist",
      "codebase already has it",
      "standard library",
      "platform has it",
      "installed dependency",
      "direct expression",
      "minimum new code",
    ];
    const positions = rungs.map((rung) => implementing.indexOf(rung));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(implementing).toMatch(/architecture, interface, domain language, and owned files are fixed/i);
    expect(implementing).toMatch(/next task nor nearby cleanup/i);
  });

  it("shares builder and reviewer methods only across real call sites", () => {
    expect(read("agents/builder.md")).toContain("skills/implementing/SKILL.md");
    expect(read("agents/reviewer.md")).toContain("skills/reviewing/SKILL.md");
    expect(codexDispatch).toContain("skills/implementing/SKILL.md");
    expect(codexDispatch).toContain("skills/reviewing/SKILL.md");
    expect(existsSync(join(ROOT, "agents/panelist.md"))).toBe(false);
    expect(existsSync(join(ROOT, "agents/panel-judge.md"))).toBe(false);
    expect(existsSync(join(ROOT, "skills/panel/SKILL.md"))).toBe(false);
    expect(panel).toContain("You are one independent panelist");
    expect(panel).toContain("You compare blinded drafts");
  });

  it("supplies matching technology skills without giving builders design authorship", () => {
    expect(phase(run, 2)).toMatch(/technology skills/i);
    expect(phase(run, 5)).toMatch(/technology skills/i);
    expect(codexDispatch).toContain("each directly relevant technology skill");
    expect(codexDispatch).not.toMatch(/builder gets `skills\/implementing\/SKILL\.md`, `skills\/codebase-design/);
  });

  it("keeps attribution badges out of delivery PRs", () => {
    expect(phase(run, 8)).toMatch(/attribution badges or footers out of the PR body/i);
    expect(read("AGENTS.md")).toMatch(/omit tool, model, and vendor attribution badges or footers/i);
  });
});
