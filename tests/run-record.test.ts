import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  CorruptRecordError,
  auditQa,
  auditSliceRecord,
  loadRunRecords,
  recordsDir,
  type SliceRecord,
} from "../src/run-record.ts";

function record(overrides: Partial<SliceRecord> = {}): SliceRecord {
  return {
    slice: "a-portal-spine",
    builder: { family: "codex", model: "gpt-5.5" },
    rounds: [
      {
        round: 1,
        reviewer: { family: "claude", model: "opus-4.8" },
        verdict: "findings",
        fix_commits: ["abc123"],
      },
      { round: 2, reviewer: { family: "claude", model: "opus-4.8" }, verdict: "clean" },
    ],
    ...overrides,
  };
}

describe("auditSliceRecord", () => {
  it("passes a cross-family record whose last round is clean", () => {
    expect(auditSliceRecord(record())).toEqual([]);
  });

  it("flags a same-family round, case-insensitively", () => {
    const violations = auditSliceRecord(
      record({
        rounds: [
          { round: 1, reviewer: { family: "Codex", model: "gpt-5.5" }, verdict: "clean" },
        ],
      }),
    );
    expect(violations).toEqual([
      expect.objectContaining({ code: "same-family-review" }),
    ]);
  });

  it("flags a slice whose last round has open findings", () => {
    const violations = auditSliceRecord(
      record({
        rounds: [
          {
            round: 1,
            reviewer: { family: "claude", model: "opus-4.8" },
            verdict: "findings",
            fix_commits: ["abc123"],
          },
        ],
      }),
    );
    expect(violations).toEqual([expect.objectContaining({ code: "unreviewed-fix" })]);
  });

  it("flags a clean last round that carries its own unreviewed fixes", () => {
    const violations = auditSliceRecord(
      record({
        rounds: [
          {
            round: 1,
            reviewer: { family: "claude", model: "opus-4.8" },
            verdict: "clean",
            fix_commits: ["abc123"],
          },
        ],
      }),
    );
    expect(violations).toEqual([expect.objectContaining({ code: "unreviewed-fix" })]);
  });

  it("flags a slice with no rounds at all", () => {
    expect(auditSliceRecord(record({ rounds: [] }))).toEqual([
      expect.objectContaining({ code: "unreviewed-fix" }),
    ]);
  });

  it("flags fable on any seat: builder, reviewer, or listed worker", () => {
    const violations = auditSliceRecord(
      record({
        builder: { family: "claude", model: "claude-fable-5" },
        workers: [{ role: "clerk", model: "fable" }],
      }),
    );
    const codes = violations.map((entry) => entry.code);
    expect(codes.filter((code) => code === "fable-worker")).toHaveLength(2);
  });
});

describe("auditQa", () => {
  it("exempts bookkeeping commits and flags product commits", () => {
    const violations = auditQa([
      "bottega: runstate — verify evidence archived (0001)",
      "d2-gateway-surface: reconcile mid-run test (green)",
      "bottega: integrate fix-late",
    ]);
    expect(violations).toEqual([
      expect.objectContaining({
        code: "stale-qa",
        detail: expect.stringContaining("d2-gateway-surface"),
      }),
    ]);
  });

  it("passes when nothing landed after QA", () => {
    expect(auditQa([])).toEqual([]);
  });
});

describe("loadRunRecords", () => {
  const cleanups: string[] = [];
  afterEach(() => {
    while (cleanups.length > 0)
      rmSync(cleanups.pop()!, { recursive: true, force: true });
  });

  function runDir(): string {
    const dir = mkdtempSync(join(tmpdir(), "bottega-records-"));
    cleanups.push(dir);
    return dir;
  }

  it("reports missing-records when the dir, slices, or qa.json are absent", () => {
    const dir = runDir();
    expect(loadRunRecords(dir)).toEqual(
      expect.objectContaining({ code: "missing-records" }),
    );
    mkdirSync(recordsDir(dir), { recursive: true });
    expect(loadRunRecords(dir)).toEqual(
      expect.objectContaining({ code: "missing-records", detail: "no slice records" }),
    );
    writeFileSync(join(recordsDir(dir), "a.json"), JSON.stringify(record()));
    expect(loadRunRecords(dir)).toEqual(
      expect.objectContaining({ code: "missing-records", detail: "no qa.json" }),
    );
  });

  it("loads well-formed slice and qa records", () => {
    const dir = runDir();
    mkdirSync(recordsDir(dir), { recursive: true });
    writeFileSync(join(recordsDir(dir), "a.json"), JSON.stringify(record()));
    writeFileSync(
      join(recordsDir(dir), "qa.json"),
      JSON.stringify({ verified_commit: "deadbeef" }),
    );
    const records = loadRunRecords(dir);
    expect("slices" in records && records.slices).toHaveLength(1);
    expect("qa" in records && records.qa.verified_commit).toBe("deadbeef");
  });

  it("throws CorruptRecordError on malformed records", () => {
    const dir = runDir();
    mkdirSync(recordsDir(dir), { recursive: true });
    writeFileSync(join(recordsDir(dir), "qa.json"), JSON.stringify({ verified_commit: "x" }));
    writeFileSync(join(recordsDir(dir), "bad.json"), "{ not json");
    expect(() => loadRunRecords(dir)).toThrow(CorruptRecordError);
    writeFileSync(
      join(recordsDir(dir), "bad.json"),
      JSON.stringify({ slice: "s", builder: { family: "codex" }, rounds: [] }),
    );
    expect(() => loadRunRecords(dir)).toThrow(CorruptRecordError);
    writeFileSync(
      join(recordsDir(dir), "bad.json"),
      JSON.stringify({
        slice: "s",
        builder: { family: "codex", model: "m" },
        rounds: [{ round: 1, reviewer: { family: "claude", model: "m" }, verdict: "maybe" }],
      }),
    );
    expect(() => loadRunRecords(dir)).toThrow(CorruptRecordError);
  });
});
