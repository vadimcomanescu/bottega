# 0046: Beads is the tracker, hardcoded

Date: 2026-08-07

Supersedes 0045 and amends 0041 and 0044.

Decision. The tracker is beads (`bd`) in every bottega-managed repository, and it is not configurable. Setup is bottega's own skill again, forked from the vendored one it replaced: it checks that `bd` works here and that bd's own git hooks are installed, settles the triage label vocabulary and the domain doc layout, and writes one tracker template, `issue-tracker-beads.md`. The GitHub and local-file tracker templates are deleted, so no repository can be configured onto a tracker the run skills cannot read.

Work lives in the bead graph and GitHub carries delivery alone: the pull request, the merge, and the branch that claims a bead. A run is owned by one bead. The claim is still the create-only push of `issue/<bead-id>` on origin, since ref creation is the one atomic operation, with `bd update --claim` as the human-visible signal, and a stale claim is taken over by deleting the ref and claiming fresh. GitHub issues stay an inbound mailbox: CI alarms and external pull requests, which triage turns into beads.

Beads close by agents, never by git machinery. The run's close step watches the PR to the merge, and when the merge lands it runs `bd close <bead-id> --reason "PR #<n> merged"`. When the session ends with the PR still open, the close report says the bead stays open until the PR lands. The next run's opening step, which already sweeps merged runs and deletes their worktrees and branches, also closes a swept run's bead when it is still open. bd's own git hooks, which `bd init` installs itself, are left exactly as bd manages them, and bottega writes no hook body.

The spec and the plan move with the tracker. The spec is written into the run bead's design field, `bd update <id> --design-file -`, so the bead's body stays the request and its design holds what discovery settled. The plan is one comment on the same bead. Neither is a tracker-issue comment any more, and neither is a file in the repository.

Why. 0045 adopted the vendored setup skill with its pluggable tracker, and the run skills that read and write work were written against a tracker they could not name: each one had to work for GitHub issues, for beads, and for a local file at once, so the claim, the close, and the spec's home each had a branch per tracker and no branch was fully true anywhere. Beads is what the repositories actually use, and pluggability bought configuration surface instead of capability. Hardcoding it lets every skill say one thing: one create command, one claim, one close, one place the spec lives.

The close mechanic was rewritten against what the tools actually do. The earlier reading had the PR body close the bead, on the belief that `bd orphans --fix` scans merged commit messages. It does not. Verified against bd 1.1.2, `bd orphans` is a report a person runs, listing issues that commit messages reference and that are still open, with `--fix` closing them behind a confirmation prompt. Nothing runs at merge time, and the PR body never reaches the default branch. The agent watching the PR is the one party that learns of the merge as it happens, so the close is its act.

Trade-off. Bottega now requires `bd` on the machine and a bead database in the repository: a repository without them cannot run bottega until setup is run, where the old pluggable setup would have given it a degraded tracker. That is the intended trade — a degraded tracker produced runs whose record nothing could read. The close now depends on a live agent. A PR that merges after its session ended leaves its bead open until the next run's opening sweep closes it, and a person can always read that drift with bd's own reports, `bd doctor` and `bd orphans`.
