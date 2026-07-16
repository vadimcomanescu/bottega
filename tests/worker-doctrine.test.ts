import { existsSync, readFileSync, readdirSync } from "node:fs";
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
const design = read("skills/codebase-design/SKILL.md");
const panelSkill = read("skills/panel/SKILL.md");
const panelWorkflow = read("skills/panel/panel.js");
const qa = read("agents/qa.md");
const codexDispatch = read("skills/run/references/codex-dispatch.md");
const reviewDispatch = read("skills/review/SKILL.md");
const land = read("skills/land/SKILL.md");

describe("worker doctrine boundaries", () => {
  it("keeps reusable methods in skills and single-role identity in agents", () => {
    expect(readdirSync(join(ROOT, "agents")).sort()).toEqual([
      "builder.md",
      "panel-judge.md",
      "panelist.md",
      "qa.md",
      "reviewer.md",
    ]);
    expect(
      readdirSync(join(ROOT, "skills"), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort(),
    ).toEqual(["codebase-design", "implementing", "land", "panel", "review", "reviewing", "run"]);

    expect(read("agents/builder.md")).toContain("bottega:implementing");
    expect(read("agents/reviewer.md")).toContain("bottega:reviewing");
    expect(read("agents/reviewer.md")).toContain("bottega:codebase-design");
    expect(codexDispatch).toContain("skills/implementing/SKILL.md");
    expect(codexDispatch).toContain("skills/reviewing/SKILL.md");
    expect(codexDispatch).toContain("skills/codebase-design/SKILL.md");

    expect(existsSync(join(ROOT, "skills/panel/SKILL.md"))).toBe(true);
    expect(existsSync(join(ROOT, "agents/panelist.md"))).toBe(true);
    expect(existsSync(join(ROOT, "agents/panel-judge.md"))).toBe(true);
    expect(panelWorkflow).toContain("agentType: 'bottega:panelist'");
    expect(panelWorkflow).toContain("agentType: 'bottega:panel-judge'");

    expect(existsSync(join(ROOT, "agents/qa.md"))).toBe(true);
    expect(existsSync(join(ROOT, "skills/qa/SKILL.md"))).toBe(false);
  });

  it("keeps internal methods model-loadable and out of the user command list", () => {
    for (const skill of [implementing, reviewing, design, panelSkill]) {
      expect(skill).toContain("user-invocable: false");
      expect(skill).not.toContain("disable-model-invocation: true");
    }
    for (const entry of [run, reviewDispatch, land]) {
      expect(entry).not.toContain("user-invocable: false");
    }
  });

  it("keeps the Ponytail checks ordered after understanding the behavior", () => {
    const understand = implementing.indexOf("## Understand first");
    const options = [
      "behavior need not exist",
      "codebase already has it",
      "standard library has it",
      "platform has it",
      "installed dependency has it",
      "one clear direct expression does it",
      "minimum new code",
    ];
    const positions = options.map((option) => implementing.indexOf(option));
    expect(understand).toBeGreaterThanOrEqual(0);
    expect(positions.every((position) => position > understand)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(implementing).toMatch(/reproduce.*deterministically.*earliest shared cause/i);
  });

  it("applies YAGNI to presumed capability, never to product or internal quality", () => {
    expect(implementing).toMatch(/YAGNI applies to presumptive features.*extensibility.*abstractions/i);
    expect(implementing).toMatch(/does not excuse incomplete behavior.*validation.*data handling.*accessibility.*security.*misleading names.*duplicated logic.*misplaced domain rules/i);
    expect(design).toMatch(/YAGNI to presumptive capabilities and flexibility/i);
    expect(design).toMatch(/Do not use it to avoid refactoring.*tests.*validation.*security.*accessibility.*data safety/i);
  });

  it("gives builders implementation freedom without architecture authorship", () => {
    expect(implementing).toMatch(/Fable owns the domain model, architecture, and interfaces/i);
    expect(implementing).toMatch(/simplest correct implementation behind them/i);
    expect(implementing).toMatch(/different ownership.*interface change.*dependency direction.*domain meaning.*stop and ask Fable/i);
    expect(implementing).toMatch(/supplied technology skills/i);
    expect(implementing).toMatch(/installed version and primary vendor documentation/i);
    expect(implementing).toMatch(/browser or desktop drive is optional.*independent product verdict belongs to QA/i);
    expect(implementing).not.toMatch(/recording|scenario verdict/i);
  });

  it("makes the architecture brief domain-first, decisive, and non-prescriptive", () => {
    expect(design).toMatch(/Model the domain before arranging files/i);
    expect(design).toMatch(/concepts, states, relationships, and invariants/i);
    expect(design).toMatch(/which module owns each behavior and piece of state/i);
    expect(design).toMatch(/complete interfaces and failure behavior/i);
    expect(design).toMatch(/what the builder may change freely behind each interface/i);
    expect(design).toMatch(/not a line-by-line implementation plan/i);
  });

  it("separates independent architecture verification, Fable acceptance, and product QA", () => {
    expect(reviewing).toMatch(/Review the fixed tree independently/i);
    expect(reviewing).toMatch(/Apply the supplied codebase-design doctrine/i);
    expect(reviewing).toMatch(/architecture` verdict: `conforms`, `finding`, or `blocked`/i);
    expect(phase(run, 6)).toMatch(/Reviewers verify conformance/i);
    expect(phase(run, 6)).toMatch(/Fable performs the final architecture step/i);
    expect(phase(run, 6)).toMatch(/not the only verifier of the design it authored/i);

    expect(qa).toMatch(/Verify the product as a user/i);
    expect(qa).toMatch(/You may repair only disposable drive setup and evidence capture/i);
    expect(qa).toMatch(/Never edit product code, product tests, the spec, the domain glossary, or the architecture brief/i);
    expect(phase(run, 7)).toMatch(/implementation defect.*builder that owns/i);
    expect(phase(run, 7)).toMatch(/wrong spec, domain model, interface, or architecture returns to Plan/i);
  });

  it("keeps independently invoked workflows as real skills and wires their assets", () => {
    expect(panelSkill).toContain("skills/panel/panel.js");
    expect(panelSkill).toMatch(/The panel does not vote or decide/i);
    expect(panelWorkflow).toContain("--model gpt-5.6-sol --effort max");
    expect(reviewDispatch).toContain("skills/reviewing/assets/review-dispatch.js");
    expect(existsSync(join(ROOT, "skills/run/references/panel.md"))).toBe(false);
    expect(existsSync(join(ROOT, "skills/run/assets/panel.js"))).toBe(false);
  });

  it("keeps attribution badges out and caps Codex routing at Sol", () => {
    expect(phase(run, 8)).toMatch(/attribution badges or footers out of the PR body/i);
    expect(read("AGENTS.md")).toMatch(/Omit tool, model, and vendor attribution badges or footers/i);
    expect(run).toMatch(/Codex workers never use a multi-agent model tier/i);
    expect(run).toMatch(/Sol at max effort is the ceiling/i);
    const codexModels = [...`${run}\n${panelWorkflow}`.matchAll(/gpt-5\.6-[a-z-]+/g)].map(
      ([model]) => model,
    );
    expect(new Set(codexModels)).toEqual(new Set(["gpt-5.6-sol"]));
  });

  it("relocates the review gate into skills/review and points run step 6 at it", () => {
    expect(existsSync(join(ROOT, "skills/run/references/review.md"))).toBe(false);
    expect(phase(run, 6)).toContain("../review/SKILL.md");
    expect(phase(run, 6)).toMatch(/bottega:review/);
    expect(phase(run, 6)).not.toContain("references/review.md");

    expect(reviewDispatch).toContain("skills/reviewing/assets/review-dispatch.js");
    expect(reviewDispatch).toContain("skills/run/references/codex-dispatch.md");
    expect(reviewDispatch).toMatch(/one reviewer from each model family/i);
    expect(reviewDispatch).toMatch(/two failed fixes stops the repair/i);
    expect(reviewDispatch).toMatch(/round 3 stops the review/i);
    expect(reviewDispatch).toMatch(/No frozen brief/);
    expect(reviewDispatch).toMatch(/doctrine-only/);
  });

  it("routes repository review work to the root REVIEW.md", () => {
    const reviewDoc = read("REVIEW.md");
    expect(reviewDoc).toMatch(/host neutrality/i);
    expect(reviewDoc).toMatch(/frozen/i);
    expect(reviewDoc).toContain("scripts/pr-threads");
    const agents = read("AGENTS.md");
    expect(agents).toContain("## Review guidelines");
    expect(agents).toMatch(/read root `REVIEW\.md` first/i);
  });

  it("has every reviewer read the host's root REVIEW.md when present", () => {
    expect(reviewing).toMatch(/root `REVIEW\.md`/);
    expect(reviewing).toMatch(/applies in every round/i);
    expect(read("agents/reviewer.md")).toContain("bottega:reviewing");
    expect(codexDispatch).toContain("skills/reviewing/SKILL.md");
  });

  it("runs the docs sweep before the review freeze and keeps Deliver free of tracked edits", () => {
    expect(phase(run, 6)).toMatch(/docs sweep/i);
    expect(phase(run, 6)).toMatch(/doc claim the diff falsified/i);
    expect(phase(run, 6)).toMatch(/before the final host gate and the review freeze/i);
    expect(phase(run, 7)).toMatch(/docs sweep over what it changed/i);
    expect(phase(run, 8)).not.toMatch(/docs sweep|doc claim/i);
    expect(phase(run, 8)).toMatch(/changes no tracked file/i);
  });

  it("keeps the land skill carrying the GitHub surface, stops, and merge policy", () => {
    expect(land).toContain("scripts/pr-threads");
    expect(land).toMatch(/never auto-merged/i);
    expect(land).toMatch(/converged/i);
    expect(land).toMatch(/round 3 stops the review/i);
    expect(land).toMatch(/two failed fixes stops that repair/i);
    expect(land).toMatch(/two fix cycles without convergence/i);
    expect(land).toMatch(/exceed the PR's stated intent/i);
    expect(land).toMatch(/size-gated/);
    expect(land).toMatch(/gates-red/);
    expect(land).toMatch(/already on the PR when land starts.*enter round 1 as claimed findings/i);
    expect(land).toMatch(/three brief lines from `skills\/run`.*name every test you edit.*verbatim/i);
  });
});
