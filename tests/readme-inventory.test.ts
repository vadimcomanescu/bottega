import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const SKILLS_ROOT = join(ROOT, "skills");

function frontmatter(skillPath: string): string {
  const match = readFileSync(skillPath, "utf8").match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : "";
}

const userInvocableSkills = readdirSync(SKILLS_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()
  .filter((name) => existsSync(join(SKILLS_ROOT, name, "SKILL.md")))
  .filter((name) => !existsSync(join(SKILLS_ROOT, name, "VENDOR")))
  .filter(
    (name) =>
      !/^user-invocable:\s*false\s*$/m.test(
        frontmatter(join(SKILLS_ROOT, name, "SKILL.md")),
      ),
  );

describe("README inventory", () => {
  it("derives a non-empty user-invocable set, so the inventory check cannot pass vacuously", () => {
    expect(userInvocableSkills.length).toBeGreaterThan(0);
  });

  it("documents every user-invocable skill in README as /bottega:<name>", () => {
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    for (const name of userInvocableSkills) {
      expect(
        readme.includes(`/bottega:${name}`),
        `README.md must document /bottega:${name}`,
      ).toBe(true);
    }
  });
});
