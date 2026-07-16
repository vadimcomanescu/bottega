# Repository workflow

This procedure applies to every task that changes tracked files in Bottega. The
primary checkout is only for synchronizing refs and managing linked worktrees.
All implementation, documentation, test, and configuration edits happen on a
dedicated branch in an isolated linked worktree and end in a pull request.

## Start in an isolated worktree

From the primary repository directory:

```bash
git worktree list --porcelain
git fetch --prune origin
git worktree add -b <branch> .worktrees/<slug> origin/main
cd .worktrees/<slug>
npm ci
```

Use `codex/<description>` for Codex work and `claude/<description>` for Claude
Code work. For issue-backed work, include the issue number, for example
`codex/issue-57-plugin-install`.

Before creating the branch, confirm that its intended base descends from the
current `origin/main`. If the task deliberately continues an unpublished or
stacked commit, pin that exact commit as the worktree base and disclose the
dependency in the pull request.

If `git worktree list --porcelain` shows that the task is already in a linked
worktree, reuse it. Do not create another worktree from inside it. Never make a
tracked-file edit in the primary checkout, and never reuse another worktree's
`node_modules` directory.

## Use GitHub issues when they add coordination value

GitHub issues in `vadimcomanescu/bottega` are the tracker. A focused,
self-contained work item can proceed to a pull request without a backing issue.
Do not invent an issue only to satisfy a formality. When an issue exists, read
its current body, comments, assignees, and labels before creating the branch.
Every issue carries at least one ownership label from
[`triage-labels.md`](triage-labels.md).

Agents can run on multiple machines under the same GitHub account, so assignment
alone is not a lock. Claim an issue with all three signals:

1. Confirm it is open, unassigned, and does not have `agent:working`.
2. Assign yourself and add `agent:working`.
3. Add one machine-readable comment:

   ```text
   agent-claim: <agent>@<host> <UTC timestamp>
   ```

Read back the assignee, label, and claim comments after writing them. If an
earlier live claim exists, remove your assignment and activity label, then stop
or select different work. A claim older than 30 minutes is stale only when no
branch or pull request references the issue. Release `agent:working` when the
pull request merges or when the work is abandoned, and leave a short reason when
abandoning it.

Readiness labels are not activity signals. `ready-for-agent` means the issue is
specified well enough for autonomous work. `ready-for-human` means a person must
perform or decide the remaining work. Only `agent:working` means an agent claims
the issue now.

## Build, verify, and review

Keep the worktree limited to the task. Stage explicit paths when unrelated files
are present. Before pushing, run the required repository checks from the linked
worktree:

```bash
npm test
npm run typecheck
```

Changes to plugin packaging also run the plugin validator and the relevant local
installation smoke described in `README.md`. Changes to skills or agents follow
the additional writing and review rules in `AGENTS.md`. Never bypass a hook with
`--no-verify`, and never present a change as complete while a required local or
CI check is red.

Read `REVIEW.md` before reviewing a change. Resolve every actionable review
thread and keep the branch up to date with `main` before merge.

## Publish through a pull request

Every tracked-file task ends in a pull request to `main`. Direct pushes to
`main` are not part of the workflow. Push the dedicated branch with tracking and
open a draft pull request after the branch contains a coherent, tested change.

The pull request body contains only review-relevant information:

- what changed and why
- user or developer impact
- architecture or contract decisions that affect review
- exact verification performed
- focused residual risk or review areas

When a backing issue exists, include `Closes #<n>`, `Fixes #<n>`, or
`Resolves #<n>`. A bare issue reference does not close it. Repeat the closing
keyword for each resolved issue. Closing keywords take effect only when the pull
request merges into the default branch. If the pull request delivers only part
of the issue, use `Related: #<n>`, leave the issue open, release the activity
claim, and set the readiness label for the remaining owner.

The user owns the final merge. Merge only with required checks green, the branch
up to date, and all review conversations resolved.

## Clean up after merge

After the pull request merges, synchronize the primary checkout, remove the
linked worktree, delete the local task branch, prune the remote tracking ref, and
release any issue claim. Do not remove the worktree while the pull request still
needs changes.
