// gate-diff is the sign-blocking fence: the hosted gate doc's gherkin fences
// must carry every line of the feature files, in order. Slicing into
// per-scenario fences and re-indenting are licensed; editing and dropping are
// not.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const GATE_DIFF = join(
  import.meta.dirname,
  "..",
  "skills",
  "signoff",
  "assets",
  "gate-diff.mjs",
);

const FEATURE = `Feature: Saved searches

  Scenario: Save a search
    Given a signed-in shopper
    When they save "red sneakers"
    Then "red sneakers" appears under Saved searches

  Scenario: Remove a saved search
    Given "red sneakers" is saved
    When the shopper removes it
    Then Saved searches is empty
`;

// The gate rendering slices the file into per-scenario fences and dedents.
const HOSTED_CLEAN = `# Gate doc

Standing header prose, never compared.

\`\`\`gherkin
Feature: Saved searches
\`\`\`

## Scenario — Save a search

\`\`\`gherkin
Scenario: Save a search
  Given a signed-in shopper
  When they save "red sneakers"
  Then "red sneakers" appears under Saved searches
\`\`\`

## Scenario — Remove a saved search

\`\`\`gherkin
Scenario: Remove a saved search
  Given "red sneakers" is saved
  When the shopper removes it
  Then Saved searches is empty
\`\`\`
`;

const cleanups: string[] = [];
afterEach(() => {
  while (cleanups.length > 0) rmSync(cleanups.pop()!, { recursive: true, force: true });
});

function gateDir(hosted: string): string {
  const dir = mkdtempSync(join(tmpdir(), "bottega-gate-diff-"));
  cleanups.push(dir);
  mkdirSync(join(dir, "features"));
  writeFileSync(join(dir, "features", "saved-searches.feature"), FEATURE);
  writeFileSync(join(dir, "hosted.md"), hosted);
  return dir;
}

function runDiff(dir: string) {
  return spawnSync(
    "node",
    [GATE_DIFF, join(dir, "hosted.md"), join(dir, "features", "saved-searches.feature")],
    { encoding: "utf-8" },
  );
}

describe("gate-diff", () => {
  it("passes a sliced, re-indented rendering that carries every line", () => {
    const result = runDiff(gateDir(HOSTED_CLEAN));
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  });

  it("blocks an edited step", () => {
    const result = runDiff(gateDir(HOSTED_CLEAN.replace('"red sneakers"', '"blue sneakers"')));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/mismatch/);
  });

  it("blocks a rendering that dropped a scenario", () => {
    const withoutLast = HOSTED_CLEAN.slice(0, HOSTED_CLEAN.indexOf("## Scenario — Remove"));
    const result = runDiff(gateDir(withoutLast));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/extra line/);
  });

  it("blocks a doc with no gherkin fences at all", () => {
    const result = runDiff(gateDir("# Gate doc\n\nprose only\n"));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/no gherkin fences/);
  });
});
