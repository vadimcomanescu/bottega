---
name: land
argument-hint: "<PR number>"
description: Take an open PR through review-fix rounds to verified-mergeable, resolving every review thread, merging only when the request armed it. Use when the user names a PR to review and land, or when a delivered run picks up review feedback on the PR it opened.
---

# Land

The review method is `bottega:review`; this skill owns the GitHub surface, the stop conditions, and the merge verification. Land never decides to merge.

**Entry.** Acquire the per-PR session claim through `scripts/pr-claim` before the worktree pickup: one land or standalone PR review holds a PR at a time. A held claim means stop: report who holds it, as the stopped state in Notify. Release the claim through `scripts/pr-claim` at every terminal state and on abort (a held claim: nothing to release). Then recreate the worktree from the PR branch and write a fresh owner file, the same pickup as `skills/maestro` step 7, never the user's checkout. Discover the project's gates and run them. A red gate predates this review: fix and push it before the first round. A gate that cannot go green within the PR's stated intent ends the land session as gates-red.

**The reviewed marker.** Then read the `bottega/review` commit status to decide how much of the diff round 1 covers. It is trustworthy only when all three hold: the status is green, its creator is the GitHub identity this project's bottega sessions post statuses as, and its description names the base SHA the PR currently targets. A status failing any of the three: treat it as absent.

- Trustworthy on the live head: round 1 reviews no diff. The PR's thread work below still runs.
- Trustworthy on an earlier commit of the PR: round 1 reviews the delta, `--base` that SHA.
- Otherwise: round 1 reviews the full diff.

**Rounds.** Each round runs the review gate per `bottega:review` with its without-a-plan inputs (the PR title, body, and linked issue), over the diff the reviewed marker leaves for it.

**Fixes and threads.** Each accepted finding becomes an inline review comment on the PR at the finding's `code_location`, and its implementation fix goes to a fixer dispatched per the routing in `skills/maestro`. Unresolved review threads already on the PR when land starts, from other reviewers or bots, enter round 1 as claimed findings: verify each, then fix or refute it, reply, and resolve its thread the same way as a fresh finding. When a fix lands, reply on the thread with what changed and resolve it; when you refute a finding, reply with the refuting evidence and resolve it. Run every reply and resolution through `scripts/pr-threads`. Every fixer brief carries the three brief lines from `skills/maestro` (the safety rule, no piped test commands, name every test you edit), verbatim.

**Stop conditions.**

- Converged: a round returns no accepted findings, the gates are green, and no thread is unresolved. Convergence is the precondition to the merge verification.
- Round 3 stops the review (the `bottega:review` cap).
- The same finding open after two failed fixes stops that repair (the `bottega:review` cap).
- Two rounds of fixes without convergence: stop editing and reclassify every remaining finding before any further edit.
- A fix that would exceed the PR's stated intent is not applied: comment it on the PR and stop that finding's repair.

**Notify.** Report the terminal state in the conversation every time: verified-mergeable (verified, reported for a person to merge), merged (an armed merge ran), stopped (naming the stopping condition), or gates-red. When `BOTTEGA_NTFY_TOPIC` is set, also send it:

    curl -s -H "Title: land <PR> <state>" -d "<one-line summary>" https://ntfy.sh/$BOTTEGA_NTFY_TOPIC

**Merge.** Run the verification for every converged PR, in order, stopping on the first step that fails and reporting it:

1. Watch the PR's required checks to green: `gh pr checks <PR> --required --watch`. A project with no required checks passes this step: distinguish gh's no-required-checks exit from a failing check before calling it a failure.
2. Confirm the PR is not a draft.
3. Confirm the live head SHA equals the head SHA the final review round was frozen at.
4. Confirm the PR's target base SHA still equals the base the review was frozen at. `--match-head-commit` pins only the head, so a base that advanced after the review means the merge result was never reviewed: review the delta against the new base and start the verification again.

A PR verified through step 4 is verified-mergeable: report it for a person to merge, both SHAs in the report. Run the merge itself only when the user's request armed merging in their own words, the same waiver doctrine as the sign-off waiver in `skills/maestro`; a risk-path PR (the risk paths `bottega:review` defines) is never merged by land, whatever the request armed. An armed merge is `gh pr merge <PR> --squash --match-head-commit <reviewed-head-sha>`, which refuses the merge if the head has moved; confirm the PR state is MERGED, then delete the remote branch and remove the worktree and the run state, the same cleanup `skills/maestro` step 7 runs once a session learns the PR merged.
