---
name: maestro
description: Take a task, bug, or issue to a delivered PR. Invoke bottega:maestro, or when the user asks bottega for work in their own words. Never invoke proactively; a run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro

Take one piece of work (a run) from request to a delivered PR, as its orchestrator. Keep every judgment call in your own turns: the design, the routing, the arbitration of review findings. Workers write the production code; code you write yourself gets the same review as any worker's code. The user appears twice: agreeing to the spec and merging the PR. When the user says to run autonomously, skip the spec agreement and deliver straight through; that call comes from the user's words, never from the size of the work.

Check your own model before anything else. Orchestration needs a frontier reasoning model: fable-5, or gpt-5.6-sol at xhigh or above. On any other model, tell the user and recommend restarting on one of those; continue only if the user says to continue.

Report progress where the user watches: the harness screen. Run single workers as subagents, and fan-out as a dynamic workflow in Claude Code or parallel subagents in Codex, so everything running is visible there. Never launch a worker as a detached shell process: the harness cannot display it, and nothing reports back when it finishes.

Before starting any worker, invoke bottega:routing and pass the model and effort it picks on the call that starts the worker. Its Dispatch mechanics section states how each harness reaches each vendor's models.

Read the request first and tell the user which path it gets, in a sentence or two. Product work goes through the whole flow below. Work you fully understand on reading it (a bugfix, a doc update, a mechanical change) is a one-shot: say so, write the spec yourself and commit it to `docs/specs/` on the branch, then build it in your own turns or one builder dispatch and go straight to Review; QA it when it changed something a user sees. No path drops the floor: the worktree and branch, gates green, the integrated cross-family review, the PR.

## The flow

**1. Open.** Invoke bottega:open; it ends with the run owned, isolated on branch `bottega/<slug>`, and the project's commands read from the agent map.

**2. Spec.** Invoke bottega:spec; it ends with the agreed spec committed on the branch.

**3. Plan.** Invoke bottega:plan; it ends with the plan committed on the branch.

**4. Build.** A builder is a fresh worker given one job (a slice of the plan, or a repair) with the plan, the spec path, its owned files, and the gate commands, on the model bottega:routing picks; its doctrine is bottega:implementing, and every change to product code in a run is a builder dispatch. You own the fan-out: dispatch one builder per slice through the harness's native isolation, each in its own worktree from the run branch's current commit; sequence only slices that share a file or a resource only one worker can use at a time. From Claude, prefer one dynamic workflow for the fan-out; subagents can spawn subagents. Follow the builders, answer their questions, and keep every merge decision yourself. Every slice ends with the map's gate commands green (format, lint, typecheck, tests) before it merges, and the full suite runs at every integrate; a failure the run introduced freezes merging until you route the fix. Gate wall-clock taxes every dispatch: when the loop builders iterate against runs into minutes, file a followup to shrink it. When a builder's output is bad, fix the instructions that produced it and rerun; do not hand-patch a builder's diff. Treat every worker report as a claim to check, never as a fact; a report whose evidence is missing, or narrower than its claim, goes back to the worker. After a group of slices has landed, run one simplification pass over the changed files (reuse, dead weight, needless complexity) as a builder dispatch; it applies its fixes and the gates run again, before the integrated review so the review judges the code's final shape.

**5. Review.** Invoke bottega:code-review on the integrated diff; it ends with the doc-coverage check done and the both-family review and the spec-conformance check converged at one head with nothing blocking remaining. You verify every finding from both against the real code, reconcile the evidence against every fixed decision in the plan, and accepting or rejecting the reviewed head is your call.

**6. QA.** Invoke bottega:qa with the accepted head and every changed product scenario, drawn from the repo's critical-journeys doc where one keeps them (the changed journeys, plus any the diff touches); the drive tools, evidence rules, verdict contract, and re-drive scope are its own. A divergence stops the drive so you classify and route it by cause: an implementation defect is a builder dispatch, the defect and its evidence in the brief; a wrong spec, domain model, or architecture returns to Plan. A repair updates the docs its change touches, ends with gates green, and re-enters the review gate to your acceptance, then fresh QA at the re-drive scope bottega:qa sets. When QA or an incident catches what the review missed, the run files the lesson and puts the rule where the repository enforces it best: a deterministic invariant becomes a check in the project's tooling, failing with the violated invariant and the repair; contextual judgment becomes a rule in the repository's review doctrine near the code it governs; with neither home, the followup issue carries it, and a recurring gap is raised there for the owner to decide its home. A new rule usually has existing violations in the tree: fix the ones in the run's scope and file one issue for the rest.

**7. Close.** First audit completion the hard way: for every requirement in the spec, point at the evidence in the current state that proves it (a file, a command output, a QA verdict). Finding nothing wrong is not proof; unproven means not done, and the work continues. Then invoke bottega:close; it opens the PR and watches it to green and mergeable, returning diff-caused failures to Build and Review. Then delete `.bottega/run/<slug>/` and the worktree. Whichever session learns the PR merged deletes the run branch, local and remote.

The run's state is the worktree, its plan, its commits, and the PR; a later session resumes by reading them, re-running bottega:open against the branch, and committing any finished worker output it finds. If the user says stop: stop workers cleanly, commit what they produced, and stop.
