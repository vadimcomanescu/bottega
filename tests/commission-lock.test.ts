import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  CorruptLockError,
  NoFeatureFilesError,
  UnsignedError,
  lockPath,
  sign,
  verify,
} from "../src/commission-lock.ts";

let dir: string;

const BIN = fileURLToPath(new URL("../bin/bottega.js", import.meta.url));

interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

function runCli(args: string[]): CliResult {
  try {
    const stdout = execFileSync(process.execPath, [BIN, ...args], {
      cwd: dir,
      encoding: "utf-8",
    });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (err) {
    const e = err as { status?: number | null; stdout?: string; stderr?: string };
    return { stdout: e.stdout ?? "", stderr: e.stderr ?? "", exitCode: e.status ?? -1 };
  }
}

function writeFeature(relPath: string, content: string): void {
  const absPath = join(dir, relPath);
  mkdirSync(join(absPath, ".."), { recursive: true });
  writeFileSync(absPath, content);
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "commission-lock-test-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("sign", () => {
  it("throws when there are no feature files", () => {
    expect(() => sign(dir)).toThrow(NoFeatureFilesError);
  });

  it("writes a lock covering every feature file, sorted by path", () => {
    writeFeature("features/billing.feature", "Feature: Billing\n");
    writeFeature("features/login.feature", "Feature: Login\n");

    const lock = sign(dir);

    expect(lock.version).toBe(1);
    expect(lock.files.map((f) => f.path)).toEqual([
      "features/billing.feature",
      "features/login.feature",
    ]);
  });

  it("records the sha256 of each file's raw bytes", () => {
    writeFeature("features/login.feature", "Feature: Login\n");

    const lock = sign(dir);

    const expected = createHash("sha256")
      .update(readFileSync(join(dir, "features/login.feature")))
      .digest("hex");
    expect(lock.files[0]?.sha256).toBe(expected);
  });

  it("finds feature files nested in subdirectories", () => {
    writeFeature("features/checkout/pay.feature", "Feature: Pay\n");

    const lock = sign(dir);

    expect(lock.files.map((f) => f.path)).toEqual(["features/checkout/pay.feature"]);
  });

  it("creates .bottega/ if missing and writes deterministic, trailing-newline JSON", () => {
    writeFeature("features/login.feature", "Feature: Login\n");

    sign(dir);

    const raw = readFileSync(lockPath(dir), "utf-8");
    expect(raw.endsWith("\n")).toBe(true);
    expect(raw).toBe(`${JSON.stringify(JSON.parse(raw), null, 2)}\n`);
  });

  it("is idempotent: re-signing an untouched repo reproduces the same lock", () => {
    writeFeature("features/login.feature", "Feature: Login\n");

    sign(dir);
    const first = readFileSync(lockPath(dir), "utf-8");
    sign(dir);
    const second = readFileSync(lockPath(dir), "utf-8");

    expect(second).toBe(first);
  });

  it("ignores a directory whose name ends in .feature", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    mkdirSync(join(dir, "features", "oops.feature"));

    const lock = sign(dir);

    expect(lock.files.map((f) => f.path)).toEqual(["features/login.feature"]);
  });
});

describe("verify", () => {
  it("throws UnsignedError when no lock exists", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    expect(() => verify(dir)).toThrow(UnsignedError);
  });

  it("reports clean when nothing has changed", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    sign(dir);

    expect(verify(dir)).toEqual([]);
  });

  it("reports modified when a locked file's content changes", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    sign(dir);
    writeFeature("features/login.feature", "Feature: Login\nScenario: changed\n");

    expect(verify(dir)).toEqual([{ status: "modified", path: "features/login.feature" }]);
  });

  it("reports removed when a locked file is deleted", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    sign(dir);
    rmSync(join(dir, "features/login.feature"));

    expect(verify(dir)).toEqual([{ status: "removed", path: "features/login.feature" }]);
  });

  it("reports added when a new feature file appears after sign-off", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    sign(dir);
    writeFeature("features/extra.feature", "Feature: Extra\n");

    expect(verify(dir)).toEqual([{ status: "added", path: "features/extra.feature" }]);
  });
});

describe("verify with a corrupt lock", () => {
  const VALID_SHA = "a".repeat(64);

  function writeLock(content: string): void {
    mkdirSync(join(dir, ".bottega"), { recursive: true });
    writeFileSync(join(dir, ".bottega", "commission.lock"), content);
  }

  function lockWithEntries(entries: unknown): string {
    return JSON.stringify({ version: 1, files: entries });
  }

  function runVerify(): CliResult {
    return runCli(["verify"]);
  }

  function expectCorrupt(result: CliResult): void {
    expect(result.exitCode).toBe(3);
    expect(result.stderr).toMatch(/^corrupt lock: /);
    expect(result.stdout).toBe("");
  }

  beforeEach(() => {
    writeFeature("features/login.feature", "Feature: Login\n");
  });

  it("exits 3 on invalid JSON instead of leaking a stacktrace", () => {
    writeLock("{nope");
    expectCorrupt(runVerify());
  });

  it("exits 3 on an unsupported version", () => {
    writeLock(JSON.stringify({ version: 2, files: [] }));
    expectCorrupt(runVerify());
  });

  it("exits 3 when files is not an array", () => {
    writeLock(JSON.stringify({ version: 1, files: "x" }));
    expectCorrupt(runVerify());
  });

  it("exits 3 when an entry lacks a string path or sha256", () => {
    writeLock(lockWithEntries([{ path: "features/login.feature", sha256: 42 }]));
    expectCorrupt(runVerify());
  });

  it("exits 3 when a sha256 is not 64 lowercase hex chars", () => {
    writeLock(lockWithEntries([{ path: "features/login.feature", sha256: "ABC123" }]));
    expectCorrupt(runVerify());
  });

  it("exits 3 on a traversal path outside features/", () => {
    writeLock(lockWithEntries([{ path: "../outside.feature", sha256: VALID_SHA }]));
    expectCorrupt(runVerify());
  });

  it("exits 3 on a dot-dot segment inside a features/ path", () => {
    writeLock(
      lockWithEntries([{ path: "features/../../etc/x.feature", sha256: VALID_SHA }]),
    );
    expectCorrupt(runVerify());
  });

  it("exits 3 on an absolute path", () => {
    writeLock(lockWithEntries([{ path: "/etc/x.feature", sha256: VALID_SHA }]));
    expectCorrupt(runVerify());
  });

  it("exits 3 on duplicate paths instead of printing duplicate drift lines", () => {
    writeLock(
      lockWithEntries([
        { path: "features/login.feature", sha256: VALID_SHA },
        { path: "features/login.feature", sha256: VALID_SHA },
      ]),
    );
    expectCorrupt(runVerify());
  });

  it("throws CorruptLockError at the library interface", () => {
    writeLock("{nope");
    expect(() => verify(dir)).toThrow(CorruptLockError);
  });
});

describe("symlinks under features/ fail closed", () => {
  it("sign exits 1 on a symlinked feature file", () => {
    writeFeature("outside/target.feature", "Feature: Target\n");
    mkdirSync(join(dir, "features"), { recursive: true });
    symlinkSync(
      join(dir, "outside", "target.feature"),
      join(dir, "features", "linked.feature"),
    );

    const result = runCli(["sign"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe(
      "symlink in features/ is not signable: features/linked.feature\n",
    );
    expect(result.stdout).toBe("");
  });

  it("sign exits 1 on a symlinked directory even among real feature files", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    writeFeature("outside/dirtarget/inner.feature", "Feature: Inner\n");
    symlinkSync(join(dir, "outside", "dirtarget"), join(dir, "features", "loop"));

    const result = runCli(["sign"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe(
      "symlink in features/ is not signable: features/loop\n",
    );
    expect(result.stdout).toBe("");
  });

  it("verify exits 3 when a symlink appears in a signed features tree", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    sign(dir);
    writeFeature("outside/target.feature", "Feature: Target\n");
    symlinkSync(
      join(dir, "outside", "target.feature"),
      join(dir, "features", "linked.feature"),
    );

    const result = runCli(["verify"]);

    expect(result.exitCode).toBe(3);
    expect(result.stderr).toBe(
      "corrupt features tree: symlink at features/linked.feature\n",
    );
    expect(result.stdout).toBe("");
  });
});
