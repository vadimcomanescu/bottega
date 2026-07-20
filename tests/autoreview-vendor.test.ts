import {
  accessSync,
  constants,
  lstatSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
} from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const VENDOR_ROOT = join(ROOT, "skills", "autoreview");

describe("vendored autoreview installation", () => {
  it("keeps the expected upstream layout and executable entrypoint", () => {
    expect(readdirSync(VENDOR_ROOT).sort()).toEqual([
      "AGENTS.md",
      "CLAUDE.md",
      "SKILL.md",
      "VENDOR",
      "scripts",
      "tests",
    ]);
    expect(readdirSync(join(VENDOR_ROOT, "scripts")).sort()).toEqual([
      "autoreview",
      "autoreview_test.py",
      "test-review-harness",
      "test-review-harness.ps1",
      "test-review-harness.py",
    ]);
    expect(readdirSync(join(VENDOR_ROOT, "tests")).sort()).toEqual([
      "test_autoreview_hardening.py",
    ]);
    expect(lstatSync(join(VENDOR_ROOT, "CLAUDE.md")).isSymbolicLink()).toBe(true);
    expect(readlinkSync(join(VENDOR_ROOT, "CLAUDE.md"))).toBe("AGENTS.md");
    expect(() => accessSync(join(VENDOR_ROOT, "scripts", "autoreview"), constants.X_OK)).not.toThrow();
  });

  it("records the upstream repository and pinned commit", () => {
    const vendor = readFileSync(join(VENDOR_ROOT, "VENDOR"), "utf8");
    expect(vendor).toContain("https://github.com/openclaw/agent-skills");
    expect(vendor).toContain("98122a3c3148fa0697ff4225ae363c2daacdaad1");
  });

  it("resolves both runtime skill links to the vendored tree", () => {
    for (const link of [".claude/skills/autoreview", ".agents/skills/autoreview"]) {
      const path = join(ROOT, link);
      expect(lstatSync(path).isSymbolicLink()).toBe(true);
      expect(realpathSync(path)).toBe(realpathSync(VENDOR_ROOT));
    }
  });

  it("runs the vendored Python suites from npm test", () => {
    const packageJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    expect(packageJson.scripts.test).toContain("npm run test:autoreview-vendor");
    expect(packageJson.scripts["test:autoreview-vendor"]).toBe(
      "python3 tests/run-vendor-suites.py",
    );
  });
});
