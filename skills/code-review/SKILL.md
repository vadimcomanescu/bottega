---
name: code-review
description: Review a diff through the vendored review gate. Invoke bottega:code-review on a PR, ref range, or working diff; a run's Review phase invokes the whole method.
argument-hint: "<PR, ref range, or worktree>"
---

# Code Review

Review one diff and leave nothing blocking at its head. The engine is vendored in this package: [references/autoreview.md](references/autoreview.md) carries the whole review mechanics and the obligations on the invoking agent, and its helper lives in `scripts/`. Invoked standalone on a PR, ref range, or working diff, run that contract on the target and stop. A run's Review phase invokes the full method below, and the orchestrator keeps the verdict: verifying findings and accepting or rejecting the head stay its call.

## 1. Doc coverage

Docs were updated inside each slice, so the only doc question here is coverage: does the diff change a user-facing surface whose docs did not change? A gap is a builder dispatch before the review's base freezes; never create a doc surface the project doesn't have.

## 2. The review

Run the review per [references/autoreview.md](references/autoreview.md) on the integrated diff; that document carries the whole review method: the run's both-family panel, the blind prompt, the fix dispatch to a fresh builder, and the rerun until nothing blocking remains.

Severity gates that loop. An accepted finding that blocks (correctness, security, data safety, a broken contract) goes to the fix dispatch and the rerun; a real finding below that bar is classified follow-up and filed, which leaves the head standing and the loop where it was.

## 3. Spec conformance

When the review loop has converged, dispatch the spec-conformance check at that head: one fresh worker (model and effort per bottega:routing) reads the diff and the agreed spec and reports what is missing or partial, what nobody asked for, and what looks wrong, each finding quoting the spec line it rests on. It never sees the review's findings and nothing reranks across the two. An accepted conformance blocker goes to a fresh builder and the gates like any review finding; the reviewer then reruns at the new head, and the conformance check reruns after it.

## When a later phase catches what this gate missed

When QA or an incident catches what the review did not, the run files the lesson and lands the rule at the strongest owner the repository supports. A deterministic invariant becomes a check in the project's tooling, failing with the violated invariant and the repair; judgment that stays contextual becomes a rule in the repository's review doctrine where one exists, stating the unsafe behavior, why it matters, and the safe path, placed near the code it governs. A repository with neither home gets the rule in the followup issue instead; a gap that keeps recurring is raised there for the owner to decide its home.

A rule that lands migrates its population: the tree teaches the forbidden pattern for as long as instances remain, so the run fixes the instances in its scope and files one issue for the rest.
