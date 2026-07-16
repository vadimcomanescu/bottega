---
name: land
argument-hint: "<PR number>"
description: Take an open PR through review-fix rounds to merged, resolving every review thread and merging or reporting where it ended. Use when the user names a PR to review and land, or when a delivered run picks up review feedback on the PR it opened.
---

# Land

You take one open PR to MERGED: review it, route the fixes, resolve its review threads on GitHub, then merge it or report where it stopped. The review method is `bottega:review`; this skill owns the GitHub surface, the stop conditions, and the terminal merge. Invoking land is the merge authorization: a converged PR merges without any further OK. The one exception is a risk-path PR, which stops at converged-mergeable and reports instead of merging.

**Entry.** Recreate the worktree from the PR branch and write a fresh owner file, the same pickup as `skills/run` step 8, never the user's checkout. Discover the host gates and run them. A red gate predates this review: fix and push it before the first round. A gate that cannot go green within the PR's stated intent ends the run as gates-red.

**Rounds.** Each round runs the review gate per `bottega:review` with its PR-only inputs.

**Fixes and threads.** Each accepted finding becomes an inline review comment on the PR at the finding's `code_location`, and its implementation fix goes to a fixer dispatched per the routing in `skills/run`. Unresolved review threads already on the PR when land starts, from other reviewers or bots, enter round 1 as claimed findings: verify each, then fix or refute it, reply, and resolve its thread the same way as a fresh finding. When a fix lands, reply on the thread with what changed and resolve it; when you refute a finding, reply with the refuting evidence and resolve it. Run every reply and resolution through `scripts/pr-threads`. Every fixer brief carries the three brief lines from `skills/run` (the safety rule, no piped test commands, name every test you edit), verbatim.

**Stop conditions.** Each is a terminal state or a circuit breaker; hold them together.

- Converged: a round returns no accepted findings, the gates are green, and no thread is unresolved. Convergence is the precondition to merge.
- Round 3 stops the review (the `bottega:review` cap).
- The same finding open after two failed fixes stops that repair (the `bottega:review` cap).
- Two fix cycles without convergence: stop editing and reclassify every remaining finding before any further edit.
- A fix that would exceed the PR's stated intent is not applied: comment it on the PR and stop that finding's repair.

**Notify.** Report the terminal state in the conversation every time: merged, converged-mergeable (a risk-path PR, reported not merged), stopped (naming the stopping condition), or gates-red. When `BOTTEGA_NTFY_TOPIC` is set, also send it:

    curl -s -H "Title: land <PR> <state>" -d "<one-line summary>" https://ntfy.sh/$BOTTEGA_NTFY_TOPIC

**Merge.** A risk path is authentication, money, permissions, persisted data, or destructive operations. A risk-path PR stops at converged-mergeable and reports for a person to merge; every other converged PR you merge yourself. Run the terminal sequence in order and stop on the first step that fails, reporting it:

1. Watch the PR's required checks to green: `gh pr checks <PR> --required --watch`.
2. Confirm the PR is not a draft.
3. Confirm the live head SHA equals the head SHA the final review round was frozen at.
4. `gh pr merge <PR> --squash --match-head-commit <reviewed-head-sha>`, which refuses the merge if the head has moved.
5. Confirm the PR state is MERGED.
6. Delete the PR's remote branch, then remove the worktree, the run state, and the evidence branches, as `skills/run` step 8 does once a session learns the PR merged.
