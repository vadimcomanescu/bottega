---
name: close
description: The closing method a run's Close phase routes to. Confirms the accepted head, publishes evidence, files followups, opens the PR under the reader contract, watches its checks, and merges it green or reports what only a person can clear. Not user-invocable.
user-invocable: false
---

# Close

Take the accepted, QA-verified head to a merged PR: open, readable, its checks green, its deferred work filed, and landed on its base. A requirement only a person can satisfy ends the run instead at an open PR, with that action named to the user. Review feedback after the PR opens is handled through `bottega:code-review`: threads are claimed findings, and its autoreview document carries the merge verification.

Run the phases in order; a followup and its evidence must exist before the PR body links them.

## Reader contract

Every artifact close writes for a reader outside the run (the PR body, each followup issue) obeys one rule:

> Write for a reader who was not in the run and has not read the spec. Define every non-standard term where it is used, or link the file, ADR, or issue that defines it. Never use a label the document does not itself define. When you cite a prior decision, link its record. State what the diff cannot show; cut what the diff already shows.

## 1. Confirm the head

The head the orchestrator accepted, the head QA verified, and the head the PR will publish are one SHA, and close has changed no tracked file. A mismatch returns to the run, never patched here.

## 2. Push and mark reviewed

Push the branch and post the `bottega/review` success status on the accepted head, naming the reviewed base (the commit-status rule in [the autoreview document](../code-review/references/autoreview.md)), before the PR opens, so it arrives already carrying its reviewed marker.

## 3. Publish evidence

Put the QA evidence where the PR can read it, per [references/qa-evidence.md](references/qa-evidence.md).

## 4. File followups

Each review or QA finding classified follow-up, and each item the run deferred, becomes one tracker issue in the project's repo, filed before the PR opens so the body links it. Each issue stands on its own under the reader contract: what is wrong, where, why it was deferred, and the evidence. A failure the run diagnosed and fixed that a future run could repeat also gets a record in `docs/lessons/`: what happened, the rule, and where the rule is enforced.

## 5. Open the PR

Compose the body to a file and open it with `gh pr create -F <file>`, never inline. On an issue-born run, close the issue with the PR through a closing keyword. The body carries, under the reader contract:

- what changed and why;
- the approved spec and the plan;
- every decision made on the user's behalf;
- how panel evidence changed the plan, when a panel ran;
- who built and who reviewed: models, rounds, findings, verdicts, refutations;
- the orchestrator's architecture acceptance;
- the QA evidence, embedded or linked per the evidence reference, and its limits: the scenarios returned NOT VERIFIED and any claimed behavior no evidence covers.

A Followups section links the issues just filed and nothing else. Keep tool, model, and vendor attribution badges and footers out.

## 6. Watch and merge

After the PR opens, watch every check to completion as tracked background Bash (`gh pr checks <PR> --watch`), excluding the `bottega/review` status you posted, which is your own marker and not one of the project's checks; distinguish a PR with no checks from one with a failing check. Confirm the PR is cleanly mergeable with its base (`gh pr view <PR> --json mergeable`) when it opens and again whenever the watch ends. Sort what the watch returns into three:

- Run work: a red check the diff caused, and a `CONFLICTING` merge state. Route each through the repair path maestro's QA phase defines; a conflict's fix is the builder merging the base branch into the run branch and resolving it. Close's own part is the tail: the repaired, re-accepted, re-verified head is pushed and re-marked reviewed (phase 2), its fresh QA evidence published (phase 3) and the PR body's evidence links updated to it so nothing points at the superseded head, and its checks and mergeability re-watched.
- Infrastructure: a red check outside the diff's control is reported with its evidence, never guessed at.
- Waiting on a person: a required human review, a label the project's rules ask a reviewer to add, any other approval no code change satisfies. Report to the user what is needed and on which PR, and leave the PR open and unmerged for them. The requirement exists to put a person in the loop, so the person satisfies it; adding the label or the approval yourself defeats the check it stands for.

With the checks green and the PR mergeable, merge the head phase 1 confirmed: `gh pr merge <PR> --squash --match-head-commit <sha>`. Branch protection can refuse that merge. When the refusal is that the required checks are not up to date with the base, update the branch (`gh pr update-branch`), watch the checks again, and merge when they go green; an update the platform reports as conflicting is the `CONFLICTING` repair above. Any other refusal is reported with the refusal verbatim. Close ends with the PR merged, or open with the human action it waits on named to the user.
