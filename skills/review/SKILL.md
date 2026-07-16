---
name: review
description: Review an integrated diff through the cross-family gate. Invoke via /bottega:review on a PR or a ref range; a run reaches the same gate at its Review phase.
argument-hint: "<PR number, ref range, or integrated worktree>"
---

# Review

The cross-family review gate. It freezes the target, invokes the vendored autoreview helper as a two-family panel, adjudicates the findings, and routes every repair. Two callers reach it: a run at its Review phase, and a land taking an open PR to mergeable. The helper runs the review engines and returns one JSON report; this gate owns the frozen SHAs, the house model routing line, adjudication, the caps, and the routing of fixes. It never restates helper method: `skills/autoreview/SKILL.md` is the runtime doctrine for the invocation, verbatim, and this gate defers to it by path.

## Freeze the target

Fix base, head, and tree SHAs after the host gates pass and before the panel round, and review against them. For a PR target, create a worktree at the PR head and review that, never the user's checkout. The base ref must resolve locally before the invocation; the helper never fetches.

## Panel round

One helper invocation reviews the frozen diff with both families in parallel. This is the only place the flags are stated (wording may differ, flags may not):

    # the vendored helper under the install root; .claude/... on the Claude host, .agents/... on the Codex host
    export AUTOREVIEW="<install root>/skills/autoreview/scripts/autoreview"
    "$AUTOREVIEW" --mode branch --base <frozen-base> \
      --reviewers codex,claude \
      --model codex=gpt-5.6-sol  --thinking codex=high \
      --model claude=claude-opus-4-8 --thinking claude=xhigh \
      --prompt "<intent text + architecture-verdict instruction>" \
      --json-output <path in the session scratchpad>

- Run it as tracked background Bash. Respect the helper's heartbeat doctrine (`skills/autoreview/SKILL.md`): no intervention under 30 minutes or while heartbeats advance, and a hard backstop kill only after 45 minutes with no heartbeat.
- `--json-output`, and any `--output`, must resolve outside the reviewed repo; use the session scratchpad. The helper enforces this.
- **Intent** is the `--prompt` text. From a run: the canonical run brief and domain glossary verbatim, plus the instruction to report design nonconformance as findings anchored in the diff; conformance is judged against the brief's fixed decisions. Without a run brief: the PR title, body, and linked issue for a PR, otherwise the user's stated request, and the architecture verdict is judged against `skills/codebase-design` doctrine; the adjudication states that basis.
- **Codex-host posture.** The helper's codex engine is a bounded read-only `codex exec` in an empty workspace. It is permitted on both hosts; it is not an orchestrating Codex process.

**Trivial-diff exception.** For a PR target under 150 changed lines that touches no risk path, review with a single engine via `--engine`, from the family opposite the head author; record that choice. A risk path is authentication, money, permissions, persisted data, or a destructive operation. When the head author's family is unknown (a human PR or unknown authorship) the exception does not apply and both families review. A run's integrated review always takes both families and is never eligible.

## Adjudicate

The helper's JSON report is the report contract. Findings anchored to files the diff did not change are dropped by the helper before it reports, so expect no finding outside the frozen diff.

Verify every accepted finding against the real code path before routing a fix, and refute only with evidence. Classify each in the vendored scope governor's vocabulary (`skills/autoreview/SKILL.md`, Scope Governor): **in-scope blocker**, **follow-up**, or **stop-and-escalate**. An in-scope blocker routes as a fix to whoever owns the module: a run's builder, or a fixer the caller dispatches. A finding that requires a design change returns to the orchestrator before any code change.

Reconcile the reported design findings against the applicable basis: the brief's fixed decisions for a run, `skills/codebase-design` doctrine without a brief. Missing coverage or unresolved nonconformance blocks acceptance. Fable performs this reconciliation; the review engines only report.

## Delta rounds

Each fix is rechecked by one helper invocation, single engine, the family opposite the fixer, `--mode branch --base <last-reviewed-head>`, scoped to the open findings and the fix range. The same finding still open after two failed fixes stops the repair. Round 3 stops the review.

## Completion

The report stands at the frozen SHAs, every finding is fixed or refuted, every blocked check is resolved, and the gates are green.
