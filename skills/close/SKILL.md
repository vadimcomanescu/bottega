---
name: close
description: The closing method a run's Close phase routes to. Confirms the accepted head, publishes evidence, files followups, opens the PR written for a reader outside the run, watches its checks, and reports it merged, ready, held, or waiting on what only a person can clear. Not user-invocable.
user-invocable: false
---

# Close

Take the accepted head to a PR a reviewer could merge the moment they open it: readable, checks green, deferred work filed.

The launch decided the release. Read the run's recorded answer, `.bottega/run/<slug>/release`, for whether the PR lands on green or holds for me. Read the project's landing procedure beside it, from the agent map where `bottega:open` settled it, since it decides how this PR is braked, armed, and landed. Never merge a PR by hand and never approve one. Arm auto-merge only where that procedure makes arming the opener's act, and let the repository's required checks and its brake decide whether an armed PR lands. Review feedback that arrives after the PR opens goes through `bottega:code-review`.

Everything you write for someone outside the run (the PR body, each followup issue) obeys one rule:

> Write simply and concisely, for a reader who was not in the run. Define every non-standard term where it is used, or link the file, record, or issue that defines it. State what the diff cannot show, and cut what the diff already shows.

## Confirm the head

The head the run accepted, the head QA verified, and the head the PR publishes are one SHA. Confirm the three are one commit before you go further. Change no tracked file yourself. Send a mismatch back to the run, never patch it here.

## Publish

Push the branch. Post the `bottega/review` success status on the accepted head, naming the reviewed base (the commit-status rule in [the review skill](../code-review/SKILL.md)). When QA ran, put its evidence where the PR can read it, per [references/qa-evidence.md](references/qa-evidence.md). Leave the head upstream carrying its marker, with its evidence reachable.

## File the followups

Turn each real finding the run deferred into one tracker issue before the PR opens. Each issue stands on its own for a reader who was not in the run: what is wrong, where, why it was deferred, and the evidence. A failure the run diagnosed and fixed that a future run could repeat gets a record in the repository's failure records, and you put the rule where the repository enforces it best. A deterministic invariant becomes a check in the project's tooling. Contextual judgment becomes a rule in the repository's review doctrine. With neither home, the followup issue carries it. A new rule usually has existing violations in the tree: fix the ones in the run's scope and file one issue for the rest. Open the PR only once every deferred item has its issue.

## Open the PR

Read the release answer from `.bottega/run/<slug>/release` itself, never from memory of it. `land` and `hold` are the only two values. If the file is missing or carries anything else, stop the run here and report it to me.

When the answer is hold, apply the brake the landing procedure names on the create call, so the PR opens already carrying it. With no procedure to name one, make `hold` exist first (`gh label create hold --description "Blocks the merge until a person removes it" || true`) and open with `--label hold`. Then confirm the repository enforces the brake on this PR in whichever shape it uses: a merge queue that refuses the PR while the label is present, named in the queue's own summary on the PR with the checks still green, a required check that is red because the label is present, or a draft PR, which the platform itself refuses to merge. When none is there, stop the run here and report it to me, because the PR would say it is held while it is still free to merge.

Compose the body to a file and open with `gh pr create -F <file>`. A run with a tracker issue, the one it started from or the one its spec opened, closes it through a closing keyword. The body tells the story plainly for that outside reader: what changed and why, every decision made on my behalf with the one most likely to draw a different answer first, who built and who reviewed with their verdicts, and the QA evidence with its limits (what returned NOT VERIFIED, what no evidence covers). A Followups section links the issues just filed and nothing else. Keep tool, model, and company attribution badges and footers out.

Then arm it with the same credentials that opened it, where the landing procedure makes arming the opener's act and where no procedure exists to say otherwise: `gh pr merge --auto --squash <PR-URL>` right after the create call. Arm on both release answers, since an armed held PR blocks on the brake enforcement you just confirmed. Where a merge queue owns the merge, opening the PR non-draft is the whole arming act: arm nothing, because an armed PR lands on green beside the queue and skips the test against the base the queue exists to run. Where the repository arms its own, arm nothing either, and say so in the report. Leave this step with the PR open, braked when held, and armed or its arming accounted for.

## Watch the checks

Watch every check to completion as tracked background Bash (`gh pr checks <PR> --watch`). Read the merge state beside it (`gh pr view <PR> --json state,mergeable,mergeStateStatus`) when the PR opens and whenever the watch ends. Skip your own `bottega/review` status. On a held PR, the enforcement you confirmed is doing its job. Leave it alone. Sort everything else by remedy:

- A code change clears it (a red check the diff can fix, `CONFLICTING`, `BEHIND`): route it back through the run's repair path, then push the repaired, re-accepted head, re-mark it, update its evidence links, and watch it again.
- Only a person clears it (a required review, a label the project's rules ask a person to add): report what is needed and on which PR, and leave the PR open and unmerged for them. Never add it yourself and never lift a held PR's brake, because both defeat a check that exists to put a person in the loop.
- Neither clears it: an infrastructure failure, reported with its evidence, never guessed at.

Report only once every check has completed and each red is routed or reported.

## Report the outcome

Name the PR, the head SHA, and the evidence links in every report. Merged (`state` is `MERGED`): report it and sweep the run's working state (the run directory, the worktree, the branch) from the project's main checkout, never from inside the worktree. Ready (checks green, merge state `CLEAN`): report it and say what lands it, taking that from the landing procedure and confirming an arm you made with `gh pr view <PR> --json autoMergeRequest` rather than guessing. A null where you armed it means the arm did not take, so re-arm, and a null where the queue owns the merge is what that procedure expects. Held: report that the PR lands when I lift its brake, which only I do. Waiting on a person: report the action needed and leave the PR open.

An open PR's working state stands until the merge. `bottega:open` sweeps the state of any run whose PR has merged.
