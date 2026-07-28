---
name: close
description: The closing method a run's Close phase routes to. Confirms the accepted head, publishes evidence, files followups, opens the PR written for a reader outside the run, watches its checks, and reports it merged, ready, held, or waiting on what only a person can clear. Not user-invocable.
user-invocable: false
---

# Close

Take the accepted head to a PR a reviewer could merge the moment they open it: readable, checks green, deferred work filed. The launch decided the release: the run's recorded answer, `.bottega/run/<slug>/release`, says whether the PR lands on green or holds for the user. A run never merges a PR by hand and never approves one; it arms auto-merge on the PR it opens where the repository's own merging procedure makes arming the opener's act, and the repository's required checks and the `hold` label decide whether an armed PR lands. Review feedback after the PR opens is handled through `bottega:code-review`.

Everything close writes for someone outside the run (the PR body, each followup issue) obeys one rule:

> Write simply and concisely, for a reader who was not in the run. Define every non-standard term where it is used, or link the file, record, or issue that defines it. State what the diff cannot show; cut what the diff already shows.

## 1. Confirm the head

The head the run accepted, the head QA verified, and the head the PR publishes are one SHA, and close changes no tracked file. A mismatch returns to the run, never patched here. Complete when the three are one commit.

## 2. Publish

Push the branch and post the `bottega/review` success status on the accepted head, naming the reviewed base (the commit-status rule in [the autoreview document](../code-review/references/autoreview.md)). When QA ran, put its evidence where the PR can read it, per [references/qa-evidence.md](references/qa-evidence.md). Complete when the head is upstream carrying its marker and its evidence is reachable.

## 3. File followups

Each real finding the run deferred becomes one tracker issue before the PR opens, standing on its own for a reader who was not in the run: what is wrong, where, why it was deferred, and the evidence. A failure the run diagnosed and fixed that a future run could repeat gets a record in the repository's failure records, and the run puts the rule where the repository enforces it best: a deterministic invariant becomes a check in the project's tooling; contextual judgment becomes a rule in the repository's review doctrine; with neither home, the followup issue carries it. A new rule usually has existing violations in the tree: fix the ones in the run's scope and file one issue for the rest. Complete when every deferred item has its issue.

## 4. Open the PR

Read the release answer from `.bottega/run/<slug>/release` itself, never from memory of it: `land` and `hold` are the only two values, and a file missing or carrying anything else stops the run here, reported to the user. When the answer is hold, make the label exist first (`gh label create hold --description "Blocks the merge until a person removes it" || true`), add `--label hold` on the same create call so the PR opens carrying it, and confirm the base branch has a required check that is red on this PR because the label is present; a repository where nothing enforces the label stops the run here, reported, because the PR would report held while free to land.

Compose the body to a file and open with `gh pr create -F <file>`; an issue-born run closes its issue through a closing keyword. The body tells the story plainly for that outside reader: what changed and why, every decision made on the user's behalf with the one most likely to draw a different answer first, who built and who reviewed with their verdicts, and the QA evidence with its limits (what returned NOT VERIFIED, what no evidence covers). A Followups section links the issues just filed and nothing else. Keep tool, model, and company attribution badges and footers out.

Then arm it with the same credentials that opened it, where the repository's own merging procedure makes arming the opener's act: `gh pr merge --auto --squash <PR-URL>` right after the create call, on both release answers, since an armed held PR blocks on the hold check just confirmed. Where the repository arms its own, arm nothing and say so in the report. Complete when the PR is open, labeled when held, and armed or its arming accounted for.

## 5. Watch the checks

Watch every check to completion as tracked background Bash (`gh pr checks <PR> --watch`), and read the merge state beside it (`gh pr view <PR> --json state,mergeable,mergeStateStatus`) when the PR opens and whenever the watch ends. Skip your own `bottega/review` status, and on a held PR the red required check whose failure names the `hold` label is the brake working, never a failure to repair. Sort everything else by remedy:

- A code change clears it (a red check the diff can fix, `CONFLICTING`, `BEHIND`): route it back through the run's repair path; the repaired, re-accepted head is pushed, re-marked, its evidence links updated, and re-watched.
- Only a person clears it (a required review, a label the project's rules ask a person to add): report what is needed and on which PR, and leave the PR open and unmerged for them; adding it yourself defeats a check that exists to put a person in the loop, and removing a `hold` label is the same act in reverse.
- Neither clears it: an infrastructure failure, reported with its evidence, never guessed at.

Complete when every check has completed and each red is routed or reported.

## 6. Report the outcome

Every report names the PR, the head SHA, and the evidence links. Merged (`state` is `MERGED`): report it and sweep the run's working state (the run directory, the worktree, the branch) from the project's main checkout, never from inside the worktree. Ready (checks green, merge state `CLEAN`): report it and say what lands it, read from `gh pr view <PR> --json autoMergeRequest` rather than guessed; a null where phase 4 armed means the arm did not take, so re-arm. Held: report that the user removing the `hold` label is what lands it; the user lands a held PR, never the run. Waiting on a person: report the action needed and leave the PR open.

An open PR's working state stands until the merge; `bottega:open` sweeps the state of any run whose PR has merged.
