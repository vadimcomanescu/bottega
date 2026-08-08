import {
  accessSync,
  constants,
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { isAbsolute, join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function filesUnder(path: string, extension: string): string[] {
  const absolute = join(ROOT, path);
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return filesUnder(child, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [child] : [];
  });
}

function symlinksUnder(path: string): string[] {
  const absolute = join(ROOT, path);
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isSymbolicLink()) return [child];
    return entry.isDirectory() ? symlinksUnder(child) : [];
  });
}

describe("portable worker doctrine", () => {
  it("gives every skill matching name and description frontmatter", () => {
    const skillDirectories = ["skills", "skills-internal"].flatMap((root) =>
      readdirSync(join(ROOT, root), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({ root, name: entry.name })),
    );

    for (const directory of skillDirectories) {
      const path = `${directory.root}/${directory.name}/SKILL.md`;
      const source = read(path);
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      expect(frontmatter, `${path} must start with YAML frontmatter`).not.toBeNull();
      if (!frontmatter) continue;

      const parsed = parseYaml(frontmatter[1] ?? "", { strict: true }) as Record<string, unknown>;
      expect(parsed.name, `${path} name must match its directory`).toBe(directory.name);
      expect(typeof parsed.description, `${path} description must be a string`).toBe("string");
      expect((parsed.description as string).trim(), `${path} description must not be empty`).not.toBe("");
    }
  });

  it("enforces the writing register across portable documentation", () => {
    const files = [
      "AGENTS.md",
      "README.md",
      ...filesUnder("skills", ".md").filter(
        (path) =>
          path !== "skills/autoreview/SKILL.md" &&
          !path.startsWith("skills/autoreview/tests/") &&
          !path.startsWith("skills/prototype/") &&
          !path.startsWith("skills/domain-modeling/") &&
          !path.startsWith("skills/setup/") &&
          !path.startsWith("skills/to-tickets/") &&
          !path.startsWith("skills/improve-codebase-architecture/") &&
          !path.startsWith("skills/triage/") &&
          !path.startsWith("skills/wayfinder/") &&
          !path.startsWith("skills/research/") &&
          !path.startsWith("skills/diagnosing-bugs/") &&
          !path.startsWith("skills/handoff/") &&
          !path.startsWith("skills/teach/") &&
          !path.startsWith("skills/writing-for-agents/"),
      ),
      ...filesUnder("skills-internal", ".md"),
    ];

    const violations: string[] = [];
    for (const file of files) {
      const source =
        file === "skills-internal/write-bottega-skills/SKILL.md"
          ? read(file).replace(/^- Banned tic-words.*$/m, "")
          : read(file);
      // "bearing" and its plain-verb disguise ("what bears on the task"): one
      // banned word, two suits. Say what the thing does to the work.
      if (/\bbearing\b/i.test(source)) violations.push(`${file}: prohibited word bearing`);
      if (/\bbears? on\b/i.test(source)) violations.push(`${file}: prohibited phrase bears on`);
      if (/\bledger\b/i.test(source)) violations.push(`${file}: prohibited word ledger`);
      // An adjective that selects among no real alternatives says nothing
      // ("the smallest existing agent map" named no scale, 0.187.0).
      if (/\bsmallest existing\b/i.test(source))
        violations.push(`${file}: empty adjective smallest existing`);
      if (/\bnearest map\b/i.test(source))
        violations.push(`${file}: empty adjective nearest map`);
      // A semicolon in skills prose is two sentences wearing one. Code blocks
      // and inline code keep their own syntax, so strip them before checking.
      if (file.startsWith("skills/") || file.startsWith("skills-internal/")) {
        const prose = source
          .replace(/```[\s\S]*?```/g, "")
          .replace(/`[^`\n]*`/g, "");
        if (prose.includes(";")) violations.push(`${file}: semicolon in prose`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps the test tiers where each actor receives them", () => {
    // The builder iterates on the single-test run and closes on the brief's
    // checks. The integrated diff gets the checks the map names. The mutation
    // method lives in one reference the implement doctrine routes to.
    const maestro = read("skills/maestro/SKILL.md");
    expect(maestro, "briefs carry the single-test run").toContain(
      "Each brief carries the single-test run",
    );
    expect(maestro, "the integrated diff gets its checks").toContain(
      "checks the map names for the integrated diff",
    );
    const openSkill = read("skills/open/SKILL.md");
    expect(openSkill, "open discovers the single-test run").toContain("single-test run");
    const implement = read("skills/implement/SKILL.md");
    expect(implement, "the loop runs on the single-test run").toContain(
      "single-test run your brief carries",
    );
    expect(implement, "the builder mutates its diff through the reference").toContain(
      "references/mutation.md",
    );
    expect(
      read("skills-internal/write-bottega-skills/SKILL.md"),
      "the skill doctrine names the register",
    ).toContain("the standard `bottega:bro` states");
  });

  it("names worker models where the dispatch happens and nowhere else", () => {
    // Three files own model names: maestro states the orchestrator's model and
    // its workers' models in the sentences that dispatch them, the panel names
    // its seats, and the vendored engine names its engines. Every other skill
    // file stays model-free, the references included, since a reference is
    // where a restated pin would go unnoticed and drift.
    const maestro = read("skills/maestro/SKILL.md");
    expect(maestro, "the orchestrator model is named").toContain("running on fable-5");
    expect(maestro, "the builders name their model at the dispatch").toContain(
      "Builders pin to Opus 5 medium",
    );
    expect(maestro, "the slice reviewer names its model").toContain("fresh Codex sol medium");
    expect(maestro, "the closeout seat names its model").toContain("one fresh Opus 5 high reviewer");
    expect(maestro, "QA names its model").toContain("Opus 5 medium sub agents");
    expect(maestro, "the second opinion names its model and effort").toContain(
      "gpt-5.6 sol xhigh",
    );

    const owned = new Set([
      "skills/maestro/SKILL.md",
      "skills/panel/SKILL.md",
      "skills/autoreview/SKILL.md",
    ]);
    for (const file of filesUnder("skills", ".md")) {
      if (owned.has(file) || file.startsWith("skills/autoreview/tests/")) continue;
      const named = read(file).match(/\b(opus-5|fable-5|gpt-5\.6-\w+)\b/);
      expect(named?.[0], `${file} names ${named?.[0]}; the dispatch site owns it`).toBe(undefined);
    }
    expect(read("skills/panel/SKILL.md"), "the panel names its own seats").toContain(
      "one subagent on opus-5",
    );

    // Effort is named only where a dispatch can carry it: the codex CLI's
    // model_reasoning_effort flag. A subagent dispatch has no effort field, so
    // a Claude worker's effort is a value nothing applies
    // (docs/adr/0033-one-simple-maestro-code-is-the-record.md).
    for (const file of filesUnder("skills", ".md")) {
      if (file.startsWith("skills/autoreview/")) continue;
      const claudeEffort = read(file).match(/\b(opus-5|Opus)\b[^.\n]{0,40}?\beffort\b/);
      expect(claudeEffort?.[0], `${file} gives a Claude worker an effort no dispatch carries`).toBe(
        undefined,
      );
    }

    // The vendored engine names its engines and its lens seats itself; its
    // local scoping is recorded in THIRD_PARTY.md.
    const review = read("skills/autoreview/SKILL.md");
    expect(review).toContain("runs on opus-5");
    expect(review).toContain("--model codex=gpt-5.6-sol");
    expect(review).toContain("--model claude=claude-fable-5");
    expect(review, "the Spec lens names its model and its fallback").toContain(
      "gpt-5.6-sol at high effort, per `bottega:use-codex` where the codex CLI is logged in",
    );
  });

  it("keeps every relative markdown link resolvable", () => {
    const files = [
      "AGENTS.md",
      "README.md",
      "REVIEW.md",
      ...filesUnder("skills", ".md"),
      ...filesUnder("docs", ".md"),
    ].filter(
      (path) =>
        path !== "skills/autoreview/SKILL.md" &&
        !path.startsWith("skills/autoreview/tests/"),
    );

    const dead: string[] = [];
    for (const file of files) {
      const withoutCode = read(file)
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`\n]*`/g, "");
      for (const [, target] of withoutCode.matchAll(/\]\(([^)\s]+)\)/g)) {
        const path = (target ?? "").split("#")[0] ?? "";
        if (path === "" || /^[a-z][a-z+.-]*:/i.test(path) || path.startsWith("/")) continue;
        const resolved = join(ROOT, file, "..", decodeURIComponent(path));
        if (!existsSync(resolved)) dead.push(`${file} -> ${target}`);
      }
    }
    expect(dead).toEqual([]);
  });

  it("keeps every skill self-contained and clear of this repository's records", () => {
    // An installed plugin ships only what is under skills/, so a skill either
    // stands on its own or points at another file the plugin delivers. Two
    // things break that: a relative link that resolves outside skills/, and a
    // reference to a concrete record file of this repository (a numbered ADR,
    // a named lesson), neither of which installs with the plugin. Telling a run to read or write the HOST repository's own generic
    // paths is legitimate, so a directory with no filename (`docs/adr/`,
    // `docs/lessons/`) and a placeholder path (`docs/plans/<YYYY-MM-DD>-<slug>.md`)
    // both pass. The vendored review engine and its suites are synced as their
    // author wrote them and are exempt.
    const RECORD_FILE =
      /docs\/adr\/\d[A-Za-z0-9._-]*|docs\/lessons\/[A-Za-z0-9][A-Za-z0-9._-]*\.md/g;

    const files = filesUnder("skills", ".md").filter(
      (path) =>
        path !== "skills/autoreview/SKILL.md" &&
        !path.startsWith("skills/autoreview/scripts/") &&
        !path.startsWith("skills/autoreview/tests/"),
    );

    const violations: string[] = [];
    for (const file of files) {
      const lines = read(file).split(/\r?\n/);
      lines.forEach((line, index) => {
        const found = new Set<string>();
        for (const [, target] of line.matchAll(/\]\(([^)\s]+)\)/g)) {
          const path = (target ?? "").split("#")[0] ?? "";
          if (path === "" || /^[a-z][a-z+.-]*:/i.test(path) || path.startsWith("/")) continue;
          const resolved = relative(
            join(ROOT, "skills"),
            join(ROOT, file, "..", decodeURIComponent(path)),
          );
          if (resolved === ".." || resolved.startsWith(`..${sep}`)) found.add(target ?? "");
        }
        for (const [match] of line.matchAll(RECORD_FILE)) found.add(match);
        if (found.size > 0) violations.push(`${file}:${index + 1} -> ${[...found].join(", ")}`);
      });
    }
    expect(violations).toEqual([]);
  });

  it("keeps every AGENTS map path live", () => {
    const agents = read("AGENTS.md");
    const map = agents.match(/^## Map\r?\n([\s\S]*?)(?=\r?\n## )/m);
    expect(map, "AGENTS.md must contain a Map section").not.toBeNull();
    if (!map) return;
    const paths = [...(map[1] ?? "").matchAll(/^\| `([^`]+)` \|/gm)].map(
      (match) => match[1] ?? "",
    );
    expect(paths.length).toBeGreaterThan(0);

    for (const path of paths) {
      expect(existsSync(join(ROOT, path)), `AGENTS.md map path does not exist: ${path}`).toBe(true);
    }
  });

  it("parses the plugin manifest and points it at skills", () => {
    const manifest = JSON.parse(read(".claude-plugin/plugin.json")) as Record<string, unknown>;

    expect(manifest.skills).toBe("./skills/");
    // A live harness constraint, not a guard on a past direction: Claude Code
    // auto-loads the standard hooks/hooks.json, and a manifest that also names it
    // loads the file twice, which fails hook load on every install
    // (docs/lessons/standard-hooks-file-is-not-redeclared.md). A manifest hooks
    // key is legitimate only for a hook file under a non-standard name, and this
    // plugin has none, so the requirement is that the key be absent.
    expect(manifest.hooks).toBeUndefined();
    expect(manifest.version).toMatch(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/,
    );
  });

  it("keeps runtime skill symlinks inside the repository", () => {
    const links = [
      ...symlinksUnder(".agents/skills"),
      ...symlinksUnder(".claude/skills"),
    ];
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      const path = join(ROOT, link);
      expect(lstatSync(path).isSymbolicLink(), `${link} must remain a symlink`).toBe(true);
      const destination = realpathSync(path);
      const fromRoot = relative(realpathSync(ROOT), destination);
      expect(
        !isAbsolute(fromRoot) && fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`),
        `${link} resolves outside the repository: ${destination}`,
      ).toBe(true);
    }
  });

  it("keeps GitHub mutation scripts executable and contract-headed", () => {
    for (const script of ["pr-threads"]) {
      const path = join(ROOT, "scripts", script);
      expect(existsSync(path), `scripts/${script} must exist`).toBe(true);
      expect(() => accessSync(path, constants.X_OK), `scripts/${script} must be executable`).not.toThrow();

      const lines = read(`scripts/${script}`).split(/\r?\n/);
      let index = (lines[0] ?? "").startsWith("#!") ? 1 : 0;
      while (lines[index]?.trim() === "") index += 1;
      const comments: string[] = [];
      while (lines[index]?.trimStart().startsWith("//")) {
        comments.push(lines[index] ?? "");
        index += 1;
      }
      expect(comments.length, `scripts/${script} needs a top comment block`).toBeGreaterThan(0);
      expect(
        comments.some((line) => line.replace(/^\s*\/\//, "").trim().length > 0),
        `scripts/${script} needs a nonempty contract comment`,
      ).toBe(true);
    }
  });

  it("keeps skill openings imperative and oriented", () => {
    // A merge gate must be sound: it may never fail a legitimate opening. So
    // this rejects only the opener forms that cannot be imperative: a heading
    // with no orienting sentence, a bold step label ("**Read.**" / "__Read.__"),
    // a persona ("You are"), and a first word that is a function word an
    // imperative verb never starts with (article, demonstrative, pronoun,
    // possessive). A noun-subject declarative ("Skills describe...",
    // "Research shows...") is not caught, because its first word is lexically a
    // verb too ("Assess...", "Process..." are valid imperatives ending in s);
    // no first-word rule separates them without failing real verbs. Imperative
    // mood proper stays a review concern; the test pins the sound subset.
    const NON_IMPERATIVE_OPENERS = new Set([
      "the", "a", "an", "this", "that", "these", "those",
      "it", "there", "they", "we", "you", "i", "he", "she",
      // the seven possessive determiners: none can begin an imperative verb
      "my", "your", "his", "her", "its", "our", "their",
    ]);
    const skillDirectories = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const name of skillDirectories) {
      // Synced vendored prose (THIRD_PARTY.md) is kept as its author wrote
      // it, opening included.
      if (name === "prototype" || name === "wayfinder" || name === "diagnosing-bugs" || name === "teach") continue;
      const body = read(`skills/${name}/SKILL.md`).replace(
        /^---\r?\n[\s\S]*?\r?\n---\r?\n/,
        "",
      );
      const lines = body.split(/\r?\n/).map((line) => line.trim());
      const title = lines.findIndex((line) => line.startsWith("# "));
      const opening = lines.slice(title + 1).find((line) => line.length > 0) ?? "";
      expect(
        opening.startsWith("#"),
        `skills/${name} needs an orienting sentence before its first section`,
      ).toBe(false);
      expect(
        opening.startsWith("**") || opening.startsWith("__"),
        `skills/${name} opens with a bold step label, not an orienting sentence`,
      ).toBe(false);
      expect(/^you are\b/i.test(opening), `skills/${name} opens with an agent persona`).toBe(false);
      const firstWord = (opening.match(/[A-Za-z]+/)?.[0] ?? "").toLowerCase();
      expect(
        NON_IMPERATIVE_OPENERS.has(firstWord),
        `skills/${name} opens declaratively ("${firstWord} ..."); use an imperative verb`,
      ).toBe(false);
    }
  });

  it("pins the review interlock and its quantifiers", () => {
    const maestro = read("skills/maestro/SKILL.md");
    expect(maestro).toContain("bottega:autoreview");
    expect(
      read("skills/autoreview/SKILL.md"),
      "every finding is verified against the real code before the head is accepted",
    ).toContain("Verify every finding by reading the real code path");
    expect(
      read("skills/autoreview/SKILL.md"),
      "a finding with a runnable check is settled by running it",
    ).toContain("running the check that settles it when one exists");
    // The word alone routes nowhere from skill prose: the sentence names the tool.
    expect(maestro).toContain("Ultracode the build through the Workflow tool");
    expect(maestro).toContain("Ultracode through the Workflow tool");

    const close = read("skills/close/SKILL.md");
    expect(close).toContain("put the rule where the repository enforces it best");
    expect(close).toContain("fix the ones in the run's scope and file one bead for the rest");
    expect(close, "the run never merges by hand").toContain(
      "Never merge a PR by hand and never approve one",
    );
    expect(close, "arming is the opener's act only where the project says so").toContain(
      "Arm auto-merge only where that procedure makes arming the opener's act",
    );
    expect(close, "a queue-owned merge is armed by the open PR and nothing else").toContain(
      "Where a merge queue owns the merge",
    );
    expect(close, "a held PR needs the repository enforcing its label, queue or check").toContain(
      "a merge queue that refuses the PR while the label is present",
    );
    expect(close, "the fallback hold shape stays accepted").toContain(
      "a required check that is red because the label is present",
    );
    expect(close, "a held PR carries the brake its project names").toContain(
      "apply the brake the landing procedure names",
    );
    expect(close, "a project documenting no brake still gets the hold label").toContain(
      "--label hold",
    );
    expect(close, "a requirement only a person can satisfy ends the run at an open PR").toContain(
      "open and unmerged",
    );

    // The skill is the modified vendored document itself (provenance in
    // THIRD_PARTY.md), and the author's own convergence rule survives verbatim.
    const autoreview = read("skills/autoreview/SKILL.md");
    expect(autoreview).toContain("two review-triggered patch cycles have not converged");
    // The local additions: the blind prompt, the self-read of REVIEW.md, the
    // lenses, and the panel held across reruns.
    expect(autoreview).toContain("nothing else about the caller's design");
    expect(autoreview).toContain("one sentence of threat model");
    expect(autoreview).toContain("**Out of threat model**");
    expect(autoreview).toContain("Check the reviewed repository's root for `REVIEW.md`");
    expect(autoreview).toContain("report each axis apart so one cannot mask the other");
    expect(autoreview).toContain("A panel set at invocation stays the panel on every rerun");
    expect(autoreview).toContain("repeated until the helper exits clean at the accepted head");
    // The run's closeout seat: the seat runs the loop whole, the maestro rules
    // on its report and never edits.
    expect(maestro).toContain("dispatch the closeout seat");

  });

  it("keeps every lesson enforced somewhere that exists", () => {
    const lessons = filesUnder("docs/lessons", ".md");
    expect(lessons.length).toBeGreaterThan(0);

    const testSources = filesUnder("tests", ".ts")
      .map((path) => read(path))
      .join("\n");

    for (const lesson of lessons) {
      const source = read(lesson);
      const enforced = source.match(/^Enforced: (.+)$/m);
      expect(enforced, `${lesson} must name where its rule is enforced`).not.toBeNull();
      if (!enforced) continue;

      const line = enforced[1] ?? "";
      const refs = [...line.matchAll(/[\w./-]+\.(?:md|mjs|ts)/g)].map((match) => match[0]);
      expect(refs.length, `${lesson} names no enforcement file`).toBeGreaterThan(0);
      const refSources = refs
        .filter((ref) => existsSync(join(ROOT, ref)))
        .map((ref) => read(ref))
        .join("\n");
      for (const ref of refs) {
        expect(existsSync(join(ROOT, ref)), `${lesson} points at missing file ${ref}`).toBe(true);
      }
      for (const [, quoted] of line.matchAll(/"([^"]+)"/g)) {
        expect(
          refSources.includes(quoted ?? "") || testSources.includes(quoted ?? ""),
          `${lesson} quotes a rule its enforcement home does not carry: ${quoted}`,
        ).toBe(true);
      }
    }
  });
});
