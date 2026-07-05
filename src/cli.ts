// argv -> library -> stdout/stderr/exit code. Run as a side effect of import
// so bin/bottega.js can stay a thin shim.
import { execFileSync } from "node:child_process";
import {
  CorruptLockError,
  FeatureSymlinkError,
  NoFeatureFilesError,
  UnsignedError,
  sign,
  verify,
} from "./commission-lock.ts";
import {
  CorruptRecordError,
  auditQa,
  auditSliceRecord,
  loadRunRecords,
  type Violation,
} from "./run-record.ts";

function runSign(cwd: string): number {
  try {
    sign(cwd);
    return 0;
  } catch (err) {
    if (err instanceof NoFeatureFilesError) {
      process.stderr.write(`${err.message}\n`);
      return 1;
    }
    if (err instanceof FeatureSymlinkError) {
      process.stderr.write(`symlink in features/ is not signable: ${err.message}\n`);
      return 1;
    }
    throw err;
  }
}

// Subjects of every commit after `sha`, oldest first. A sha git cannot
// resolve is reported as a stale-qa violation, never a crash — the record
// pointing at an unknown commit is exactly the drift the audit exists for.
function commitSubjectsAfter(cwd: string, sha: string): string[] | Violation {
  try {
    const out = execFileSync(
      "git",
      ["log", "--reverse", "--format=%s", `${sha}..HEAD`],
      { cwd, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
    );
    return out.split("\n").filter((line) => line.length > 0);
  } catch {
    return {
      code: "stale-qa",
      detail: `QA's verified commit ${sha} is not resolvable in this repo`,
    };
  }
}

function runRecordAudit(cwd: string): Violation[] {
  const records = loadRunRecords(cwd);
  if (!("slices" in records)) return [records];
  const violations = records.slices.flatMap(auditSliceRecord);
  const subjects = commitSubjectsAfter(cwd, records.qa.verified_commit);
  if (Array.isArray(subjects)) violations.push(...auditQa(subjects));
  else violations.push(subjects);
  return violations;
}

function runVerify(cwd: string, delivery: boolean): number {
  try {
    const drift = verify(cwd);
    const violations = delivery ? runRecordAudit(cwd) : [];
    if (drift.length === 0 && violations.length === 0) {
      process.stdout.write("clean\n");
      return 0;
    }
    for (const entry of drift) {
      process.stdout.write(`${entry.status} ${entry.path}\n`);
    }
    for (const violation of violations) {
      process.stdout.write(`${violation.code} ${violation.detail}\n`);
    }
    return 1;
  } catch (err) {
    if (err instanceof UnsignedError) {
      process.stderr.write(`${err.message}\n`);
      return 2;
    }
    if (err instanceof CorruptLockError) {
      process.stderr.write(`corrupt lock: ${err.message}\n`);
      return 3;
    }
    if (err instanceof CorruptRecordError) {
      process.stderr.write(`corrupt run record: ${err.message}\n`);
      return 3;
    }
    if (err instanceof FeatureSymlinkError) {
      process.stderr.write(`corrupt features tree: symlink at ${err.message}\n`);
      return 3;
    }
    throw err;
  }
}

function main(argv: string[], cwd: string): number {
  const [command, flag] = argv;
  if (command === "sign") return runSign(cwd);
  if (command === "verify") return runVerify(cwd, flag === "--delivery");
  process.stderr.write(`unknown command: ${command ?? "<none>"}\n`);
  return 1;
}

process.exitCode = main(process.argv.slice(2), process.cwd());
