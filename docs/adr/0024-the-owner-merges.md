# 0024: The owner merges

Date: 2026-07-25

Supersedes 0016. Two of its premises fell. The plan constraint is gone: the owner's GitHub plan now enforces rulesets on private repos, so the platform can hold a PR to its gates server-side. And the owner drew a line 0016 had conflated: removing human review from the pipeline (which stands; the integrated cross-family review, QA, and the project's checks remain the whole verification bar) never meant surrendering release authority. Merging to the default branch is the release, and the owner keeps it.

Close now takes the PR to ready (checks green, merge state clean, evidence linked, followups filed) and ends there. A run never merges a PR, never enables auto-merge, and never approves one; the owner merging, or arming the platform's auto-merge, is the release action. The run's working state stands until the merge and is swept by the session that observes it or by the next open in the repo. Verification is automated; authorization is a person's. This matches the platform's own boundary for its agents: a PR author cannot approve their own PR, and GitHub's coding agent is barred from marking ready, approving, or merging its own work.
