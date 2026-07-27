---
name: build
description: The build method a run's Build phase invokes whole. Dispatch one builder per slice, check every report, drive every slice that changes a user-facing surface, keep the project's gates green at every integrate, and finish with a simplification pass. Not user-invocable.
user-invocable: false
---

# Build

Build the plan's slices through dispatched builders and leave the integrated code at its final shape, gates green.

## 1. Dispatch

A builder is a fresh worker given one job (a slice of the plan, or a repair) with the plan, the spec path, its owned files, and the gate commands, on the builder's row of [the worker table](../maestro/references/workers.md); its doctrine is `bottega:implementing`, and every change to product code in a run is a builder dispatch. Dispatch one builder per slice through the harness's native isolation, each in its own worktree from the run branch's current commit, and sequence only slices that share a file or a resource only one worker can use at a time. Complete when every slice is dispatched or sequenced behind the slice it waits on.

## 2. Check

Treat every worker report as a claim to check, never as a fact; a report whose evidence is missing, or narrower than its claim, goes back to the worker. When a builder's output is bad, fix the instructions that produced it and rerun; do not hand-patch a builder's diff. Complete when every report is checked against its evidence.

## 3. Drive

A slice that changes a user-facing surface is driven once its gates are green and before you accept it, by a fresh worker on the QA driver's row of [the worker table](../maestro/references/workers.md) briefed with `bottega:qa`: through the interface a user actually uses, judging how good the result is as well as whether it matches the plan. Complete when every slice that changed a user-facing surface has been driven and its report read.

## 4. Integrate

Keep every merge decision yourself. Every slice ends with the map's gate commands green (format, lint, typecheck, tests) before it merges, and the full suite runs at every integrate; a failure the run introduced freezes merging until you route the fix. When builders iterate against gate runs that take minutes, file a followup to shrink the gate. Complete when every slice is merged and the full suite is green at the run branch's head.

## 5. Simplify

After a group of slices has landed, run one simplification pass over the changed files (reuse, dead weight, needless complexity) as a builder dispatch; it applies its fixes and the gates run again, before the integrated review so the review judges the code's final shape. Complete when the pass has landed and the gates are green.
