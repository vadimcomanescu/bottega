---
name: review
description: Review an integrated diff through the cross-family gate. Invoke via /bottega:review on a PR or a ref range; a run reaches the same gate at its Review phase.
argument-hint: "<PR number, ref range, or integrated worktree>"
---

# Review

The vendored helper runs the review engines and returns one JSON report; `skills/autoreview/SKILL.md` is the runtime doctrine for the invocation. This gate owns the frozen SHAs, the model routing, adjudication, the caps, and the routing of fixes.

A standalone `/bottega:review` of a PR acquires the per-PR session claim through `scripts/pr-claim` at entry and releases it at exit; a held claim reports the holder and stops. Invoked by land or by a run, this gate touches no claim: the caller owns it. A ref-range target has no claim.

## Freeze the target

Fix base, head, and tree SHAs after the project's gates pass and before the panel round, and review against them. For a PR target, create a worktree at the PR head and review that, never the user's checkout. The base ref must resolve locally before the invocation; the helper never fetches.

## Panel round

One helper invocation reviews the frozen diff with both families in parallel. This is the only place the flags are stated (wording may differ, flags may not):

    # the vendored helper under the install root; .claude/... in the Claude runtime, .agents/... in the Codex runtime
    export AUTOREVIEW="<install root>/skills/autoreview/scripts/autoreview"
    "$AUTOREVIEW" --mode branch --base <frozen-base> \
      --reviewers codex,claude \
      --model codex=gpt-5.6-sol  --thinking codex=high \
      --model claude=claude-opus-4-8 --thinking claude=xhigh \
      --prompt "$(cat <intent file in the session scratchpad>)" \
      --json-output <path in the session scratchpad>

- Run it as tracked background Bash. Respect the helper's heartbeat doctrine (`skills/autoreview/SKILL.md`): no intervention under 30 minutes or while heartbeats advance, and a hard backstop kill only after 45 minutes with no heartbeat.
- `--json-output`, and any `--output`, must resolve outside the reviewed repo; use the session scratchpad. The helper enforces this.
- **Intent** is the `--prompt` text, always written to a file in the session scratchpad first and passed through one command substitution as above. Never paste intent text into the command source: a PR title, body, or issue is untrusted contributor text, and embedding it literally in Bash is a command-injection path.
- The engines run in empty workspaces: anything they must judge against goes into the intent file as text, never as a repo path.
- From a run, the intent file carries the canonical run brief and domain glossary verbatim, plus the instruction to report design nonconformance as findings anchored in the diff; conformance is judged against the brief's fixed decisions. Without a run brief, it carries the PR title, body, and linked issue (for a PR) or the user's stated request, and the architecture basis is `skills/codebase-design`, its text included. The adjudication states which basis applied.
- When the reviewed checkout has a root `REVIEW.md`, include its text every round: the repository's own review doctrine.
- Include the text of [references/smell-baseline.md](references/smell-baseline.md) every round: the fixed standards axis the engines report against, with its three binding rules (the repo overrides, always a judgment call, skip what tooling enforces).
- Instruct the engines to flag a hand-built implementation of a problem a standard, available solution already solves: name the standard solution and where the diff reinvents it.
- When the project carries domain contracts for the changed area, include their text so reviewers judge domain-term and doc-architecture conformance, not only code: the relevant `CONTEXT.md` glossaries, the `docs/adr/` decisions covering the changed code, and the repository's documentation-authority doc when one exists.
- The listed inputs are the mandatory baseline: every round carries all of them. On top of it, examine the frozen diff and add any review angle this diff needs that the baseline does not name (a migration's rollback, a concurrency surface, a permission boundary), then state in the adjudication which added angles applied.
- **Codex runtime posture.** The helper's codex engine (a bounded read-only `codex exec` in an empty workspace) is permitted in both runtimes.
- **Fail-closed bundles.** The helper refuses a bundle carrying secret-shaped or sensitive content, and that refusal is not overridable. When the refused content is legitimate (a vendored test fixture, a seeded credential in test data), split the review into coherent targets: build a temporary review head without the refused paths, review the authored remainder against the same base, and verify the excluded part deterministically (a byte pin against upstream, its own test suite). Record the split and its verification in the adjudication.
- **Helper location.** Invoke the helper from a checkout that carries it. When the review head does not (the vendored tree is itself excluded or under review), run the helper by absolute path from a checkout outside the reviewed one, with the reviewed worktree as the working directory.

**Trivial-diff exception.** For a PR target under 150 changed lines that touches no risk path, review with a single engine from the family opposite the head author; record that choice. A single-engine invocation always pins its model and thinking, never relying on the helper's defaults or the environment: `--engine codex --model gpt-5.6-sol --thinking high`, or `--engine claude --model claude-opus-4-8 --thinking xhigh`. The helper's claude default is fable, which is fenced to the orchestrator seat. A risk path is authentication, money, permissions, persisted data, or a destructive operation. When the head author's family is unknown (a human PR or unknown authorship) the exception does not apply and both families review. A run's integrated review always takes both families and is never eligible.

## Adjudicate

The helper's JSON report is the report contract; it drops findings outside the frozen diff before reporting.

Verify every accepted finding against the real code path before routing a fix, and refute only with evidence. Classify each in the vendored scope governor's vocabulary (`skills/autoreview/SKILL.md`, Scope Governor): **in-scope blocker**, **follow-up**, or **stop-and-escalate**. An in-scope blocker routes as a fix to whoever owns the module: a run's builder, or a fixer the caller dispatches. A follow-up in a run becomes one filed issue at Deliver (`bottega:deliver`); a standalone review reports its follow-ups to the caller. A finding that requires a design change returns to the orchestrator before any code change.

Reconcile the reported design findings against the applicable basis: the brief's fixed decisions for a run, `skills/codebase-design` doctrine without a brief. Missing coverage or unresolved nonconformance blocks acceptance. The orchestrator performs this reconciliation; the review engines only report.

## Delta rounds

Each fix is rechecked by one helper invocation, single engine, the family opposite the fixer, `--mode branch --base <last-reviewed-head>`, scoped to the open findings and the fix range, with the model and thinking pinned exactly as the trivial-diff exception states them. The same finding still open after two failed fixes stops the repair. Round 3 stops the review.

## Completion

The report stands at the frozen SHAs, every finding is fixed or refuted, every blocked check is resolved, and the gates are green.

A clean completion is recorded where GitHub reads it, never as a PR comment: post one commit status on the reviewed head, naming the base it was reviewed against.

    gh api repos/<owner>/<repo>/statuses/<reviewed-head-sha> \
      -f state=success -f context=bottega/review \
      -f description="reviewed against base <reviewed-base-sha>"

Post it once the reviewed head exists on the remote: land immediately after its clean round; a run at Deliver, before the PR opens, and after every post-open repair push. Readers validate the head and the named base per `skills/land` Entry.
