import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

const LIFECYCLE = [
  "skills/setup/SKILL.md",
  "skills/setup/issue-tracker-beads.md",
  "skills/open/SKILL.md",
  "skills/close/SKILL.md",
  "skills/spec/SKILL.md",
];

describe("setup contract", () => {
  it("ships the beads tracker template", () => {
    expect(existsSync(join(ROOT, "skills/setup/issue-tracker-beads.md"))).toBe(true);
  });

  it("keeps the run lifecycle off GitHub issues, which carry delivery only", () => {
    for (const path of LIFECYCLE) {
      expect(read(path), `${path} still drives work through gh issue`).not.toMatch(/gh issue /);
    }
  });

  it("closes the bead from the agent watching the merge", () => {
    expect(read("skills/close/SKILL.md")).toContain(
      'bd close <bead-id> --reason "PR #<n> merged"',
    );
    expect(read("skills/open/SKILL.md")).toContain("run `bd close` on its bead");
  });

  it("links only templates that exist", () => {
    const targets = [...read("skills/setup/SKILL.md").matchAll(/]\(\.\/([^)]+)\)/g)]
      .map(([, target]) => target)
      .filter((target): target is string => target !== undefined);
    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) {
      expect(existsSync(join(ROOT, "skills/setup", target)), `missing ${target}`).toBe(true);
    }
  });
});
