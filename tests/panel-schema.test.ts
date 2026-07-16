import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PANEL = readFileSync(join(ROOT, "skills", "panel", "panel.js"), "utf8");

function json(path: string) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

function inlineObject(name: string) {
  const start = PANEL.indexOf(`const ${name} = `);
  expect(start).toBeGreaterThan(-1);
  const open = PANEL.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (; end < PANEL.length; end++) {
    if (PANEL[end] === "{") depth++;
    else if (PANEL[end] === "}") depth--;
    if (depth === 0) break;
  }
  return JSON.parse(PANEL.slice(open, end + 1));
}

describe("panel report contracts", () => {
  it("keeps the Claude Workflow copies equal to the extracted Codex schemas", () => {
    expect(inlineObject("PANELIST")).toEqual(
      json("skills/panel/references/panelist.schema.json"),
    );
    expect(inlineObject("JUDGE")).toEqual(
      json("skills/panel/references/judge.schema.json"),
    );
  });
});
