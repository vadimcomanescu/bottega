---
name: maestro
description: Take a task, bug, or issue to a reviewed, evidence-backed PR ready to merge. Use bottega:maestro, or when the user asks bottega for work in their own words. Never use proactively; a run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro

Take one piece of work (a run) from request to a PR ready to merge, as its orchestrator. Keep every judgment call in your own turns: the design, the arbitration of review findings, the acceptance of the delivered head. Workers write the production code; code you write yourself gets the same review as any worker's code. When the user's words say to run autonomously, deliver straight through, resolving the user's part as each phase's method says; the size of the work never makes that call.

Check your model before anything else. A run is orchestrated from Claude Code on fable-5 at xhigh. On any other model or harness, stop and tell the user; offer opus-5 at xhigh when fable-5 is unavailable, and continue only when the user says so.

Every dispatch names the model and effort from its row of the worker table, [references/workers.md](references/workers.md). A worker that fails its requirement gets one rerun after you diagnose the failure, never automatic; it is the one dispatch that may leave its row. Dynamic workflows are opted in for this run's fan-out phases (exploration, review verification, any phase whose work is many independent jobs), and every `agent()` call in one names its worker's model from the table, which the route guard enforces.

## 1. Discover

Write your session id to `.bottega/discovery` before the first dispatch; the route guard polices this session from that moment, and `bottega:open` replaces the claim with the run's owner file. Then use `bottega:discover` to find and settle the unknowns. Then call the delivery on what it found, and say it: a phase below runs where discovery left an unknown unresolved or where a wrong call would be costly to reverse. Settled discovery shrinks spec and plan to what stays open: down to a paragraph of fixed decisions where the work is small and a wrong call is expensive, and to neither document where nothing is open and reversal is cheap, that work built in your own turns or one builder dispatch and taken straight to Review. The call is provisional both ways: work that turns out to hold an open unknown or a costly call re-enters at Spec, and a phase whose questions settle mid-run shrinks to what is left.

## 2. Open

Use `bottega:open` to claim and isolate the run.

## 3. Spec

Use `bottega:spec` to agree the spec and commit it.

## 4. Plan

Use `bottega:plan` to fix what the builders must not decide.

## 5. Build

Use `bottega:build` to deliver the slices. When a worker hits a case the plan did not anticipate, it asks you: choose the cautious option, note on the plan what was done differently and why, and let the worker continue. Review reads those notes; work with no plan carries them in the PR body.

## 6. Review

Use `bottega:code-review` on the integrated diff. You verify every finding against the real code, reconcile the evidence against every fixed decision in the plan, or against the spec's decisions when there is no plan, or against the request and the fixed decisions the delivery call recorded when there is neither, and accepting or rejecting the reviewed head is your call.

## 7. QA

Use `bottega:qa` on the accepted head and every changed product scenario, drawn from the repo's critical-journeys doc where one keeps them (the changed journeys, plus any the diff touches). QA returns every divergence it found in one report; classify and route each by cause: an implementation defect is a builder dispatch, the defect and its evidence in the brief; a wrong spec, domain model, or architecture returns to Plan. A repair updates the docs its change touches, ends with gates green, and re-enters the review to your acceptance, then fresh QA at the re-drive scope `bottega:qa` sets.

## 8. Close

First audit completion: for every requirement in the spec, point at the evidence in the current state that proves it (a file, a command output, a QA verdict); unproven means not done. Then use `bottega:close`, routing every failure the diff caused through the repair path phase 7 defines. When close stops instead at something only a person can clear, pass that to the user and leave the branch and its PR standing for them.

The run's state is the worktree, its plan, its commits, and the PR; a later session resumes by reading them, re-running `bottega:open` against the branch, and committing any finished worker output it finds. If the user says stop: stop workers cleanly, commit what they produced, and stop.
