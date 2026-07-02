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
import { join, relative, sep } from "node:path";

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

export class CorruptLockError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "CorruptLockError";
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
  let entries;
  try {
    entries = readdirSync(join(cwd, FEATURES_DIR), {
      recursive: true,
      withFileTypes: true,
    });
  } catch {
    return [];
  }
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".feature"))
    .map((entry) => toPosix(relative(cwd, join(entry.parentPath, entry.name))));
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

const SHA256_HEX = /^[0-9a-f]{64}$/;

function isLockEntryPath(path: string): boolean {
  if (!path.startsWith(`${FEATURES_DIR}/`) || !path.endsWith(".feature")) {
    return false;
  }
  const segments = path.split("/");
  return segments.every((s) => s !== "" && s !== "." && s !== "..");
}

function parseLock(raw: string): Lock {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new CorruptLockError("not valid JSON");
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new CorruptLockError("not a JSON object");
  }
  const lock = parsed as { version?: unknown; files?: unknown };
  if (lock.version !== 1) {
    throw new CorruptLockError(`unsupported version: ${JSON.stringify(lock.version)}`);
  }
  if (!Array.isArray(lock.files)) {
    throw new CorruptLockError("files is not an array");
  }
  const seen = new Set<string>();
  for (const entry of lock.files as unknown[]) {
    if (entry === null || typeof entry !== "object") {
      throw new CorruptLockError("file entry is not an object");
    }
    const e = entry as { path?: unknown; sha256?: unknown };
    if (typeof e.path !== "string" || typeof e.sha256 !== "string") {
      throw new CorruptLockError("file entry missing string path or sha256");
    }
    if (!SHA256_HEX.test(e.sha256)) {
      throw new CorruptLockError(`invalid sha256 for ${e.path}`);
    }
    if (!isLockEntryPath(e.path)) {
      throw new CorruptLockError(`invalid path: ${e.path}`);
    }
    if (seen.has(e.path)) {
      throw new CorruptLockError(`duplicate path: ${e.path}`);
    }
    seen.add(e.path);
  }
  return lock as Lock;
}

export function verify(cwd: string): DriftEntry[] {
  const path = lockPath(cwd);
  if (!existsSync(path)) {
    throw new UnsignedError();
  }
  const lock = parseLock(readFileSync(path, "utf-8"));
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
