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
const MODEL_FIELDS = [
  "context",
  "cost_in",
  "cost_out",
  "family",
  "id",
  "notes",
  "work",
];
const WORK_KINDS = new Set([
  "build",
  "review",
  "qa",
  "panel",
  "mechanical",
  "orchestrator",
]);

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
          !path.startsWith("skills/writing-great-skills/"),
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

  it("validates routing registry shape and cross-family review capacity", () => {
    const models = JSON.parse(read("skills/routing/models.json")) as Array<
      Record<string, unknown>
    >;
    expect(Array.isArray(models)).toBe(true);

    for (const model of models) {
      expect(Object.keys(model).sort(), `${String(model.id)} has the wrong fields`).toEqual(
        MODEL_FIELDS,
      );
      expect(Array.isArray(model.work), `${String(model.id)} work must be an array`).toBe(true);
      for (const work of model.work as unknown[]) {
        expect(typeof work, `${String(model.id)} work values must be strings`).toBe("string");
        expect(WORK_KINDS.has(work as string), `${String(model.id)} has unknown work ${String(work)}`).toBe(
          true,
        );
      }
    }

    const reviewFamilies = new Set(
      models
        .filter((model) => (model.work as unknown[]).includes("review"))
        .map((model) => model.family),
    );
    expect(reviewFamilies.size).toBeGreaterThanOrEqual(2);

    const fable = models.find((model) => model.id === "fable-5");
    expect(fable, "routing registry must define fable-5").toBeDefined();
    expect(fable!.work).toEqual(["orchestrator"]);
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
    const models = JSON.parse(read("skills/routing/models.json")) as Array<{ id: string }>;
    expect(maestro).toContain("bottega:routing");

    const tables = markdownTables(maestro);
    const harnessReachTables = tables.filter((table) =>
      tableHeader(table).includes("Your harness"),
    );
    expect(harnessReachTables, "maestro must have one harness reach table").toHaveLength(1);

    for (const table of tables.filter((candidate) => candidate !== harnessReachTables[0])) {
      const rows = table.join("\n");
      for (const model of models) {
        expect(rows, `maestro has its own routing row for ${model.id}`).not.toContain(model.id);
      }
    }
  });
});
