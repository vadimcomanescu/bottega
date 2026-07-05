// The run-record audit: verify --delivery reads the per-slice records the
// maestro writes as each slice's loop closes, and turns the process
// invariants into mechanical facts. The maestro authors its workflows
// freely; what it cannot do is deliver a run whose record violates:
//   - opposite-family review, every round;
//   - the last round of every slice is clean (a fix never ships unreviewed);
//   - fable never rides a worker seat;
//   - no product commit lands after QA's verified commit (bookkeeping
//     commits — the "bottega: " grammar — are exempt).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface SeatRecord {
  family: string;
  model: string;
}

export interface RoundRecord {
  round: number;
  reviewer: SeatRecord;
  verdict: "clean" | "findings";
  fix_commits?: string[];
}

export interface SliceRecord {
  slice: string;
  builder: SeatRecord;
  rounds: RoundRecord[];
  workers?: { role: string; model: string }[];
}

export interface QaRecord {
  verified_commit: string;
}

export interface Violation {
  code:
    | "same-family-review"
    | "unreviewed-fix"
    | "fable-worker"
    | "stale-qa"
    | "missing-records";
  detail: string;
}

export class CorruptRecordError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "CorruptRecordError";
  }
}

const RECORDS_DIR = join(".bottega", "run", "records");
const QA_FILE = "qa.json";
const FABLE = /fable/i;
const BOOKKEEPING = /^bottega: /;

export function recordsDir(cwd: string): string {
  return join(cwd, RECORDS_DIR);
}

function isSeat(value: unknown): value is SeatRecord {
  if (value === null || typeof value !== "object") return false;
  const seat = value as { family?: unknown; model?: unknown };
  return typeof seat.family === "string" && typeof seat.model === "string";
}

function parseSliceRecord(raw: string, file: string): SliceRecord {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new CorruptRecordError(`${file}: not valid JSON`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new CorruptRecordError(`${file}: not a JSON object`);
  }
  const record = parsed as {
    slice?: unknown;
    builder?: unknown;
    rounds?: unknown;
    workers?: unknown;
  };
  if (typeof record.slice !== "string" || record.slice.length === 0) {
    throw new CorruptRecordError(`${file}: missing slice name`);
  }
  if (!isSeat(record.builder)) {
    throw new CorruptRecordError(`${file}: builder is not {family, model}`);
  }
  if (!Array.isArray(record.rounds)) {
    throw new CorruptRecordError(`${file}: rounds is not an array`);
  }
  for (const entry of record.rounds as unknown[]) {
    if (entry === null || typeof entry !== "object") {
      throw new CorruptRecordError(`${file}: round entry is not an object`);
    }
    const round = entry as {
      round?: unknown;
      reviewer?: unknown;
      verdict?: unknown;
      fix_commits?: unknown;
    };
    if (typeof round.round !== "number" || !isSeat(round.reviewer)) {
      throw new CorruptRecordError(`${file}: round missing number or reviewer seat`);
    }
    if (round.verdict !== "clean" && round.verdict !== "findings") {
      throw new CorruptRecordError(`${file}: round verdict must be clean|findings`);
    }
    if (
      round.fix_commits !== undefined &&
      (!Array.isArray(round.fix_commits) ||
        (round.fix_commits as unknown[]).some((sha) => typeof sha !== "string"))
    ) {
      throw new CorruptRecordError(`${file}: fix_commits is not a string array`);
    }
  }
  if (record.workers !== undefined) {
    if (!Array.isArray(record.workers)) {
      throw new CorruptRecordError(`${file}: workers is not an array`);
    }
    for (const entry of record.workers as unknown[]) {
      const worker = entry as { role?: unknown; model?: unknown } | null;
      if (
        worker === null ||
        typeof worker !== "object" ||
        typeof worker.role !== "string" ||
        typeof worker.model !== "string"
      ) {
        throw new CorruptRecordError(`${file}: worker entry is not {role, model}`);
      }
    }
  }
  return record as SliceRecord;
}

function parseQaRecord(raw: string): QaRecord {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new CorruptRecordError(`${QA_FILE}: not valid JSON`);
  }
  const record = parsed as { verified_commit?: unknown } | null;
  if (
    record === null ||
    typeof record !== "object" ||
    typeof record.verified_commit !== "string" ||
    record.verified_commit.length === 0
  ) {
    throw new CorruptRecordError(`${QA_FILE}: missing verified_commit`);
  }
  return record as QaRecord;
}

export function auditSliceRecord(record: SliceRecord): Violation[] {
  const violations: Violation[] = [];
  const builderFamily = record.builder.family.toLowerCase();
  for (const round of record.rounds) {
    if (round.reviewer.family.toLowerCase() === builderFamily) {
      violations.push({
        code: "same-family-review",
        detail: `${record.slice} round ${round.round} (${round.reviewer.family} reviewing ${record.builder.family}-built)`,
      });
    }
  }
  const last = record.rounds.at(-1);
  if (
    last === undefined ||
    last.verdict !== "clean" ||
    (last.fix_commits?.length ?? 0) > 0
  ) {
    violations.push({
      code: "unreviewed-fix",
      detail:
        last === undefined
          ? `${record.slice}: no review rounds recorded`
          : `${record.slice}: last round ${last.round} is not a clean, fix-free round`,
    });
  }
  const seats: { role: string; model: string }[] = [
    { role: "builder", model: record.builder.model },
    ...record.rounds.map((round) => ({
      role: `reviewer round ${round.round}`,
      model: round.reviewer.model,
    })),
    ...(record.workers ?? []),
  ];
  for (const seat of seats) {
    if (FABLE.test(seat.model)) {
      violations.push({
        code: "fable-worker",
        detail: `${record.slice}: ${seat.role} on ${seat.model}`,
      });
    }
  }
  return violations;
}

// commitsAfterVerified: subject line of every commit after qa.verified_commit,
// oldest first. The caller resolves them (git log <verified>..HEAD).
export function auditQa(commitsAfterVerified: string[]): Violation[] {
  return commitsAfterVerified
    .filter((subject) => !BOOKKEEPING.test(subject))
    .map((subject) => ({
      code: "stale-qa" as const,
      detail: `product commit after QA's verified commit: ${subject}`,
    }));
}

export interface RunRecords {
  slices: SliceRecord[];
  qa: QaRecord;
}

export function loadRunRecords(cwd: string): RunRecords | Violation {
  const dir = recordsDir(cwd);
  if (!existsSync(dir)) {
    return { code: "missing-records", detail: `${RECORDS_DIR} does not exist` };
  }
  const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
  const sliceFiles = files.filter((name) => name !== QA_FILE);
  if (sliceFiles.length === 0) {
    return { code: "missing-records", detail: "no slice records" };
  }
  if (!files.includes(QA_FILE)) {
    return { code: "missing-records", detail: `no ${QA_FILE}` };
  }
  return {
    slices: sliceFiles.map((name) =>
      parseSliceRecord(readFileSync(join(dir, name), "utf-8"), name),
    ),
    qa: parseQaRecord(readFileSync(join(dir, QA_FILE), "utf-8")),
  };
}
