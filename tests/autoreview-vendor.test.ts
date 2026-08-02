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
  it("runs the vendored Python suites from npm test", () => {
    const packageJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    expect(packageJson.scripts.test).toContain("npm run test:autoreview-vendor");
    expect(packageJson.scripts["test:autoreview-vendor"]).toBe(
      "python3 tests/run-vendor-suites.py",
    );
  });
});
