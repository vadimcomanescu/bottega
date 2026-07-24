---
name: maestro
description: Take a task, bug, or issue to a merged PR. Invoke bottega:maestro, or when the user asks bottega for work in their own words. Never invoke proactively; a run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro

Take one piece of work (a run) from request to a merged PR, as its orchestrator. Keep every judgment call in your own turns: the design, the model choices, the arbitration of review findings. Workers write the production code; code you write yourself gets the same review as any worker's code. The user appears once: agreeing to the spec. When the user says to run autonomously, skip the spec agreement and deliver straight through; that call comes from the user's words, never from the size of the work.

Check your model before anything else. A run is orchestrated from Claude Code on fable-5 at xhigh. On any other model or harness, stop and tell the user; offer opus-5 at xhigh when fable-5 is unavailable, and continue only when the user says so.

Fable-5 orchestrates and never runs a worker. Claude models do the work: opus-5 builds at xhigh, drives QA at its default effort, and takes mechanical jobs (renames, doc sync, shell relays) at low effort and exploration at medium. GPT models check that work with fresh eyes: gpt-5.6-sol reads the plan cold, reviews the integrated diff beside the claude engine, and checks the diff against the spec. Each phase's skill states its worker's model and effort, and every dispatch names both on the call that starts the worker. A codex worker is one foreground CLI call from a wrapper subagent per [references/codex-dispatch.md](references/codex-dispatch.md). A worker that fails its requirement gets one rerun, at higher effort or on a GPT model, after you diagnose the failure; never automatic.

Report progress where the user watches: the harness screen. Run single workers as subagents and fan-outs as one dynamic workflow, so everything running is visible there. Never launch a worker as a detached shell process: the harness cannot display it, and nothing reports back when it finishes.

Read the request first and tell the user which path it gets, in a sentence or two. Product work goes through the whole flow below. Work you fully understand on reading it (a bugfix, a doc update, a mechanical change) is a one-shot: say so, write the spec yourself and commit it to `docs/specs/` on the branch, then build it in your own turns or one builder dispatch and go straight to Review; QA it when it changed something a user sees. Every path keeps the same guarantees: the worktree and branch, gates green, the integrated review by both Claude and GPT, the PR.

## 1. Open

Invoke `bottega:open`; it ends with the run owned, isolated on branch `bottega/<slug>`, and the project's commands read from the agent map.

## 2. Spec

Invoke `bottega:spec`; it ends with the agreed spec committed on the branch.

## 3. Plan

Invoke `bottega:plan`; it ends with the plan committed on the branch.

## 4. Build

Invoke `bottega:build`; it ends with every slice integrated, the full suite green at the run branch's head, and the simplification pass landed.

## 5. Review

Invoke `bottega:code-review` on the integrated diff; it ends with the doc-coverage check done and the two-engine review and the spec-conformance check converged at one head with nothing blocking remaining. You verify every finding from both against the real code, reconcile the evidence against every fixed decision in the plan, and accepting or rejecting the reviewed head is your call.

## 6. QA

Invoke `bottega:qa` with the accepted head and every changed product scenario, drawn from the repo's critical-journeys doc where one keeps them (the changed journeys, plus any the diff touches); the QA worker runs opus-5 at its default effort, and the drive tools, evidence rules, verdict contract, and re-drive scope are the skill's own. A divergence stops the drive so you classify and route it by cause: an implementation defect is a builder dispatch, the defect and its evidence in the brief; a wrong spec, domain model, or architecture returns to Plan. A repair updates the docs its change touches, ends with gates green, and re-enters the review to your acceptance, then fresh QA at the re-drive scope `bottega:qa` sets. When QA or an incident catches what the review missed, the run files the lesson and puts the rule where the repository enforces it best: a deterministic invariant becomes a check in the project's tooling, failing with the violated invariant and the repair; contextual judgment becomes a rule in the repository's review doctrine near the code it governs; with neither home, the followup issue carries it, and a recurring gap is raised there for the owner to decide its home. A new rule usually has existing violations in the tree: fix the ones in the run's scope and file one issue for the rest.

## 7. Close

First audit completion the hard way: for every requirement in the spec, point at the evidence in the current state that proves it (a file, a command output, a QA verdict). Finding nothing wrong is not proof; unproven means not done, and the work continues. Then invoke `bottega:close`; it opens the PR, watches it to green, and merges it, returning diff-caused failures to Build and Review. Once the PR is merged, delete `.bottega/run/<slug>/`, the worktree, and the run branch, local and remote. When close stops instead at something only a person can clear, pass that to the user and leave the branch and its PR standing for them.

The run's state is the worktree, its plan, its commits, and the PR; a later session resumes by reading them, re-running `bottega:open` against the branch, and committing any finished worker output it finds. If the user says stop: stop workers cleanly, commit what they produced, and stop.
