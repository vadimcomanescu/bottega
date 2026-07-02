// The commission lock library: sign() freezes features/**/*.feature into a
// deterministic lock file, verify() reports drift against it.
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, sep } from "node:path";

export interface LockEntry {
  path: string;
  sha256: string;
}

export interface Lock {
  version: 1;
  files: LockEntry[];
}

export interface DriftEntry {
  status: "modified" | "removed" | "added";
  path: string;
}

export class NoFeatureFilesError extends Error {
  constructor() {
    super("no feature files found under features/");
    this.name = "NoFeatureFilesError";
  }
}

export class UnsignedError extends Error {
  constructor() {
    super('unsigned: run "bottega sign" first');
    this.name = "UnsignedError";
  }
}

const FEATURES_DIR = "features";
const LOCK_DIR = ".bottega";
const LOCK_FILE = "commission.lock";

export function lockPath(cwd: string): string {
  return join(cwd, LOCK_DIR, LOCK_FILE);
}

function toPosix(path: string): string {
  return path.split(sep).join("/");
}

function collectFeatureFiles(cwd: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(join(cwd, FEATURES_DIR), {
      recursive: true,
      encoding: "utf-8",
    });
  } catch {
    return [];
  }
  const files = entries
    .filter((entry) => entry.endsWith(".feature"))
    .map((entry) => toPosix(join(FEATURES_DIR, entry)));
  files.sort();
  return files;
}

function hashFile(absPath: string): string {
  return createHash("sha256").update(readFileSync(absPath)).digest("hex");
}

export function sign(cwd: string): Lock {
  const paths = collectFeatureFiles(cwd);
  if (paths.length === 0) {
    throw new NoFeatureFilesError();
  }
  const lock: Lock = {
    version: 1,
    files: paths.map((path) => ({ path, sha256: hashFile(join(cwd, path)) })),
  };
  mkdirSync(join(cwd, LOCK_DIR), { recursive: true });
  writeFileSync(lockPath(cwd), `${JSON.stringify(lock, null, 2)}\n`);
  return lock;
}

export function verify(cwd: string): DriftEntry[] {
  const path = lockPath(cwd);
  if (!existsSync(path)) {
    throw new UnsignedError();
  }
  const lock = JSON.parse(readFileSync(path, "utf-8")) as Lock;
  const lockedPaths = new Set(lock.files.map((entry) => entry.path));
  const currentPaths = collectFeatureFiles(cwd);

  const drift: DriftEntry[] = [];
  for (const entry of lock.files) {
    const absPath = join(cwd, entry.path);
    if (!existsSync(absPath)) {
      drift.push({ status: "removed", path: entry.path });
      continue;
    }
    if (hashFile(absPath) !== entry.sha256) {
      drift.push({ status: "modified", path: entry.path });
    }
  }
  for (const path of currentPaths) {
    if (!lockedPaths.has(path)) {
      drift.push({ status: "added", path });
    }
  }
  drift.sort((a, b) => a.path.localeCompare(b.path));
  return drift;
}
