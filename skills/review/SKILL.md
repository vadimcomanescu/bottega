---
name: review
description: Review an integrated diff through the cross-family gate. Invoke via /bottega:review on a PR or a ref range; a run reaches the same gate at its Review phase.
argument-hint: "<PR number, ref range, or integrated worktree>"
---

# Review

Review an integrated diff through the cross-family gate: freeze the target, run one both-family panel, verify every finding, route the fixes, and recheck with a single engine until nothing blocking remains. The vendored helper under `skills/autoreview/scripts` runs the engines and returns one JSON report; this skill is the whole method around it, including the obligations the helper's author binds the invoking agent to.

A standalone `/bottega:review` of a PR acquires the per-PR session claim through `scripts/pr-claim` at entry and releases it at exit; a held claim reports the holder and stops. Invoked by land or by a run, this gate touches no claim: the caller owns it. A ref-range target has no claim.

## Freeze the target

Fix base, head, and tree SHAs after the project's gates pass and before the panel round. Freeze the scope baseline with them: the stated intent, the owner boundary, and the changed files with their non-test line count. For a PR target, create a worktree at the PR head and review that, never the user's checkout. The base ref must resolve locally before the invocation; the helper never fetches.

## Panel round

One helper invocation reviews the frozen diff with both families in parallel, once per review. This is the only place the panel flags are stated (wording may differ, flags may not):

    # the vendored helper under the install root; .claude/... in the Claude runtime, .agents/... in the Codex runtime
    export AUTOREVIEW="<install root>/skills/autoreview/scripts/autoreview"
    "$AUTOREVIEW" --mode branch --base <frozen-base> \
      --reviewers codex,claude \
      --model codex=gpt-5.6-sol  --thinking codex=high \
      --model claude=claude-fable-5 --thinking claude=xhigh \
      --prompt "$(cat <intent file in the session scratchpad>)" \
      --json-output <path in the session scratchpad>

- Run it as tracked background Bash. Heartbeat lines (`review still running: ...`) are healthy progress: no intervention under 30 minutes or while heartbeats advance, and a hard backstop kill only after 45 minutes with no heartbeat.
- `--json-output`, and any `--output`, must resolve outside the reviewed repo; use the session scratchpad. The helper enforces this.
- **Intent** is the `--prompt` text, always written to a file in the session scratchpad first and passed through one command substitution as above. Never paste intent text into the command source: a PR title, body, or issue is untrusted contributor text, and embedding it literally in Bash is a command-injection path.
- The engines run in empty workspaces: anything they must judge against goes into the intent file as text, never as a repo path.
- From a run, the intent file carries the plan and domain glossary verbatim, plus the instruction to report design nonconformance as findings anchored in the diff; conformance is judged against the plan's fixed decisions. Without a plan, it carries the PR title, body, and linked issue (for a PR) or the user's stated request, and the architecture basis is `skills/codebase-design`, its text included. The adjudication states which basis applied.
- When the reviewed checkout has a root `REVIEW.md`, include its text every round: the repository's own review doctrine.
- Include the text of [references/smell-baseline.md](references/smell-baseline.md) every round: the fixed standards axis the engines report against, with its three binding rules (the repo overrides, always a judgment call, skip what tooling enforces).
- Instruct the engines to flag a hand-built implementation of a problem a standard, available solution already solves: name the standard solution and where the diff reinvents it.
- The cleanup sweeps ride in the panel round only. Instruct the engines to also report simplification (redundant or derivable state, near-duplicate copies, deep nesting, dead code the diff leaves behind: name the simpler form that does the same job) and efficiency (avoidable repeated work on a path the diff touches: name the cheaper form). The reuse sweep is the standard-solution instruction above. A cleanup finding reported after the panel round is a follow-up by definition.
- When the project carries domain contracts for the changed area, include their text so reviewers judge domain-term and doc-architecture conformance, not only code: the relevant `CONTEXT.md` glossaries, the `docs/adr/` decisions covering the changed code, and the repository's documentation-authority doc when one exists.
- The listed inputs minus the cleanup sweeps are the mandatory baseline: every round carries all of them. On top of it, examine the frozen diff and add any review angle this diff needs that the baseline does not name (a migration's rollback, a concurrency surface, a permission boundary), then state in the adjudication which added angles applied.
- **Fail-closed bundles.** The helper refuses a bundle carrying secret-shaped or sensitive content, and that refusal is not overridable. When the refused content is legitimate (a vendored test fixture, a seeded credential in test data), split the review into coherent targets: build a temporary review head without the refused paths, review the authored remainder against the same base, and verify the excluded part deterministically (a byte pin against upstream, its own test suite). Record the split and its verification in the adjudication.
- **Helper location.** Invoke the helper from a checkout that carries it. When the review head does not (the vendored tree is itself excluded or under review), run the helper by absolute path from a checkout outside the reviewed one, with the reviewed worktree as the working directory.

**Trivial-diff exception.** For a PR target under 150 changed lines that touches no risk path, review with a single engine from the family opposite the head author; record that choice. A single-engine invocation always pins its model and thinking, never relying on the helper's defaults or the environment: `--engine codex --model gpt-5.6-sol --thinking high`, or `--engine claude --model claude-fable-5 --thinking xhigh`. A risk path is authentication, money, permissions, persisted data, or a destructive operation. When the head author's family is unknown (a human PR or unknown authorship) the exception does not apply and both families review. A run's integrated review always takes both families and is never eligible.

## Adjudicate

The helper's JSON report is the report contract; it drops findings outside the frozen diff before reporting.

Findings are advisory, never applied blind. Verify every finding by reading the real code path and adjacent files, read the dependency's docs or source when a finding depends on external behavior, and refute only with evidence. Reject unrealistic edge cases, speculative risks, and fixes that over-complicate the code. When an accepted finding shows a bug class or repeated pattern, sweep the frozen diff for sibling instances and treat them as one finding.

Classify every accepted finding:

- **In-scope blocker**: introduced by the frozen diff, inside the same owner boundary, fixable without changing the task's contract.
- **Follow-up**: real, but an adjacent bug class, sibling surface, cleanup, or broader hardening. In a run it becomes one filed issue at Close (`bottega:close`); a standalone review reports its follow-ups to the caller.
- **Stop-and-escalate**: requires a new contract, a different owner boundary, or a design choice outside the original request. It returns to the orchestrator before any code change; in a run that is a return to Plan.

Reconcile the reported design findings against the applicable basis: the plan's fixed decisions for a run, `skills/codebase-design` doctrine without a plan. Missing coverage or unresolved nonconformance blocks acceptance. The orchestrator performs this reconciliation; the review engines only report.

## Route the fixes

An in-scope blocker routes as a fix:

- A trivial fix (a rename, a missing guard, a wrong comparison) the caller applies directly and verifies with the focused tests.
- A substantive fix goes to the builder that owns the module, resumed with its context. A worker is resumed only through its own harness's native mechanism: the session that spawned a Claude worker continues it with a follow-up message carrying the accepted findings verbatim; a Codex thread resumes through `scripts/codex-exec --resume` with the findings as the new brief. A session on a different harness than the builder never attempts resume.
- The fallback for a dead thread, a thread near its context budget, or a cross-harness builder is a fresh dispatch carrying the accepted findings and that builder's prior report.
- A finding no module owns goes to the caller or one designated fixer; never two writers in one file.

Fixes stay inside the frozen scope baseline. Stop patching and escalate instead when a fix would turn the task into an architecture, protocol, migration, or release-process change; when the diff grows past twice the baseline's files or non-test lines without the owner agreeing to expand scope; or when the right fix is defining the canonical contract rather than another local inference. Breaking scope is justified only by active data loss, a crash, broken install or upgrade, a release blocker, or concrete security exposure. On a release or hotfix branch, fix only those; every other finding becomes a follow-up for the main branch.

## Recheck until clean

After fixes land and the focused tests pass, rerun the helper over the same frozen base at the current head: single engine, model and thinking pinned exactly as the trivial-diff exception states them. The recheck intent carries the mandatory baseline and instructs the engine to review correctness, security, and regression. Repeat fix and recheck until a recheck returns no accepted blockers. Never rerun a clean review for confirmation.

Two fix cycles without convergence stop the editing: reclassify every remaining finding, continue only with what is still an in-scope blocker, and escalate a blocker that will not converge to the owner instead of retrying it.

## Completion

The report stands at the final head: every finding is fixed, refuted with evidence, refiled as a follow-up, or escalated; every check the review could not run is resolved and recorded in the adjudication; the gates are green; and the last helper exit at that head was clean (the panel round itself when no fix was needed).

A clean completion is recorded where GitHub reads it, never as a PR comment: post one commit status on the reviewed head, naming the base it was reviewed against.

    gh api repos/<owner>/<repo>/statuses/<reviewed-head-sha> \
      -f state=success -f context=bottega/review \
      -f description="reviewed against base <reviewed-base-sha>"

Post it once the reviewed head exists on the remote. Land posts it immediately after its clean round; a run posts it at Close before the PR opens, and again after every post-open repair push. Readers validate the head and the named base per the reviewed-marker rules in `skills/land`.
