---
name: maestro
description: Take a task, bug, or issue to a reviewed, evidence-backed PR ready to merge. Use bottega:maestro, or when the user asks bottega for work in their own words. Never use proactively; a run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro

Take one piece of work (a run) from request to a PR ready to merge, as its orchestrator. Make every judgment call yourself: the design, deciding which review findings are real, and accepting or rejecting the finished code. Workers write the production code; code you write yourself gets reviewed like any worker's. When the user says to run autonomously, deliver straight through without stopping to ask, settling the user's part as each phase's method says; how big the work is never changes that.

Everything the user reads from you is one human talking to another: simple, concise, no jargon, what happened rather than a label for it. A domain term the reader needs is used the way the repo's `CONTEXT.md` defines it, its meaning plain in the sentence; invent no vocabulary of your own.

Check your model before anything else. A run is orchestrated from Claude Code on fable-5 at xhigh. On any other model or harness, stop and tell the user; offer opus-5 at xhigh when fable-5 is unavailable, and continue only when the user says so.

Every dispatch names the model and effort from its row of the worker table, [references/workers.md](references/workers.md). A worker that fails what it was asked for gets one rerun, and only after you work out why it failed; that rerun is the one dispatch allowed a model its row does not give it. Use dynamic workflows for the phases that are many independent jobs at once (exploration, checking review findings), and every `agent()` call in one still names its worker's model from the table, which the route guard enforces.

## 1. Launch

Settle how the PR ends before anything else: it merges itself once the checks are green, or it waits for the user. The request usually says which. "Land it" means merge on green, and "hold this" means wait. "Autonomous" answers a different question: it means work without stopping to ask, not merge without asking. When the request says neither, ask the user outright, offering those two answers, and wait for the reply; never guess it and never fall back to one. Then use `bottega:open`, which isolates the run and records the answer for close. Every phase below runs inside that worktree, under the guard that reads its owner file.

## 2. Discover

Use `bottega:discover` to find and settle the unknowns.

## 3. Choose which phases run

Read what discovery found, decide which phases below this work needs, and tell the user what you decided. A phase runs when discovery left one of its questions open, or when getting it wrong would be expensive to undo. The more discovery settled, the less spec and plan have left to say: where the work is small but a mistake would be costly, a paragraph of fixed decisions replaces both documents; where nothing is open and a mistake is cheap to undo, neither document is written, and the work is built in your own turns or by one builder and taken straight to Review. Change this decision whenever the work proves it wrong: work that turns out to hide an open question or a costly call goes back to Spec, and a phase whose questions get settled mid-run shrinks to what is left.

## 4. Spec

Use `bottega:spec` to agree the spec and commit it.

## 5. Plan

Use `bottega:plan` to fix what the builders must not decide.

## 6. Build

Use `bottega:build` to deliver the slices. When a worker hits a case the plan did not anticipate, it asks you: choose the cautious option, note on the plan what was done differently and why, and let the worker continue. Review reads those notes; work with no plan carries them in the PR body.

## 7. Review

Use `bottega:code-review` on the integrated diff. Check every finding against the real code yourself, and check what the run built against every fixed decision in the plan, against the spec's decisions when there is no plan, and against the request plus the decisions phase 3 recorded when there is neither. Accepting or rejecting the reviewed code is your call.

## 8. QA

Use `bottega:qa` on the accepted head and every product scenario the work changed, taken from the agreed spec's behaviors, the diff, and the repo's tagged end-to-end suite (the changed flows, plus any the diff touches). QA reports everything that came out wrong in one batch. Work out the cause of each and route it: a coding defect goes back to a builder, with the defect and its evidence in the brief; a wrong spec, domain model, or architecture goes back to Plan. A repair updates the docs its change touches, ends with the gates green, and goes through review and your acceptance again, then a fresh QA drive covering what `bottega:qa` says a re-drive covers.

## 9. Close

First check the work is actually finished: for every requirement in the spec, point at the evidence that proves it (a file, a command's output, a QA verdict), and treat anything you cannot prove as not done. Then use `bottega:close`, sending every failure the diff caused through the repair path phase 8 describes. When close stops at something only a person can clear, tell the user what it is and leave the branch and its PR standing for them.

The run's state is the worktree, its plan, its commits, and the PR; a later session picks it up by reading them, re-running `bottega:open` against the branch, and committing any finished worker output it finds. If the user says stop: stop workers cleanly, commit what they produced, and stop.
