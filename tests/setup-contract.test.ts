import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("setup contract", () => {
  const setup = read("skills/setup/SKILL.md");

  it("carries the vendored sections and the five triage roles", () => {
    expect(setup).toContain("name: setup");
    expect(setup).toContain("Skip this section entirely if the `triage` skill isn't installed");
    expect(setup).toContain(
      "`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`",
    );
  });

  it("creates the labels on the remote instead of only naming them", () => {
    expect(setup).toContain("create every label named in `docs/agents/triage-labels.md`");
    expect(setup).toContain("gh label create <label>");
    expect(setup).toContain("Existing labels stay exactly as they are.");
  });

  it("settles the branch claim in one question and ships it in the tracker templates", () => {
    expect(setup).toContain("Should an agent claim an issue by creating its branch?");
    for (const template of ["issue-tracker-github.md", "issue-tracker-gitlab.md"]) {
      const tracker = read(join("skills/setup", template));
      expect(tracker).toContain("## Claiming an issue");
      expect(tracker).toContain("--force-with-lease=refs/heads/issue/<n>:");
      expect(tracker).toContain("Assignment is the human-visible signal, never the lock");
    }
  });

  it("leaves to the run what the run heals itself", () => {
    const open = read("skills/open/SKILL.md");
    expect(open).toContain("Follow its claim procedure without changing my checkout.");
    expect(open).toContain(
      "When no map or command owner exists, discover the commands from the repository",
    );
    // What lands a PR is read where the commands are read, so close delivers
    // under the project's own procedure instead of one repository's defaults
    // (docs/lessons/what-lands-a-pr-is-the-projects-fact.md).
    expect(open, "the run reads what lands a PR beside the commands").toContain(
      "The landing procedure is one of those facts",
    );
    expect(open, "the three facts close needs are named where they are read").toContain(
      "what arms a PR to land (the opener arms it, a merge queue takes every non-draft PR, or nothing does)",
    );
  });
});
