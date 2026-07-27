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
    const skillDirectories = readdirSync(join(ROOT, "skills"), {
      withFileTypes: true,
    }).filter((entry) => entry.isDirectory());

    for (const directory of skillDirectories) {
      const path = `skills/${directory.name}/SKILL.md`;
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
          path !== "skills/code-review/references/autoreview.md" &&
          !path.startsWith("skills/code-review/tests/") &&
          !path.startsWith("skills/codebase-design/references/"),
      ),
    ];

    const violations: string[] = [];
    for (const file of files) {
      const source =
        file === "AGENTS.md"
          ? read(file).replace(/^- Banned tic-words.*$/m, "")
          : read(file);
      if (source.includes("—")) violations.push(`${file}: em dash`);
      if (/\bbearing\b/i.test(source)) violations.push(`${file}: prohibited word bearing`);
      if (/\bledger\b/i.test(source)) violations.push(`${file}: prohibited word ledger`);
    }
    expect(violations).toEqual([]);
  });

  it("keeps every run worker's model in the worker table, one row each", () => {
    const maestro = read("skills/maestro/SKILL.md");
    expect(maestro, "the orchestrator model is named").toContain(
      "orchestrated from Claude Code on fable-5 at xhigh",
    );
    expect(maestro, "every dispatch reads the worker table").toContain(
      "references/workers.md",
    );

    const workers = read("skills/maestro/references/workers.md");
    expect(workers, "no row runs a worker on the orchestrator's model").toContain(
      "a worker dispatched as a subagent never runs on it",
    );
    for (const row of [
      "| builder | opus-5 | medium |",
      "| explorer | opus-5 | low |",
      "| prototyper | opus-5 | medium |",
      "| QA driver | opus-5 | default |",
      "| mechanic | opus-5 | low |",
      "| plan editor | gpt-5.6-sol | high |",
      "| conformance checker | gpt-5.6-sol | high |",
    ]) {
      expect(workers, `the worker table is missing the row ${row}`).toContain(row);
    }

    // One row is one worker, one model, one effort. A cell holding two of
    // either is two workers written on one line, and the pair cannot move
    // independently when a model or an effort level goes away.
    const rows = workers
      .split(/\r?\n/)
      .filter((line) => line.startsWith("|") && !/^\|\s*(Worker|-)/.test(line));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const cells = row.split("|").map((cell) => cell.trim());
      expect(cells[2]?.includes("/"), `worker row carries two models: ${row}`).toBe(false);
      expect(cells[3]?.includes("/"), `worker row carries two efforts: ${row}`).toBe(false);
    }

    // Every skill file routes to the table instead of restating a model, the
    // references included, since a reference is where a restated pin would go
    // unnoticed. The exceptions each own their models: the table itself,
    // maestro's own orchestrator sentence, the panel's seats, the vendored
    // engine and its suites, and guru, whose whole body is one standalone
    // prompt that names its workers' models where it dispatches them
    // (docs/adr/0026-guru-one-goal-entry-point.md).
    const owned = new Set([
      "skills/maestro/references/workers.md",
      "skills/maestro/SKILL.md",
      "skills/panel/SKILL.md",
      "skills/code-review/references/autoreview.md",
      "skills/guru/SKILL.md",
    ]);
    for (const file of filesUnder("skills", ".md")) {
      if (owned.has(file) || file.startsWith("skills/code-review/tests/")) continue;
      const named = read(file).match(/\b(opus-5|fable-5|gpt-5\.6-\w+)\b/);
      expect(named?.[0], `${file} names ${named?.[0]}; the worker table owns it`).toBe(undefined);
    }
    expect(read("skills/panel/SKILL.md"), "the panel names its own seats").toContain(
      "opus-5 at max effort",
    );

    // The vendored engine states the fix builder's model for a standalone
    // review, which never reads a run's table, so the same fact has two homes
    // on purpose. Read the builder's row and require the vendored line to
    // match it: changing the row fails here until the vendored text is
    // re-scoped with it, and THIRD_PARTY.md records that scoping.
    const builder = workers
      .split(/\r?\n/)
      .find((line) => line.startsWith("| builder |"))
      ?.split("|")
      .map((cell) => cell.trim());
    const [, , builderModel, builderEffort] = builder ?? [];
    expect(builderModel, "the worker table has a builder row").toBeTruthy();
    expect(
      read("skills/code-review/references/autoreview.md"),
      `the vendored fix builder has drifted from the builder row (${builderModel} at ${builderEffort})`,
    ).toContain(`runs on ${builderModel} at ${builderEffort}`);

    const review = read("skills/code-review/references/autoreview.md");
    expect(review).toContain("--model codex=gpt-5.6-sol");
    expect(review).toContain("--model claude=claude-fable-5");
    expect(review, "the rerun engine never comes from the company that wrote the fix").toContain(
      "never comes from the company whose model wrote the fix",
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
        path !== "skills/code-review/references/autoreview.md" &&
        !path.startsWith("skills/code-review/tests/"),
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
        path !== "skills/code-review/references/autoreview.md" &&
        !path.startsWith("skills/code-review/scripts/") &&
        !path.startsWith("skills/code-review/tests/"),
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

  it("makes the spec a repo file with its naming owned by the spec skill alone", () => {
    const maestro = read("skills/maestro/SKILL.md");
    expect(maestro).toContain("Use `bottega:spec` to agree the spec and commit it.");
    expect(read("skills/spec/references/spec-format.md")).toContain("Status: agreed YYYY-MM-DD");

    const convention = "docs/specs/<YYYY-MM-DD>-<slug>.md";
    const owners = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((dir) => {
        const skillFile = join(ROOT, "skills", dir, "SKILL.md");
        return existsSync(skillFile) && readFileSync(skillFile, "utf8").includes(convention);
      });
    expect(owners).toEqual(["spec"]);
  });

  it("pins the review interlock and its quantifiers", () => {
    const maestro = read("skills/maestro/SKILL.md");
    expect(maestro).toContain("every fixed decision in the plan");
    expect(maestro).toContain("bottega:code-review");
    expect(read("skills/build/SKILL.md")).toContain(
      "run one simplification pass over the changed files",
    );

    const close = read("skills/close/SKILL.md");
    expect(close).toContain("puts the rule where the repository enforces it best");
    expect(close).toContain("fix the ones in the run's scope and file one issue for the rest");
    expect(close, "the run never merges by hand; it arms what the repository lands with").toContain(
      "A run never merges a PR by hand and never approves one; it arms auto-merge on the PR it opens",
    );
    expect(close, "a held PR needs a check that enforces its label").toContain(
      "confirm one of them is red on this PR because the label is present",
    );
    expect(close, "a hold run's PR arrives carrying its label").toContain("--label hold");
    expect(close, "a requirement only a person can satisfy ends the run at an open PR").toContain(
      "open and unmerged",
    );

    const review = read("skills/code-review/SKILL.md");
    expect(review).toContain("references/autoreview.md");
    expect(review).toContain("quoting the spec line it rests on");

    // The vendored document is present, carries upstream's identity, and the
    // author's own convergence rule survives verbatim.
    const autoreview = read("skills/code-review/references/autoreview.md");
    expect(autoreview).toContain("name: autoreview");
    expect(autoreview).toContain("# Auto Review");
    expect(autoreview).toContain("two review-triggered patch cycles have not converged");
    // The woven run rules: blind prompt, fresh-builder fix dispatch, rerun to clean.
    expect(autoreview).toContain("never the spec or the plan");
    expect(autoreview).toContain(
      "dispatches the accepted findings to one fresh builder, briefed as any builder with the implementing doctrine, the findings, and the project's commands; the maestro never edits production code",
    );
    expect(autoreview).toContain("repeated until the helper exits clean at the accepted head");
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
