---
name: deliver
description: Closing method a run's Deliver phase routes to: confirm the accepted head, file followups, open the PR under the reader contract, watch its checks, route repairs. Not user-invocable.
user-invocable: false
---

# Deliver

The closing method a run routes to at its Deliver phase, from the head the orchestrator accepted and QA verified to a PR that is open, readable, its checks green, and its deferred work filed. Deliver changes no tracked file in the host repo, so the PR publishes the exact head review accepted and QA verified. The GitHub review surface after the PR opens is `bottega:land`, not here.

## Reader contract

Every artifact deliver writes for a reader outside the run (the PR body, each followup issue) obeys one rule:

> Write for a reader who was not in the run and has not read the spec. Define every non-standard term where it is used, or link the file, ADR, or issue that defines it. Never use a label the document does not itself define. When you cite a prior decision, link its record. State what the diff cannot show; cut what the diff already shows.

## Deliver

Run these in order; a followup and its evidence must exist before the PR body links them.

1. **Confirm the head.** The head the orchestrator accepted, the head QA verified, and the head the PR will publish are one SHA, and deliver has changed no tracked file. A mismatch returns to the run, never patched here.

2. **Push and mark reviewed.** Push the branch and post the `bottega/review` success status on the accepted head, naming the reviewed base (the Completion rule in [`bottega:review`](../review/SKILL.md)), before the PR opens, so it arrives already carrying its reviewed marker.

3. **Publish evidence.** Put the QA evidence where the PR can read it, per [references/qa-evidence.md](references/qa-evidence.md).

4. **File followups.** Each review or QA finding classified follow-up, and each item the run deferred, becomes one tracker issue in the host repo, filed before the PR opens so the body links it. Each issue stands on its own under the reader contract: what is wrong, where, why it was deferred, and the evidence.

5. **Open the PR.** Compose the body to a file and open it with `gh pr create -F <file>`, never inline. On an issue-born run, close the issue with the PR through a closing keyword. The body carries, under the reader contract:
   - what changed and why;
   - the approved spec and the architecture brief;
   - every decision made on the user's behalf;
   - how panel evidence changed the plan, when a panel ran;
   - who built and who reviewed: models, rounds, findings, verdicts, refutations;
   - the orchestrator's architecture acceptance;
   - the QA evidence inline.

   A Followups section links the issues just filed and nothing else. Keep tool, model, and vendor attribution badges and footers out.

6. **Watch the checks.** After the PR opens, watch every check to completion as tracked background Bash (`gh pr checks <PR> --watch`), excluding the `bottega/review` status you posted, which is your own marker and not a host check. Distinguish a PR with no checks from one with a failing check. A red check the diff caused reopens the run at the repair path a QA implementation failure takes (`bottega:run` Build and Review phases): the owning builder fixes it, gates run, a single-engine delta review from the opposite family and the orchestrator's acceptance clear it, then the repaired head is pushed, re-marked reviewed (step 2), and its checks re-watched. A red check outside the diff's control (infrastructure) is reported with its evidence, never guessed at. That repair runs in those phases, never as edits here.
