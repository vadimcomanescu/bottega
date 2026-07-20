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

function markdownTables(markdown: string): string[][] {
  const tables: string[][] = [];
  let current: string[] = [];

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*\|.*\|\s*$/.test(line)) {
      current.push(line);
      continue;
    }
    if (current.length > 0) tables.push(current);
    current = [];
  }
  if (current.length > 0) tables.push(current);

  return tables;
}

function tableHeader(table: string[]): string[] {
  const [header = ""] = table;
  return header.split("|").slice(1, -1).map((cell) => cell.trim());
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
          !path.startsWith("skills/autoreview/") &&
          !path.startsWith("skills/writing-great-skills/") &&
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

  it("keeps the routing model table and cross-family review pins", () => {
    const routing = read("skills/routing/SKILL.md");
    const modelTables = markdownTables(routing).filter((table) =>
      tableHeader(table).includes("model"),
    );
    expect(modelTables, "routing must have one model table").toHaveLength(1);
    expect(tableHeader(modelTables[0]!)).toEqual([
      "model",
      "family",
      "intelligence",
      "taste",
      "notes",
    ]);

    const FAMILIES = new Set(["anthropic", "openai", "cursor", "moonshot"]);
    const SCORE = /^([1-9]|10|-)$/;
    const rows = modelTables[0]!.slice(2).map((row) =>
      row.split("|").slice(1, -1).map((cell) => cell.trim()),
    );
    const ids = rows.map((cells) => cells[0] ?? "").filter(Boolean);
    for (const cells of rows) {
      const [id = "", family = "", intelligence = "", taste = ""] = cells;
      expect(FAMILIES.has(family), `${id} has unknown family ${family}`).toBe(true);
      expect(SCORE.test(intelligence), `${id} intelligence must be 1-10 or -`).toBe(true);
      expect(SCORE.test(taste), `${id} taste must be 1-10 or -`).toBe(true);
    }
    for (const id of ["fable-5", "opus-4.8", "gpt-5.6-sol", "sonnet-5"]) {
      expect(ids, `routing table must carry ${id}`).toContain(id);
    }

    expect(routing).toContain("gpt-5.6-sol at xhigh");
    expect(routing).toContain("pinned in skills/review");
    for (const host of ["- Claude Code:", "- Codex:", "- Cursor:"]) {
      expect(routing, `routing must state reach mechanics for ${host}`).toContain(host);
    }

    const review = read("skills/review/SKILL.md");
    expect(review).toContain("--model codex=gpt-5.6-sol");
    expect(review).toContain("--model claude=claude-fable-5");
    expect(review, "trivial-diff exception must pin fable").toContain(
      "--engine claude --model claude-fable-5",
    );
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

  it("parses all manifests and points portable manifests at skills", () => {
    const manifests = new Map(
      [
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        ".cursor-plugin/plugin.json",
      ].map((path) => [path, JSON.parse(read(path)) as Record<string, unknown>]),
    );

    expect(manifests.get(".codex-plugin/plugin.json")!.skills).toBe("./skills/");
    expect(manifests.get(".cursor-plugin/plugin.json")!.skills).toBe("./skills/");
    expect(manifests.get(".claude-plugin/plugin.json")!.version).toMatch(
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
    for (const script of ["pr-threads", "pr-claim", "issue-claim"]) {
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

  it("delegates routing from maestro without embedding a model table", () => {
    const maestro = read("skills/maestro/SKILL.md");
    const routing = read("skills/routing/SKILL.md");
    expect(maestro).toContain("bottega:routing");

    const ids = markdownTables(routing)
      .filter((table) => tableHeader(table).includes("model"))[0]!
      .slice(2)
      .map((row) => row.split("|")[1]?.trim() ?? "")
      .filter(Boolean);

    for (const table of markdownTables(maestro)) {
      const rows = table.join("\n");
      for (const id of ids) {
        expect(rows, `maestro has its own routing row for ${id}`).not.toContain(id);
      }
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
    const vendored = new Set(["autoreview", "writing-great-skills"]);
    const skillDirectories = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !vendored.has(entry.name))
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

  it("makes the spec a repo file and never an issue", () => {
    const maestro = read("skills/maestro/SKILL.md");
    expect(maestro).toContain("The spec is a file under `docs/specs/`, committed on the branch; nothing else is one.");
    expect(maestro).toMatch(/No spec file on the branch means no spec exists yet, whatever any issue says/);
    const readme = read("README.md");
    expect(readme).toContain("The spec is that file; an issue is never a spec.");
  });

  it("pins the review interlock and its quantifiers", () => {
    const maestro = read("skills/maestro/SKILL.md");
    expect(maestro).toContain("every fixed decision in the plan");
    expect(maestro).toContain("bottega:review");

    const review = read("skills/review/SKILL.md");
    expect(review).toContain("every finding is fixed or refuted");
    expect(review).toContain("routes as a fix");
    expect(review).toContain("Round 3 stops the review.");
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
