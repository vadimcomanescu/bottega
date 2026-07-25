---
name: maestro
description: Take a task, bug, or issue to a reviewed, evidence-backed PR ready to merge. Invoke bottega:maestro, or when the user asks bottega for work in their own words. Never invoke proactively; a run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro

Take one piece of work (a run) from request to a PR ready to merge, as its orchestrator. Keep every judgment call in your own turns: the design, the arbitration of review findings, the acceptance of the delivered head. Workers write the production code; code you write yourself gets the same review as any worker's code. The user appears once: agreeing to the spec. When the user says to run autonomously, skip the spec agreement and deliver straight through; that call comes from the user's words, never from the size of the work.

Check your model before anything else. A run is orchestrated from Claude Code on fable-5 at xhigh, and fable-5 never runs a worker dispatched as a subagent. On any other model or harness, stop and tell the user; offer opus-5 at xhigh when fable-5 is unavailable, and continue only when the user says so.

Claude models do the work and GPT models check it with fresh eyes. Every worker's model and effort is one row of the worker table, [references/workers.md](references/workers.md), and every dispatch names both on the call that starts the worker; the mechanical jobs you dispatch yourself (renames, doc sync, shell relays) go to the mechanic's row. A codex worker is a CLI call you run from your own turn per the codex dispatch method, [references/codex-dispatch.md](references/codex-dispatch.md), with the model and effort from the table and the sandbox the dispatch site names. A worker that fails its requirement gets one rerun, at higher effort or on a GPT model, after you diagnose the failure; never automatic.

Every worker holds a visible row on the harness screen for its whole run: a Claude worker as a subagent, a codex worker as a tracked background task.

Tell the user which path the request gets, in a sentence or two: product work goes through the whole flow below. Work you fully understand on reading it (a bugfix, a doc update, a mechanical change) is a one-shot: say so, write the spec yourself and commit it to `docs/specs/` on the branch, then build it in your own turns or one builder dispatch and go straight to Review; QA it when it changed something a user sees. Every path keeps the same guarantees: the worktree and branch, gates green, the integrated review by both Claude and GPT, the PR.

## 1. Open

Invoke `bottega:open`; it ends with the run owned, isolated on branch `bottega/<slug>`, the owner file naming this session, the project's commands read from the agent map, and the codex CLI confirmed ready or the user told why it is not.

## 2. Spec

Invoke `bottega:spec`; it ends with the agreed spec committed on the branch.

## 3. Plan

Invoke `bottega:plan`; it ends with the plan committed on the branch.

## 4. Build

Invoke `bottega:build`; it ends with every slice integrated, the full suite green at the run branch's head, and the simplification pass landed.

## 5. Review

Invoke `bottega:code-review` on the integrated diff; it ends with the doc-coverage check done and the two-engine review and the spec-conformance check converged at one head with nothing blocking remaining. You verify every finding from both against the real code, reconcile the evidence against every fixed decision in the plan, or against the spec's decisions when a one-shot has no plan, and accepting or rejecting the reviewed head is your call.

## 6. QA

Invoke `bottega:qa` with the accepted head and every changed product scenario, drawn from the repo's critical-journeys doc where one keeps them (the changed journeys, plus any the diff touches). A divergence stops the drive so you classify and route it by cause: an implementation defect is a builder dispatch, the defect and its evidence in the brief; a wrong spec, domain model, or architecture returns to Plan. A repair updates the docs its change touches, ends with gates green, and re-enters the review to your acceptance, then fresh QA at the re-drive scope `bottega:qa` sets.

## 7. Close

First audit completion: for every requirement in the spec, point at the evidence in the current state that proves it (a file, a command output, a QA verdict); unproven means not done. Then invoke `bottega:close`; it opens the PR, watches it to green, and reports it ready for the owner's merge, routing every failure the diff caused through the repair path phase 6 defines. When close stops instead at something only a person can clear, pass that to the user and leave the branch and its PR standing for them.

The run's state is the worktree, its plan, its commits, and the PR; a later session resumes by reading them, re-running `bottega:open` against the branch, and committing any finished worker output it finds. If the user says stop: stop workers cleanly, commit what they produced, and stop.
