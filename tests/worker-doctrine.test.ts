import { existsSync, readFileSync, readdirSync, readlinkSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function phase(text: string, number: number): string {
  const start = text.indexOf(`**${number}.`);
  const end = text.indexOf(`**${number + 1}.`, start + 1);
  return text.slice(start, end < 0 ? undefined : end);
}

function section(text: string, heading: string): string {
  const start = text.indexOf(`## ${heading}`);
  if (start < 0) {
    throw new Error(`Section not found: ${heading}`);
  }
  const end = text.indexOf("\n## ", start + 1);
  return text.slice(start, end < 0 ? undefined : end);
}

const deliver = read("skills/deliver/SKILL.md");
const close = read("skills/close/SKILL.md");
const spec = read("skills/spec/SKILL.md");
const specFormat = read("skills/spec/references/spec-format.md");
const specSpine = section(specFormat, "The spine");
const improve = read("skills/improve/SKILL.md");
const implementing = read("skills/implementing/SKILL.md");
const design = read("skills/codebase-design/SKILL.md");
const panelSkill = read("skills/panel/SKILL.md");
const writingSkill = read("skills/writing-great-skills/SKILL.md");
const qa = read("agents/qa.md");
const codexDispatch = read("skills/deliver/references/codex-dispatch.md");
const reviewDispatch = read("skills/review/SKILL.md");
const land = read("skills/land/SKILL.md");

describe("worker doctrine boundaries", () => {
  it("keeps reusable methods in skills and single-role identity in agents", () => {
    expect(readdirSync(join(ROOT, "agents")).sort()).toEqual([
      "builder.md",
      "qa.md",
    ]);
    expect(
      readdirSync(join(ROOT, "skills"), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort(),
    ).toEqual([
      "autoreview",
      "close",
      "codebase-design",
      "deliver",
      "implementing",
      "improve",
      "land",
      "panel",
      "review",
      "setup",
      "spec",
      "writing-great-skills",
    ]);

    expect(read("agents/builder.md")).toContain("bottega:implementing");
    expect(codexDispatch).toContain("skills/implementing/SKILL.md");
    expect(codexDispatch).not.toMatch(/reviewer|skills\/reviewing/i);

    expect(existsSync(join(ROOT, "skills/panel/SKILL.md"))).toBe(true);
    expect(existsSync(join(ROOT, "agents/qa.md"))).toBe(true);
    expect(existsSync(join(ROOT, "skills/qa/SKILL.md"))).toBe(false);
  });

  it("keeps internal methods model-loadable and out of the user command list", () => {
    for (const skill of [close, implementing, design, writingSkill]) {
      const frontmatter = skill.split("---")[1];
      expect(frontmatter).toContain("user-invocable: false");
      expect(frontmatter).not.toContain("disable-model-invocation: true");
    }
    for (const entry of [deliver, reviewDispatch, land, panelSkill]) {
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
    expect(implementing).toMatch(/one command that reproduces the exact reported symptom.*earliest cause in the failing path/i);
  });

  it("applies YAGNI to presumed capability, never to product or internal quality", () => {
    expect(implementing).toMatch(/YAGNI applies to presumptive features.*extensibility.*abstractions/i);
    expect(implementing).toMatch(/does not excuse incomplete behavior.*validation.*data handling.*accessibility.*security.*misleading names.*duplicated logic.*misplaced domain rules/i);
    expect(design).toMatch(/YAGNI to presumptive capabilities and flexibility/i);
    expect(design).toMatch(/Do not use it to avoid refactoring.*tests.*validation.*security.*accessibility.*data safety/i);
  });

  it("gives builders implementation freedom without architecture authorship", () => {
    expect(implementing).toMatch(/orchestrator owns the domain model, architecture, and interfaces/i);
    expect(implementing).toMatch(/simplest correct implementation behind them/i);
    expect(implementing).toMatch(/different ownership.*interface change.*dependency direction.*domain meaning.*stop and ask the orchestrator/i);
    expect(implementing).toMatch(/technology skill supplied with the dispatch/i);
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

  it("separates independent architecture verification, orchestrator acceptance, and product QA", () => {
    expect(reviewDispatch).toMatch(/review engines.*report/i);
    expect(reviewDispatch).toMatch(/orchestrator performs this reconciliation/i);
    expect(phase(deliver, 5)).toMatch(/review engines verify conformance/i);
    expect(phase(deliver, 5)).toMatch(/orchestrator performs the final architecture step/i);
    expect(phase(deliver, 5)).toMatch(/accepting or rejecting the reviewed head is the orchestrator's call/i);

    expect(qa).toMatch(/Verify the product as a user/i);
    expect(qa).toMatch(/You may repair only disposable drive setup and evidence capture/i);
    expect(qa).toMatch(/Never edit product code, product tests, the spec, the domain glossary, or the architecture brief/i);
    expect(phase(deliver, 6)).toMatch(/implementation defect.*builder that owns/i);
    expect(phase(deliver, 6)).toMatch(/wrong spec, domain model, interface, or architecture returns to Plan/i);
  });

  it("keeps the panel a portable skill: CLI seats, blinded drafts, a compare-only judge, caller synthesis", () => {
    expect(panelSkill).toMatch(/The panel does not vote or decide/i);
    expect(panelSkill).toContain("scripts/codex-exec");
    expect(panelSkill).toContain("--model gpt-5.6-sol --effort max");
    expect(panelSkill).toContain("claude -p");
    for (const angle of [
      /consensus/i,
      /contradictions/i,
      /partial coverage/i,
      /unique insights/i,
      /blind spots/i,
    ]) {
      expect(panelSkill).toMatch(angle);
    }
    expect(panelSkill).toMatch(/With two or more drafts, proceed/i);
    expect(panelSkill).toMatch(/Do not answer the task, merge the drafts, vote, grade, or pick one/i);
  });

  it("keeps attribution badges out and caps Codex routing at Sol", () => {
    expect(close).toMatch(/attribution badges and footers out/i);
    expect(read("AGENTS.md")).toMatch(/Omit tool, model, and vendor attribution badges or footers/i);
    expect(deliver).toMatch(/No codex worker gets a tier built to orchestrate its own subagents/i);
    expect(deliver).toMatch(/Sol at max effort is the ceiling/i);
    const codexModels = [...`${deliver}\n${panelSkill}`.matchAll(/gpt-5\.6-[a-z-]+/g)].map(
      ([model]) => model,
    );
    expect(new Set(codexModels)).toEqual(new Set(["gpt-5.6-sol"]));
  });

  it("keeps the review gate in skills/review and points the Review phase at it", () => {
    expect(phase(deliver, 5)).toContain("../review/SKILL.md");
    expect(phase(deliver, 5)).toMatch(/bottega:review/);
    expect(phase(deliver, 5)).not.toContain("references/review.md");

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
    expect(reviewDoc).toMatch(/portability/i);
    expect(reviewDoc).toMatch(/frozen/i);
    expect(reviewDoc).toContain("scripts/pr-threads");
    expect(reviewDoc).toContain("scripts/pr-claim");
    const agents = read("AGENTS.md");
    expect(agents).toContain("## Review guidelines");
    expect(agents).toMatch(/read root `REVIEW\.md` first/i);
  });

  it("runs the docs sweep before the review freeze and keeps Close free of tracked edits", () => {
    expect(phase(deliver, 5)).toMatch(/docs sweep/i);
    expect(phase(deliver, 5)).toMatch(/false claims and missing entries alike/i);
    expect(phase(deliver, 5)).toMatch(/before the final project gate and the review freeze/i);
    expect(phase(deliver, 6)).toMatch(/docs sweep over what it changed/i);
    expect(phase(deliver, 7)).not.toMatch(/docs sweep|doc claim/i);
    expect(close).toMatch(/close has changed no tracked file/i);
  });

  it("invokes the spec skill once and whole, gates approval on the spec-issue marker, and commits the spec to the repo", () => {
    expect(existsSync(join(ROOT, "skills/spec/references/spec-format.md"))).toBe(true);
    expect(phase(deliver, 2)).toMatch(/Invoke.*bottega:spec.*once, whole/i);
    expect(phase(deliver, 2)).toMatch(
      /carries the user's OK only when it is a child ticket of a parent spec issue that `bottega:spec` filed/i,
    );
    expect(phase(deliver, 2)).toMatch(/a plain issue, however detailed.*has no OK yet/i);
    expect(phase(deliver, 2)).toMatch(/docs\/specs\/<slug>\.md/);
    expect(phase(deliver, 7)).toMatch(/bottega:close/);
    expect(close).toMatch(/gh pr checks <PR> --watch/);
    expect(close).toMatch(/excluding the `bottega\/review` status.*own marker/i);
    expect(close).toMatch(/gh pr view <PR> --json mergeable/);
    expect(close).toMatch(/CONFLICTING/);
    expect(close).toMatch(/checks are green and the PR is mergeable/i);
    expect(phase(deliver, 7)).toMatch(/`bottega\/spec-<slug>` branch is permanent/i);
  });

  it("keeps the shared spec method portable and forks only its ending", () => {
    expect(spec).toMatch(/on cheaper tiers, launch a subagent per job that applies/i);
    expect(spec).toMatch(/a subagent returns findings, never a decision/i);
    expect(spec).toMatch(/decision hinges on how something looks or feels.*cannot answer in words/i);
    expect(spec).toMatch(/Prototype code.*never merges/i);
    expect(spec).toMatch(/Invoked directly: ask once whether to push to tickets/i);
    expect(spec).toMatch(/run's front half: hand back to the run's sign-off rules/i);
    expect(spec).toMatch(/Commit the spec as `docs\/specs\/<slug>\.md` on branch `bottega\/spec-<slug>`/);
    expect(spec).toMatch(/A ticket is queue state, never the spec's home/i);
    for (const file of [spec, specFormat]) {
      expect(file).not.toMatch(/sonnet|opus|gpt-5/i);
    }
  });

  it("runs the field pass unconditionally, proposes before grilling, and presents live", () => {
    expect(spec).toMatch(/Run the field job on any product-shaped work/i);
    expect(spec).toMatch(/the field answers the standard way/i);
    expect(spec).toMatch(/## 2\. Propose independently/);
    expect(spec).toMatch(/Run this step only when all three hold/i);
    expect(spec).toMatch(/at least two credible product directions survive/i);
    expect(spec).toMatch(/expensive to undo or hard to notice later/i);
    expect(spec).toContain("../panel/SKILL.md");
    expect(spec).toMatch(/Present the spec as a live shared document/i);
    expect(spec).toContain("references/live-review.md");
    expect(spec).toMatch(/same review happens in the conversation/i);
    expect(spec).toMatch(/approval may arrive as a comment in the document/i);
  });

  it("pins the spec spine, precedent rule, and prose rules", () => {
    for (const spinePart of [
      /Problem to solve/i,
      /How we measure success/i,
      /The launch post/i,
      /Decisions.*veto any decision/i,
      /Details/i,
      /Acceptance criteria/i,
      /Out of scope/i,
      /Deferred to the build/i,
    ]) {
      expect(specSpine).toMatch(spinePart);
    }
    expect(specFormat).toMatch(/floor, not a template/i);
    expect(specFormat).toMatch(/## The precedent rule/);
    expect(specFormat).toMatch(/names the standard way the field already solves/i);
    expect(specFormat).toMatch(/shows the searches that came up empty/i);
    for (const proseRule of [
      /Lead with the decision/i,
      /One idea per sentence/i,
      /Cut hedges and intensifiers/i,
      /Prefer the verb to the nominalization/i,
      /No file paths and no code snippets.*prototype-derived snippet/i,
      /names whose problem it solves when the feature serves users whose problems genuinely differ/i,
    ]) {
      expect(specFormat).toMatch(proseRule);
    }
    expect(specFormat).toMatch(/announcing the finished behavior/);
    expect(specFormat).toMatch(/never a label the text does not itself define/);
    expect(improve).toMatch(/Write for a reader who was not in this session/);
  });

  it("makes the review flag hand-built solutions to solved problems", () => {
    expect(reviewDispatch).toMatch(
      /hand-built implementation of a problem a standard, available solution already solves/i,
    );
  });

  it("parses every skill frontmatter under strict YAML", () => {
    const skillDirs = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    for (const dir of skillDirs) {
      const file = join("skills", dir, "SKILL.md");
      if (!existsSync(join(ROOT, file))) {
        continue;
      }
      const text = read(file);
      const open = text.indexOf("---");
      const close = text.indexOf("\n---", open + 3);
      expect(open, `${file} has no frontmatter`).toBe(0);
      const frontmatter = text.slice(open + 3, close);
      expect(() => parseYaml(frontmatter, { strict: true }), file).not.toThrow();
    }
  });

  it("pins Deliver's reader, evidence, and follow-up contracts", () => {
    expect(close).toMatch(/Write for a reader who was not in the run and has not read the spec/);
    expect(close).toMatch(/never use a label the document does not itself define/i);

    const evidencePath = "skills/close/references/qa-evidence.md";
    expect(existsSync(join(ROOT, evidencePath))).toBe(true);
    const evidence = read(evidencePath);
    expect(evidence).toMatch(/never deleted/i);
    expect(evidence).toMatch(/blob page/i);
    expect(evidence).toMatch(/raw URLs/i);

    expect(close).toMatch(/gh pr create -F/);
    expect(close).toMatch(/becomes one tracker issue/i);
    expect(section(reviewDispatch, "Adjudicate")).toMatch(/follow-up.*close/i);
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
    expect(land).toMatch(/session claim through `scripts\/pr-claim`/i);
    expect(land).toMatch(/converged/i);
    expect(land).toMatch(/round 3 stops the review/i);
    expect(land).toMatch(/two failed fixes stops that repair/i);
    expect(land).toMatch(/two rounds of fixes without convergence/i);
    expect(land).toMatch(/exceed the PR's stated intent/i);
    expect(land).toMatch(/gates-red/);
    expect(land).toMatch(/never decides to merge/i);
    expect(land).toMatch(/armed merging in their own words|armed it in their own words/i);
    expect(land).toMatch(/risk-path PR.*never merged by land/i);
    expect(land).toContain("gh pr checks <PR> --required --watch");
    expect(land).toMatch(/Confirm the PR is not a draft/i);
    expect(land).toMatch(/live head SHA equals the head SHA the final review round was frozen at/i);
    expect(land).toMatch(/target base SHA still equals the base the review was frozen at/i);
    expect(land).toMatch(/--match-head-commit` pins only the head/i);
    expect(land).toContain("gh pr merge <PR> --squash --match-head-commit <reviewed-head-sha>");
    expect(land).toMatch(/Confirm the PR state is MERGED/i);
    expect(land).toMatch(/delete the remote branch.*remove the worktree.*run state/i);
    expect(reviewDispatch).toMatch(/commit status on the reviewed head, naming the base/i);
    expect(reviewDispatch).toMatch(/never as a PR comment/i);
    expect(reviewDispatch).toContain('-f context=bottega/review');
    expect(reviewDispatch).toContain('reviewed against base <reviewed-base-sha>');
    expect(land).toMatch(/status is green.*creator is the GitHub identity.*description names the base SHA/is);
    expect(land).toMatch(/Treat it as absent/i);
    expect(land).toMatch(/earlier commit of the PR: round 1 reviews the delta, `--base` that SHA/i);
    expect(land).toMatch(/Unresolved review threads already on the PR when land starts.*enter round 1 as claimed findings/i);
    expect(close).toMatch(/post the `bottega\/review` success status on the accepted head, naming the reviewed base/i);
    expect(land).toMatch(/already on the PR when land starts.*enter round 1 as claimed findings/i);
    expect(land).toMatch(/three brief lines from `skills\/deliver`.*name every test you edit.*verbatim/i);
  });
});
