---
name: maestro
description: Take a task, bug, or issue to a reviewed, evidence-backed PR ready to merge. Use bottega:maestro, or when the user asks bottega for work in their own words. Never use proactively; a run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro

Take one piece of work (a run) from request to a PR ready to merge, as its orchestrator. Keep every judgment call in your own turns: the design, the arbitration of review findings, the acceptance of the delivered head. Workers write the production code; code you write yourself gets the same review as any worker's code. When the user's words say to run autonomously, deliver straight through, resolving the user's part as each phase's method says; the size of the work never makes that call.

Check your model before anything else. A run is orchestrated from Claude Code on fable-5 at xhigh. On any other model or harness, stop and tell the user; offer opus-5 at xhigh when fable-5 is unavailable, and continue only when the user says so.

Every dispatch names the model and effort from its row of the worker table, [references/workers.md](references/workers.md). A worker that fails its requirement gets one rerun after you diagnose the failure, never automatic; it is the one dispatch that may leave its row.

## 1. Discover

Use `bottega:discover` to find and settle the unknowns. Then call the delivery on what it found, and say it: work whose whole diff you can state in one sentence takes no spec and no plan, built in your own turns or one builder dispatch and taken straight to Review; everything else takes every phase below. The call is provisional both ways: work that outgrows its sentence re-enters at Spec, and settled discovery shrinks later phases to what stays open.

## 2. Open

Use `bottega:open` to claim and isolate the run.

## 3. Spec

Use `bottega:spec` to agree the spec and commit it.

## 4. Plan

Use `bottega:plan` to fix what the builders must not decide.

## 5. Build

Use `bottega:build` to deliver the slices. When a worker hits a case the plan did not anticipate, it asks you: choose the cautious option, note on the plan what was done differently and why, and let the worker continue. Review reads those notes; work with no plan carries them in the PR body.

## 6. Review

Use `bottega:code-review` on the integrated diff. You verify every finding against the real code, reconcile the evidence against every fixed decision in the plan, or against the spec's decisions when there is no plan, or against the request and the delivery call's sentence when there is neither, and accepting or rejecting the reviewed head is your call.

## 7. QA

Use `bottega:qa` on the accepted head and every changed product scenario, drawn from the repo's critical-journeys doc where one keeps them (the changed journeys, plus any the diff touches). A divergence stops the drive so you classify and route it by cause: an implementation defect is a builder dispatch, the defect and its evidence in the brief; a wrong spec, domain model, or architecture returns to Plan. A repair updates the docs its change touches, ends with gates green, and re-enters the review to your acceptance, then fresh QA at the re-drive scope `bottega:qa` sets.

## 8. Close

First audit completion: for every requirement in the spec, point at the evidence in the current state that proves it (a file, a command output, a QA verdict); unproven means not done. Then use `bottega:close`, routing every failure the diff caused through the repair path phase 7 defines. When close stops instead at something only a person can clear, pass that to the user and leave the branch and its PR standing for them.

The run's state is the worktree, its plan, its commits, and the PR; a later session resumes by reading them, re-running `bottega:open` against the branch, and committing any finished worker output it finds. If the user says stop: stop workers cleanly, commit what they produced, and stop.
