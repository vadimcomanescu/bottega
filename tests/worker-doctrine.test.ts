import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

const run = read("skills/run/SKILL.md");
const implementing = read("skills/implementing/SKILL.md");
const reviewing = read("skills/reviewing/SKILL.md");
const design = read("skills/codebase-design/SKILL.md");
const codexDispatch = read("skills/run/references/codex-dispatch.md");
const agents = read("AGENTS.md");

describe("worker doctrine handoffs", () => {
  it("carries one architecture contract from Fable through build and review", () => {
    expect(design).toContain("## Architecture contract");
    expect(design).toContain("stable ID");
    expect(design).toContain("A shared invariant is an overlap even when file lists do not overlap");
    expect(implementing).toContain("Read `../codebase-design/SKILL.md` first");
    expect(run).toContain("The exact same artifact goes to builders and reviewers");
    expect(reviewing).toContain("one `architecture_checks` entry per contract ID");
  });

  it("carries the domain model through spec, implementation, and review", () => {
    expect(run).toContain("create or update `CONCEPTS.md` after approval and before building");
    expect(run).toContain("the domain-glossary path");
    expect(implementing).toContain("the domain glossary it names");
    expect(reviewing).toContain("approved spec, exact architecture contract, and domain glossary");
    expect(design).toContain("Builders consume the glossary");
  });

  it("routes available technology skills across both builder runtimes", () => {
    expect(run).toContain("Inventory each worker runtime's available technology skills");
    expect(run).toContain("give Codex absolute `SKILL.md` paths");
    expect(implementing).toContain("If the runtime exposes skills");
    expect(codexDispatch).toContain("Role and technology skills by absolute path");
    expect(codexDispatch).toContain("each directly relevant technology skill");
  });

  it("keeps final QA independent while Fable classifies the repair route", () => {
    expect(run).toContain("QA is an independent verifier and never an implementer");
    expect(run).toContain("classify the evidence before routing it");
    expect(run).toContain("presentation defect inside the contract goes to a user-facing builder");
    expect(run).toContain("A wrong spec, domain model, interface, or architecture returns to Plan");
    expect(run).toContain("a fresh opposite-family reviewer checks the delta against that ID");
    expect(run).toContain("a new both-family integrated review before fresh QA");
    expect(run).toContain("Never fix anything; report and stop");
  });

  it("makes user-facing builders drive the product before final QA", () => {
    expect(implementing).toContain("drive the changed behavior in the real local artifact");
    expect(implementing).toContain("the product-surface drive for user-facing work");
  });

  it("keeps reusable worker methods shared across Claude and Codex", () => {
    expect(read("agents/builder.md")).toContain("skills/implementing/SKILL.md");
    expect(read("agents/reviewer.md")).toContain("skills/reviewing/SKILL.md");
    expect(codexDispatch).toContain("skills/implementing/SKILL.md");
    expect(codexDispatch).toContain("skills/codebase-design/SKILL.md");
  });

  it("keeps attribution badges out of delivery PRs", () => {
    expect(run).toContain("Keep tool, model, and vendor attribution badges or footers out of the PR body");
    expect(agents).toContain("Omit tool, model, and vendor attribution badges or footers");
  });
});
