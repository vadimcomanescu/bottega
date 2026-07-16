import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function json(path: string) {
  return JSON.parse(read(path));
}

describe("repository contribution workflow", () => {
  it("requires every tracked-file change to use a linked worktree, branch, and pull request", () => {
    const agents = read("AGENTS.md");
    const readme = read("README.md");
    const ignored = read(".gitignore").split("\n");

    expect(agents).toMatch(
      /Every task that changes tracked files.*dedicated branch.*isolated linked worktree.*pull request/is,
    );
    expect(agents).toMatch(/primary checkout.*must not receive tracked-file edits/i);
    expect(agents).toContain("docs/internal/repository-workflow.md");
    expect(readme).toContain("docs/internal/repository-workflow.md");
    expect(ignored).toContain(".worktrees/");
  });

  it("documents the complete local lifecycle and decisive gates", () => {
    const workflow = read("docs/internal/repository-workflow.md");

    expect(workflow).toContain("git worktree list --porcelain");
    expect(workflow).toContain("git fetch --prune origin");
    expect(workflow).toContain("git worktree add -b <branch> .worktrees/<slug> origin/main");
    expect(workflow).toMatch(/already in a linked\s+worktree.*reuse it/is);
    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("npm test");
    expect(workflow).toContain("npm run typecheck");
    expect(workflow).toMatch(/never bypass.*--no-verify/is);
    expect(workflow).toMatch(/draft pull request/i);
    expect(workflow).toMatch(/remove the\s+linked worktree/i);
  });

  it("keeps issue readiness separate from an optimistic-lock claim", () => {
    const workflow = read("docs/internal/repository-workflow.md");
    const labels = read("docs/internal/triage-labels.md");

    expect(workflow).toContain("agent:working");
    expect(workflow).toContain("agent-claim:");
    expect(workflow).toMatch(/read back.*claim/i);
    expect(workflow).toMatch(/30 minutes.*no\s+branch or pull request/is);
    expect(workflow).toContain("Closes #<n>");
    expect(workflow).toMatch(/self-contained work.*without a backing issue/i);

    for (const label of [
      "needs-triage",
      "needs-info",
      "ready-for-agent",
      "ready-for-human",
      "wontfix",
      "agent:working",
    ]) {
      expect(labels).toContain(`\`${label}\``);
    }
    expect(labels).toMatch(/readiness.*not activity/i);
  });

  it("defines the Bottega ownership label axis", () => {
    const labels = read("docs/internal/triage-labels.md");

    for (const label of [
      "area:plugin",
      "area:skills",
      "area:agents",
      "area:transports",
      "area:hooks",
      "area:docs",
      "area:repo",
    ]) {
      expect(labels).toContain(`\`${label}\``);
    }
    expect(labels).toMatch(/Every issue.*at least one.*area:\*/is);
  });

  it("ships a PR-only main ruleset with the real release checks", () => {
    const ruleset = json(".github/rulesets/main.json");
    const rulesetReadme = read(".github/rulesets/README.md");
    const workflow = read(".github/workflows/release-gate.yml");
    const rules = new Map(ruleset.rules.map((rule: { type: string }) => [rule.type, rule]));

    expect(ruleset.enforcement).toBe("active");
    expect(ruleset.conditions.ref_name.include).toEqual(["~DEFAULT_BRANCH"]);
    expect(ruleset.bypass_actors).toEqual([]);
    expect(rules.has("deletion")).toBe(true);
    expect(rules.has("non_fast_forward")).toBe(true);

    const pullRequest = rules.get("pull_request") as {
      parameters: {
        allowed_merge_methods: string[];
        required_approving_review_count: number;
        required_review_thread_resolution: boolean;
      };
    };
    expect(pullRequest.parameters.required_approving_review_count).toBe(0);
    expect(pullRequest.parameters.required_review_thread_resolution).toBe(true);
    expect(pullRequest.parameters.allowed_merge_methods).toEqual(["squash"]);

    const requiredChecks = rules.get("required_status_checks") as {
      parameters: {
        required_status_checks: Array<{ context: string }>;
        strict_required_status_checks_policy: boolean;
      };
    };
    expect(requiredChecks.parameters.strict_required_status_checks_policy).toBe(true);
    expect(requiredChecks.parameters.required_status_checks.map(({ context }) => context).sort()).toEqual([
      "gate-test",
      "gate-version-bump",
    ]);
    expect(workflow).toContain("name: gate-version-bump");
    expect(workflow).toContain("name: gate-test");
    expect(rulesetReadme).toMatch(/not applied by committing this file/i);
  });
});
