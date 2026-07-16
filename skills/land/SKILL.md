---
name: land
argument-hint: "<PR number>"
description: Take an open PR through review-fix rounds until it is mergeable, resolving every review thread and notifying at the end. Use when the user names a PR to review and land, or when a delivered run picks up review feedback on the PR it opened.
---

# Land

You take one open PR to a mergeable state: review it, route the fixes, resolve its review threads on GitHub, and report where it ended. The review method is `bottega:review`; this skill owns the GitHub surface, the stop conditions, and the merge decision.

**Entry.** Recreate the worktree from the PR branch and write a fresh owner file, the same pickup as `skills/run` step 8, never the user's checkout. Discover the host gates and run them. A red gate predates this review: fix and push it before the first round. A gate that cannot go green within the PR's stated intent ends the run as gates-red.

**Rounds.** Each round runs the review gate per `bottega:review` with its PR-only inputs.

**Fixes and threads.** Each accepted finding becomes an inline review comment on the PR at the finding's `code_location`, and its implementation fix goes to a fixer dispatched per the routing in `skills/run`. Unresolved review threads already on the PR when land starts, from other reviewers or bots, enter round 1 as claimed findings: verify each, then fix or refute it, reply, and resolve its thread the same way as a fresh finding. When a fix lands, reply on the thread with what changed and resolve it; when you refute a finding, reply with the refuting evidence and resolve it. Run every reply and resolution through `scripts/pr-threads`. Every fixer brief carries the three brief lines from `skills/run` (the safety rule, no piped test commands, name every test you edit), verbatim.

**Stop conditions.** Each is a terminal state or a circuit breaker; hold them together.

- Converged: a round returns no accepted findings, the gates are green, and no thread is unresolved.
- Round 3 stops the review (the `bottega:review` cap).
- The same finding open after two failed fixes stops that repair (the `bottega:review` cap).
- Two fix cycles without convergence: stop editing and reclassify every remaining finding before any further edit.
- A fix that would exceed the PR's stated intent is not applied: comment it on the PR and stop that finding's repair.

**Notify.** Report the terminal state in the conversation every time: converged, stopped (naming the stopping condition), or gates-red. When `BOTTEGA_NTFY_TOPIC` is set, also send it:

    curl -s -H "Title: land <PR> <state>" -d "<one-line summary>" https://ntfy.sh/$BOTTEGA_NTFY_TOPIC

**Merge.** Converged means mergeable; report it. Run `gh pr merge --auto` with the repository's merge method (`--squash`, `--merge`, or `--rebase`) only when the user's request armed merging in their own words, the same waiver doctrine as the sign-off waiver in `skills/run`. A risk-path PR is never auto-merged, whatever the request armed.
