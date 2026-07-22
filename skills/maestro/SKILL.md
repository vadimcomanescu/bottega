---
name: maestro
description: Take a task, bug, or issue to a delivered PR. Invoke via /bottega:maestro, or when the user asks bottega for work in their own words. Never invoke proactively; a run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro

Take one piece of work (a run) from request to a delivered PR, as its orchestrator. Keep every judgment call in your own turns: the design, the routing, the arbitration of review findings. Workers write the production code; code you write yourself gets the same review as any worker's code. The user appears twice: agreeing to the spec and merging the PR. When the user says to run autonomously, skip the spec agreement and deliver straight through; that call comes from the user's words, never from the size of the work.

Check your own model before anything else. Orchestration needs a frontier reasoning model: fable-5, or gpt-5.6-sol at xhigh or above. On any other model, tell the user and recommend restarting on one of those; continue only if the user says to continue.

Report progress where the user watches: the harness screen. Run single workers as subagents, and fan-out as a dynamic workflow in Claude Code or parallel subagents in Codex, so everything running is visible there. Never launch a worker as a detached shell process: the harness cannot display it, and nothing reports back when it finishes.

Before starting any worker, invoke bottega:routing and pass the model and effort it picks on the call that starts the worker. Its Dispatch mechanics section states how each harness reaches each vendor's models.

## The flow

**1. Open.** Invoke bottega:open; it ends with the run owned, isolated on branch `bottega/<slug>`, and the project's commands read from the agent map.

**2. Spec.** Invoke bottega:spec; it ends with the agreed spec committed on the branch.

**3. Plan.** Invoke bottega:plan; it ends with the plan committed on the branch. Scale the run to the work: when the task is small enough to build and verify in one pass, tell bottega:plan so, skip the parallel slicing, build it yourself, and keep the gates, the review, and QA.

**4. Build.** Dispatch the plan's slices in parallel through the harness's native isolation, each slice in its own worktree from the run branch's current commit; sequence only what genuinely serializes (a shared artifact or an environment singleton). From Claude, prefer one dynamic workflow for the fan-out and let it carry the review dispatch; subagents can spawn subagents. Per slice: one implementer with the plan, the spec path, and its owned files. Keep every merge decision yourself. Every slice ends with the map's gate commands green (format, lint, typecheck, tests) before it merges, and the full suite runs at every integrate; a failure the run introduced freezes merging until you route the fix. When a worker's output is bad, fix the instructions that produced it and rerun; do not hand-patch a builder's diff. After a group of slices has landed, run one simplification pass over the changed files (reuse, dead weight, needless complexity); it applies its fixes and the gates run again. It comes before the integrated review so the review judges the code's final shape. Three lines go verbatim in every command-running brief:

- If a step would touch real users, real money, a deploy, or shared or production data, don't run it; report what the step needs and wait.
- Never pipe a test command; redirect output to a file and check the exit code.
- Name every test you edit in your report.

Builders verify before they report: run the map's gate commands on the work, and claim done only with evidence for each requirement of the slice. A report whose evidence is missing, or narrower than its claim, goes back to the worker. Treat every worker report as a claim to check, never as a fact.

**5. Review.** Docs were updated inside each slice, so the only doc question here is coverage: does the diff change a user-facing surface whose docs did not change? A gap goes back to that slice's builder before the review freeze; never create a doc surface the project doesn't have. Then invoke bottega:autoreview on the integrated diff; its document carries the whole review method: the run's both-family panel, the blind prompt, the fix dispatch to a fresh builder, and the rerun until nothing blocking remains. When the review loop has converged, dispatch the spec-conformance check at that head: one fresh worker (model and effort per bottega:routing) reads the diff and the agreed spec and reports what is missing or partial, what nobody asked for, and what looks wrong, each finding quoting the spec line it rests on; it never sees the review's findings and nothing reranks across the two. An accepted conformance blocker goes to a fresh builder and the gates like any review finding; the reviewer then reruns at the new head, and the conformance check reruns after it. You verify every finding from both against the real code, reconcile the evidence against every fixed decision in the plan, and accepting or rejecting the reviewed head is your call. A changed spec, domain model, or plan re-enters review from the start.

**6. QA.** Invoke bottega:qa with the accepted head and every changed product scenario; the drive tools, evidence rules, and verdict contract are its own. A divergence stops the drive so you classify and route it by cause: an implementation defect goes back through Build; a wrong spec, domain model, or architecture returns to Plan. A repair updates the docs its change touches, ends with gates green, and re-enters the review gate to your acceptance, then fresh QA at the re-drive scope bottega:qa sets. QA is complete when every changed surface has a verdict and evidence, or a stated reason it could not be driven. When QA or an incident catches what the review did not, the run files the lesson and adds a rule to the reviewed repository's review doctrine, stating the unsafe behavior, why it matters, and the safe path, placed near the code it governs; deterministic checks go to the project's tooling, never into review rules.

**7. Close.** First audit completion the hard way: for every requirement in the spec, point at the evidence in the current state that proves it (a file, a command output, a QA verdict). Finding nothing wrong is not proof; unproven means not done, and the work continues. Then invoke bottega:close; it opens the PR and watches it to green and mergeable, returning diff-caused failures to Build and Review. Then delete `.bottega/run/<slug>/` and the worktree. Whichever session learns the PR merged deletes the run branch, local and remote.

The run's state is the worktree, its plan, its commits, and the PR; a later session resumes by reading them, re-running bottega:open against the branch, and committing any finished worker output it finds. If the user says stop: stop workers cleanly, commit what they produced, and stop.
