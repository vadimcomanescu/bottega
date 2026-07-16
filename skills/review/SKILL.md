---
name: review
description: Review an integrated diff through the cross-family gate. Invoke via /bottega:review in Claude Code or $bottega:review in Codex; a run reaches the same gate at its Review phase.
argument-hint: "<PR number, ref range, or integrated worktree>"
---

# Review

The cross-family review gate. One reviewer from each model family reads the frozen target independently, and the invoking orchestrator adjudicates their findings, routes every repair, and accepts or rejects the head. Two callers reach it: a run at its Review phase, and a land taking an open PR to mergeable. The orchestrator makes every judgment call; the reviewers only report.

## Freeze the target

Fix the target as base, head, and tree SHAs after the host gates pass and before round 1, and dispatch every reviewer against them. For a PR target, create a worktree at the PR head and review that, never the user's checkout.

## Intent input

The intent a reviewer judges conformance against depends on the caller. This is a contract:

- **Run brief present** (invoked from a run): reviewers receive the canonical run brief and domain glossary verbatim. Conformance is judged against the brief's fixed decisions.
- **No frozen brief** (invoked without a run): the intent is the PR title, body, and linked issue when the target is a PR, otherwise the user's request as stated in the conversation. Conformance is judged against that self-reported intent, and the adjudication states that basis. The architecture verdict is doctrine-only: judged against `skills/codebase-design` with no fixed per-run decisions to check. Reports stay at schema_version 2; each reviewer states the doctrine-only basis in `architecture.evidence`.

## Round 1

One reviewer from each model family, in parallel, each blind: no builder reasoning, and not the other reviewer's report. Each report carries an independent architecture verdict. Each reviewer brief carries the diff, the intent input for its tier, the domain glossary when the host has one, the changed-test justifications, the frozen SHAs, and an evidence directory. Load [the host transport reference](../run/references/host-transports.md) and use the active host's two review routes against `skills/reviewing/references/report.schema.json`. Reject any report whose target SHAs, round, or reviewer identity differ from the dispatch.

**Trivial-diff exception.** The exception applies to a PR target only; a run's integrated review always takes both families and is never eligible. For a PR target under 150 changed lines that touches no risk path, a single reviewer may review, from the family opposite the head's author; record that choice. A risk path is any path `skills/reviewing` requires the strongest probes for. When the head author's model family is unknown (a human PR or unknown authorship), the exception does not apply and both families review.

## Adjudication

The orchestrator verifies every finding against the real code path before accepting it, and refutes only with evidence. Reconcile both architecture verdicts against the applicable basis (the brief's fixed decisions for a run, `skills/codebase-design` doctrine when there is no frozen brief); missing coverage or unresolved disagreement blocks acceptance. An implementation fix routes to whoever owns the module: a run's builder, or a fixer the caller dispatches. A design finding returns to the orchestrator before any code change.

## Delta rounds

Each fix is rechecked by a fresh reviewer from the family opposite the fixer, scoped to the check IDs and the fix range. The same finding still open after two failed fixes stops the repair. Round 3 stops the review.

## Completion

Reports stand at their stated SHAs, every finding is fixed or refuted, every blocked check is resolved, and the gates are green.
