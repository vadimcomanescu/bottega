import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("setup semantic reconciliation", () => {
  const setup = read("skills/setup/SKILL.md");

  it("uses existing owners and creates only actual routes", () => {
    expect(setup).toContain("An existing map route or owner doc wins wherever it lives");
    expect(setup).toContain("A conforming repository receives no file or GitHub changes.");
    expect(setup).toContain("<!-- bottega:setup begin -->");
    expect(setup).toContain("whatever its markers");
    expect(setup).toContain("never leave two");
    expect(setup).toContain(
      "When no equivalent owner exists, `docs/agents/issue-tracker.md` and `docs/agents/domain.md` are the fallback owners",
    );
  });

  it("migrates domain material only into homes the repository declares", () => {
    expect(setup).toContain("formats per `bottega:domain-modeling`");
    expect(setup).toContain("Existing formats win.");
    expect(read("skills/improve/SKILL.md")).toContain(
      "Treat genuinely absent domain material as absent, not as a setup requirement.",
    );
  });

  it("keeps GitHub claims and landing conditional on repository evidence", () => {
    expect(setup).toContain("no concurrency-safe claim exists");
    expect(setup).toContain("git push -u origin <branch> --force-with-lease=refs/heads/<branch>:");
    expect(setup).toContain("Assignment is the human-visible signal, not the lock");
    expect(setup).toContain("[merge-governance reference](references/merge-governance.md)");
    const governance = read("skills/setup/references/merge-governance.md");
    expect(governance).toContain("Ensure CI also runs for `merge_group`");
    expect(governance).toContain("merge_protections_settings.auto_merge_conditions");
    expect(governance).toContain("`opened`, `reopened`, `synchronize`, `labeled`, and `unlabeled`");
    expect(governance).toContain("Do not merge directly.");
    const open = read("skills/open/SKILL.md");
    expect(open).toContain("Follow its claim procedure without changing my checkout.");
    expect(open).toContain("reserve that claim from the isolated worktree");
    expect(open).toContain("complete any assignment or other human-visible signal");
    expect(open).toContain("Preserve the tracker owner's force-push rule.");
    expect(open).toContain("When no map or command owner exists, discover the commands from the repository");
  });
});
