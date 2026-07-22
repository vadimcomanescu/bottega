# Plan: the harness-engineering study, recorded for the next session

Spec: [`docs/specs/2026-07-22-harness-engineering-study.md`](../specs/2026-07-22-harness-engineering-study.md)

One pass, one slice. The orchestrator builds it; the gates, the integrated review, and QA still run.

## Domain decisions

**Register.** A research note records a reading: what a source says, what this repository concluded, and when. It is not a decision record and not a failure record. `docs/adr/` holds decisions the repository has taken; `docs/lessons/` holds failures and the rules they produced. A recommendation that no one has agreed to belongs to none of those, so it stays in the research note, marked as proposed. This keeps the existing separation intact rather than adding a fourth kind of document.

**One home per fact.** The note is the only home for the study. The map row and the README line route to it and restate nothing from it. The note itself points at the skills it describes rather than quoting their bodies, per `docs/lessons/point-never-embed.md`.

**Snapshot honesty.** The source is an outside repository that moves. The note names the commit it was read at, so a later reader can check any claim against the exact text that produced it.

**Claim discipline.** Every claim the note makes about bottega's current behavior names the part of the method that carries it. Every claim about the corpus is attributable to the corpus. The two are never mixed in one sentence, because the value of the note is that a reader can tell them apart.

## The slice

One vertical slice, owning four files.

| File | Change |
| --- | --- |
| `docs/research/2026-07-22-harness-engineering.md` | New. The study: what the corpus argues, what bottega already implements, six proposed adoptions, named-but-not-built items, rejected items with reasons, attribution, and the pinned source revision. |
| `AGENTS.md` | Add a `docs/research/` row to the Map table, routing to the notes. `CLAUDE.md` is a symlink to this file and needs no separate edit. |
| `README.md` | Widen the `docs/research/` line: the shelf now holds readings of outside work, not only worker-doctrine sources. |
| `.claude-plugin/plugin.json` | Version to 0.82.0, above the base 0.81.0, as the release gate requires. |

Docs are inside the slice: the map row and the README line are the documentation of the surface this change adds.

## Format

The note follows the shape the existing research note sets (`docs/research/worker-doctrine-sources.md`): a dated snapshot line, then sections that keep source facts apart from this repository's conclusions. It orders the proposals strongest first, as the reading ranked them.

## Evidence a reviewer can inspect

- The note names the source revision, and that revision exists in the source repository.
- Each proposed adoption is marked proposed and not agreed, and names where it would land.
- Each claim about bottega's current behavior names the part of the method that carries it, and that part says what the note says it says.
- The map row routes and restates nothing.
- `npm test` passes.

## Out of scope

No proposal is implemented. No skill, hook, or test changes to enforce one. No ADR and no lesson is written from this study.

## Status

Slice 1: landed.
