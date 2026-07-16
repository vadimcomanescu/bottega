import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PANEL = readFileSync(join(ROOT, "skills", "panel", "panel.js"), "utf8");
const HOST_TRANSPORTS = readFileSync(
  join(ROOT, "skills", "run", "references", "host-transports.md"),
  "utf8",
);

describe("panel report contracts", () => {
  it("loads both panel contracts from their one canonical schema files", () => {
    expect(PANEL).not.toContain("const PANELIST = {");
    expect(PANEL).not.toContain("const JUDGE = {");
    expect(PANEL).toContain("const PANELIST = input.panelistSchema");
    expect(PANEL).toContain("const JUDGE = input.judgeSchema");
    expect(HOST_TRANSPORTS).toMatch(/pass.*panelistSchema.*judgeSchema/is);
    expect(HOST_TRANSPORTS).toContain("skills/panel/references/panelist.schema.json");
    expect(HOST_TRANSPORTS).toContain("skills/panel/references/judge.schema.json");
  });
});
