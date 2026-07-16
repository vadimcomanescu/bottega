import { existsSync, readFileSync, readdirSync, readlinkSync } from "node:fs";
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
const design = read("skills/codebase-design/SKILL.md");
const panelSkill = read("skills/panel/SKILL.md");
const panelWorkflow = read("skills/panel/panel.js");
const writingSkill = read("skills/writing-great-skills/SKILL.md");
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
    ]);
    expect(
      readdirSync(join(ROOT, "skills"), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort(),
    ).toEqual([
      "autoreview",
      "codebase-design",
      "implementing",
      "land",
      "panel",
      "review",
      "run",
      "writing-great-skills",
    ]);

    expect(read("agents/builder.md")).toContain("bottega:implementing");
    expect(codexDispatch).toContain("skills/implementing/SKILL.md");
    expect(codexDispatch).not.toMatch(/reviewer|skills\/reviewing/i);

    expect(existsSync(join(ROOT, "skills/panel/SKILL.md"))).toBe(true);
    expect(existsSync(join(ROOT, "agents/panelist.md"))).toBe(true);
    expect(existsSync(join(ROOT, "agents/panel-judge.md"))).toBe(true);
    expect(panelWorkflow).toContain("agentType: 'bottega:panelist'");
    expect(panelWorkflow).toContain("agentType: 'bottega:panel-judge'");

    expect(existsSync(join(ROOT, "agents/qa.md"))).toBe(true);
    expect(existsSync(join(ROOT, "skills/qa/SKILL.md"))).toBe(false);
  });

  it("keeps internal methods model-loadable and out of the user command list", () => {
    for (const skill of [implementing, design, panelSkill, writingSkill]) {
      const frontmatter = skill.split("---")[1];
      expect(frontmatter).toContain("user-invocable: false");
      expect(frontmatter).not.toContain("disable-model-invocation: true");
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
    expect(reviewDispatch).toMatch(/review engines.*report/i);
    expect(reviewDispatch).toMatch(/Fable performs this reconciliation/i);
    expect(phase(run, 6)).toMatch(/review engines verify conformance/i);
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

    expect(reviewDispatch).toMatch(/`skills\/autoreview\/SKILL\.md` is the runtime doctrine/i);
    expect(reviewDispatch).toContain("--reviewers codex,claude");
    expect(reviewDispatch).toContain("--model codex=gpt-5.6-sol  --thinking codex=high");
    expect(reviewDispatch).toContain("--model claude=claude-opus-4-8 --thinking claude=xhigh");
    expect(reviewDispatch).not.toMatch(/agentType|bottega:reviewer|review-dispatch/i);
    expect(reviewDispatch).not.toMatch(
      /\b(?:dispatch(?:es|ed|ing)?|agent)\b.{0,40}\breviewer\b|\breviewer\b.{0,40}\b(?:dispatch(?:es|ed|ing)?|agent)\b/i,
    );
    expect(reviewDispatch).toMatch(/two failed fixes stops the repair/i);
    expect(reviewDispatch).toMatch(/round 3 stops the review/i);
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

  it("runs the docs sweep before the review freeze and keeps Deliver free of tracked edits", () => {
    expect(phase(run, 6)).toMatch(/docs sweep/i);
    expect(phase(run, 6)).toMatch(/doc claim the diff falsified/i);
    expect(phase(run, 6)).toMatch(/before the final host gate and the review freeze/i);
    expect(phase(run, 7)).toMatch(/docs sweep over what it changed/i);
    expect(phase(run, 8)).not.toMatch(/docs sweep|doc claim/i);
    expect(phase(run, 8)).toMatch(/changes no tracked file/i);
  });

  it("vendors the skill-writing reference model-invocable and linked for every runtime", () => {
    const frontmatter = writingSkill.split("---")[1];
    expect(frontmatter).not.toContain("disable-model-invocation");
    expect(frontmatter).toContain("user-invocable: false");
    expect(frontmatter).toMatch(/^description: .*creating.*editing.*evaluating.*skill file/im);
    expect(frontmatter).toMatch(/SKILL\.md.*references.*assets.*schemas.*agent files/i);
    expect(existsSync(join(ROOT, "skills/writing-great-skills/GLOSSARY.md"))).toBe(true);
    for (const link of [".claude/skills/writing-great-skills", ".agents/skills/writing-great-skills"]) {
      expect(readlinkSync(join(ROOT, link))).toBe("../../skills/writing-great-skills");
      expect(existsSync(join(ROOT, link, "SKILL.md"))).toBe(true);
    }
    expect(read("AGENTS.md")).toMatch(/skill or agent file, load `skills\/writing-great-skills`/);
  });

  it("keeps the land skill carrying the GitHub surface, stops, and merge policy", () => {
    expect(land).toMatch(/Run every reply and resolution through `scripts\/pr-threads`/i);
    expect(land).toMatch(/converged/i);
    expect(land).toMatch(/round 3 stops the review/i);
    expect(land).toMatch(/two failed fixes stops that repair/i);
    expect(land).toMatch(/two fix cycles without convergence/i);
    expect(land).toMatch(/exceed the PR's stated intent/i);
    expect(land).toMatch(/gates-red/);
    expect(land).toMatch(/never decides to merge/i);
    expect(land).toMatch(/armed merging in their own words|armed it in their own words/i);
    expect(land).toMatch(/risk-path PR.*never merged by land/i);
    expect(land).toContain("gh pr checks <PR> --required --watch");
    expect(land).toMatch(/Confirm the PR is not a draft/i);
    expect(land).toMatch(/live head SHA equals the head SHA the final review round was frozen at/i);
    expect(land).toContain("gh pr merge <PR> --squash --match-head-commit <reviewed-head-sha>");
    expect(land).toMatch(/Confirm the PR state is MERGED/i);
    expect(land).toMatch(/delete the remote branch.*remove the worktree.*run state/i);
    expect(reviewDispatch).toMatch(/commit status on the reviewed head, naming the base/i);
    expect(reviewDispatch).toMatch(/never as a PR comment/i);
    expect(reviewDispatch).toContain('-f context=bottega/review');
    expect(reviewDispatch).toContain('reviewed against base <reviewed-base-sha>');
    expect(land).toMatch(/status is green.*creator is the identity.*description names the base SHA/is);
    expect(land).toMatch(/Treat it as absent/i);
    expect(land).toMatch(/earlier commit of the PR: round 1 reviews the delta, `--base` that SHA/i);
    expect(land).toMatch(/Unresolved threads enter round 1 whatever the marker says/i);
    expect(phase(run, 8)).toMatch(/post the `bottega\/review` success status on the accepted head, naming the reviewed base/i);
    expect(land).toMatch(/already on the PR when land starts.*enter round 1 as claimed findings/i);
    expect(land).toMatch(/three brief lines from `skills\/run`.*name every test you edit.*verbatim/i);
  });
});
