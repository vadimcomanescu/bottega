---
name: close
description: The closing method a run's Close phase routes to. Confirms the accepted head, publishes evidence, files followups, opens the PR written for a reader outside the run, watches its checks, and reports it ready for the owner's merge or names what only a person can clear. Not user-invocable.
user-invocable: false
---

# Close

Take the accepted head, QA-verified when QA ran, to a PR the owner can merge on sight: open, readable, its checks green, its merge state clean, its deferred work filed. The owner's merge is the release: a run never merges a PR, never enables auto-merge, and never approves one. A requirement only a person can satisfy before the PR is ready ends the run with that action named to the user. Review feedback after the PR opens is handled through `bottega:code-review`: threads are claimed findings, and its autoreview document carries the merge verification.

Run the phases in order; a followup and its evidence must exist before the PR body links them.

## Writing for a reader outside the run

Everything close writes for someone outside the run (the PR body, each followup issue) obeys one rule:

> Write for a reader who was not in the run and has not read the spec. Define every non-standard term where it is used, or link the file, ADR, or issue that defines it. Never use a label the document does not itself define. When you cite a prior decision, link its record. State what the diff cannot show; cut what the diff already shows.

## 1. Confirm the head

The head the orchestrator accepted and the head the PR will publish are one SHA, and when QA ran it is the head QA verified too. Close has changed no tracked file. A mismatch returns to the run, never patched here.

## 2. Push and mark reviewed

Push the branch and post the `bottega/review` success status on the accepted head, naming the reviewed base (the commit-status rule in [the autoreview document](../code-review/references/autoreview.md)), before the PR opens, so it arrives already carrying its reviewed marker.

## 3. Publish evidence

When QA ran, put its evidence where the PR can read it, per [references/qa-evidence.md](references/qa-evidence.md).

## 4. File followups

Each review or QA finding classified follow-up, and each item the run deferred, becomes one tracker issue in the project's repo, filed before the PR opens so the body links it. Each issue stands on its own for a reader who was not in the run: what is wrong, where, why it was deferred, and the evidence.

Filing is close's whole part here; the head is already pushed. The rule work below is the run's, done before the head freezes; what the repository has no home for arrives here as an issue. A failure the run diagnosed and fixed that a future run could repeat also gets a record in `docs/lessons/` (what happened, the rule, and where the rule is enforced), and the run puts the rule where the repository enforces it best: a deterministic invariant becomes a check in the project's tooling, failing with the violated invariant and the repair; contextual judgment becomes a rule in the repository's review doctrine near the code it governs; with neither home, the followup issue carries it, and a recurring gap is raised there for the owner to decide its home. A new rule usually has existing violations in the tree: fix the ones in the run's scope and file one issue for the rest.

## 5. Open the PR

Compose the body to a file and open it with `gh pr create -F <file>`, never inline. On an issue-born run, close the issue with the PR through a closing keyword. The body carries, written for that outside reader:

- what changed and why;
- the approved spec and the plan where they exist; a run delivered without them states the scope it ran on and the decisions it fixed in their place;
- every decision made on the user's behalf, the one most likely to draw a different answer first;
- how panel evidence changed the plan, when a panel ran;
- who built and who reviewed: models, rounds, findings, verdicts, refutations;
- the orchestrator's architecture acceptance;
- the QA evidence when QA ran, embedded or linked per the evidence reference, and its limits: the scenarios returned NOT VERIFIED and any claimed behavior no evidence covers; a run that changed nothing a user sees states that in its place.

A Followups section links the issues just filed and nothing else. Keep tool, model, and company attribution badges and footers out.

## 6. Watch and report ready

After the PR opens, watch every check to completion as tracked background Bash (`gh pr checks <PR> --watch`), excluding the `bottega/review` status you posted, your own marker, not a project check; distinguish a PR with no checks from one with a failing check. Read the merge state with it (`gh pr view <PR> --json mergeable,mergeStateStatus`) when the PR opens and again whenever the watch ends. `mergeable` returns only `MERGEABLE`, `CONFLICTING`, or `UNKNOWN`; `UNKNOWN` means GitHub has not finished computing it, so ask again rather than act on it. `mergeStateStatus` carries what `mergeable` cannot show: `CLEAN` is ready to merge, `BEHIND` is behind the base, `BLOCKED` is branch protection refusing, so read which requirement is unmet and sort it below.

Sort what the watch and the merge state return by remedy, not by cause. The first question is always whether a change to the diff can clear it:

- Run work: a code change clears it. A red check the diff can fix, a `CONFLICTING` merge state, and a `BEHIND` one all land here. Route each through the repair path maestro's QA phase defines; for `CONFLICTING` and `BEHIND` the fix is the builder merging the base branch into the run branch and resolving. Close's own part is the tail: the repaired, re-accepted, re-verified head is pushed and re-marked reviewed (phase 2), its fresh QA evidence published when QA re-ran (phase 3) and the PR body's evidence links updated to it so nothing points at the superseded head, and its checks and merge state re-watched.
- Waiting on a person: no code change clears it and someone's action does. A required human review, a label the project's rules ask a reviewer to add, any other approval. A check the diff turned red belongs here whenever only a person can clear it. Report to the user what is needed and on which PR, and leave the PR open and unmerged for them; adding the label or the approval yourself defeats a check that exists to put a person in the loop.
- Infrastructure: neither clears it, because the failure is outside the diff's control. Report it with its evidence, never guessed at.

With the checks green and the merge state `CLEAN`, report the PR ready: the PR, the head SHA phase 1 confirmed, and the evidence links. Close ends with the PR open and ready for the owner's merge, or with the PR open and the human action it waits on named to the user. The run's working state (`.bottega/run/<slug>/`, the worktree, the run branch) stands until the merge: a session that observes the merge deletes it, and `bottega:open` sweeps the state of any run whose PR has merged.
