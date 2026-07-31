import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

const ROOT = join(import.meta.dirname, "..");

const VENDORED_FILES = [
  "agents/codex.md",
  "agents/LICENSE",
  "agents/NOTICE",
  "scripts/codex-companion.mjs",
  "scripts/app-server-broker.mjs",
  "scripts/session-lifecycle-hook.mjs",
  "scripts/stop-review-gate-hook.mjs",
  "scripts/lib/app-server.mjs",
  "prompts/adversarial-review.md",
  "prompts/stop-review-gate.md",
  "schemas/review-output.schema.json",
];

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function scriptsUnder(path: string): string[] {
  return readdirSync(join(ROOT, path), { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return scriptsUnder(child);
    return entry.isFile() && entry.name.endsWith(".mjs") ? [child] : [];
  });
}

describe("vendored codex runtime installation", () => {
  it("carries every file the dispatch mechanic runs", () => {
    for (const path of VENDORED_FILES) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
      expect(read(path).length, path).toBeGreaterThan(0);
    }
  });

  it("resolves every relative import the vendored scripts make", () => {
    const imports = /from\s+"(\.[^"]+)"/g;
    for (const script of scriptsUnder("scripts")) {
      const source = read(script);
      let match: RegExpExecArray | null;
      while ((match = imports.exec(source))) {
        const target = join(ROOT, dirname(script), match[1]);
        expect(existsSync(target), `${script} imports ${match[1]}`).toBe(true);
      }
    }
  });

  it("names the subagent and the model the orchestrator dispatches", () => {
    const agent = read("agents/codex.md");
    const frontmatter = parseYaml(agent.split("---")[1]);
    expect(frontmatter.name).toBe("codex");
    expect(frontmatter.model).toBe("sonnet");
  });

  it("serves the subcommands a dispatch, a watch, and a recovery use", () => {
    const companion = read("scripts/codex-companion.mjs");
    for (const subcommand of ["task", "status", "result", "cancel"]) {
      expect(companion, subcommand).toContain(`case "${subcommand}":`);
    }
    for (const flag of ["--background", "--write", "--resume-last"]) {
      expect(companion, flag).toContain(flag);
    }
  });

  it("keeps the effort set extended to max and ultra", () => {
    const efforts = read("scripts/codex-companion.mjs").match(
      /const VALID_REASONING_EFFORTS = new Set\(\[([^\]]*)\]\)/,
    )?.[1];
    expect(efforts).toContain('"max"');
    expect(efforts).toContain('"ultra"');
  });

  it("keeps the app-server spawned with notifications off", () => {
    expect(read("scripts/lib/app-server.mjs")).toContain('spawn("codex", ["app-server", "-c", "notify=[]"]');
  });

  it("keeps the recorded scoping of the vendored prose", () => {
    const agent = read("agents/codex.md");
    expect(agent).toContain("Treat `--background` and `--cwd <path>` as runtime controls too");
  });

  it("registers the session lifecycle hook on both ends of a session", () => {
    const registration = JSON.parse(read("hooks/hooks.json"));
    for (const event of ["SessionStart", "SessionEnd"]) {
      const [entry] = registration.hooks[event];
      expect(entry.hooks, event).toEqual([
        {
          type: "command",
          command: `node "\${CLAUDE_PLUGIN_ROOT}/scripts/session-lifecycle-hook.mjs" ${event}`,
          timeout: 5,
        },
      ]);
    }
  });
});
