---
name: guru
description: "Take a task, bug, or issue to a reviewed, evidence-backed PR as one goal-driven run: a live run contract and failing tests carry the agreement, and no spec or plan file merges. Use bottega:guru when the user asks for a guru run. Never use proactively; a run costs hours of autonomous agent work."
argument-hint: "<task, or issue URL>"
---

# Guru

Take one piece of work (a run) from request to a PR ready for the owner's merge, stated as a goal with a hard done bar instead of phases that commit paper. Keep every judgment call in your own turns: the design, the verification of findings, the acceptance of the head. Run every fan-out as a dynamic workflow, and check your model before anything else against the orchestrator rule in `bottega:maestro`: on any other model or harness, stop and tell the user.

The done bar never moves, whatever the size of the work: the run's own worktree and branch, the project's gates green at the delivered head, one review of the integrated diff by a Claude and a GPT critic with nothing blocking left, evidence behind every requirement, and a PR the owner merges. Everything else scales with what stays open, never with the diff's size: work with no open design decisions takes a contract of a few lines and its tests, no panel, no cold read, and a diff you can state in one sentence goes straight to build and review.

Every dispatch names the model and effort from its worker's row of [the worker table](../maestro/references/workers.md), and every GPT dispatch runs per [the codex dispatch method](../maestro/references/codex-dispatch.md).

## 1. Discover

Write your session id to `.bottega/discovery` before the first dispatch; the route guard reads this session's dispatches from that moment. Then use `bottega:discover` to find and settle the unknowns, the explore step's sweeps fanned out in one dynamic workflow. Complete when discovery hands back the direction, its edges, and every decision answered.

## 2. Open

Use `bottega:open` to claim and isolate the run.

## 3. Contract

Write the run contract: one working file on the run branch, written for the workers and never for posterity, carrying the settled decisions, the slices with their owned files and interfaces, the quality bar the critics score against, and the deviations log. Turn every acceptance criterion a test can check into a failing test now; a failing test turns green through code, never through editing the test. A bar no existing gate checks gets a small reproducible check built before the slices that need it.

A decision that is open, costly to reverse, and settled by no cheap check goes to `bottega:panel`. When the contract fixes decisions worth attacking, strengthen it before anything is built: a fresh worker on the plan editor's row reads the contract, the tests, and the repository cold and returns the contract approved unchanged or rewritten whole, the rewrite its only way to object; take what you accept and commit.

The contract stays live: when the code moves it moves in the same commit, and every deviation lands in it with its reason, because a stale contract misleads workers with confidence. It never merges. By close its content has become the tests, the PR body, and, where the repository keeps decision records, one record for what the code cannot explain by itself. Complete when every settled decision is in the contract and every testable criterion is a failing test.

## 4. Build

Use `bottega:build` to deliver the contract's slices; where its method reads the plan and the spec, hand the workers the contract. A builder that proves its brief wrong with evidence has done its job: choose the cautious option, log the deviation in the contract, and let it continue.

## 5. Review

Run the loop until nothing blocking survives a full round. Each round, two critics read the integrated diff cold, isolated from the builders and from each other and never shown the contract, hunting defects against the repository's own standards and the contract's quality bar: one worker on the Claude critic's row and one on the GPT critic's row. Beside them, a fresh worker on the conformance checker's row reads the diff against the contract and the tests, reporting what is missing, what nobody asked for, and what looks wrong, quoting the contract line each finding rests on; neither pass sees the other's findings. Verify every finding against the real code before accepting it. An accepted blocker (correctness, security, data safety, a broken public interface) goes to a fresh builder per `bottega:build` and the loop reruns at the new head; a real finding below that bar is a followup, filed before the PR opens. Complete when a full round returns nothing blocking and you accept the head.

## 6. QA

Use `bottega:qa` through one worker on the QA driver's row, on the accepted head, with every changed product scenario. Read each failure before routing a repair: not every FAIL is a code defect, and one that traces to a decision in the contract returns to the contract, never to a builder patching the symptom. Every product repair re-enters the review loop, then fresh QA at the re-drive scope `bottega:qa` sets. Publish the evidence per [the evidence method](../close/references/qa-evidence.md). Complete when every changed scenario holds a verdict and its evidence.

## 7. Close

Audit completion first: for every decision and criterion in the contract, point at the evidence in the delivered state that proves it (a test, a command output, a QA verdict); unproven means not done. Open the PR written for a reader who was not in the run, carrying what changed and why, every decision made on the user's behalf with the one most likely to draw a different answer first, the contract's deviations log, the critics' and the conformance check's verdicts, and the QA evidence with its limits; followups link there and nothing else. Watch every check to completion as tracked background Bash and read the merge state: what a code change can clear goes back through build, review, and QA, and what only a person can clear is named to the user with the PR left open. Report the PR ready at green checks and a clean merge state; the owner's merge is the release, so the run never merges, approves, or enables auto-merge.

The run's state is the worktree, its contract, its commits, and the PR; a later session resumes by reading them and re-running `bottega:open` against the branch. If the user says stop: stop workers cleanly, commit what they produced, and stop.
