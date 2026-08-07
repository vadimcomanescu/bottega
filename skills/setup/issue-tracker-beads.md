# Issue tracker: beads (bd)

Work for this repo lives in beads. A **bead** is one tracked unit of work, and the bead graph is the record of what exists, what blocks what, and what is done. Use the `bd` CLI for every tracker operation. GitHub carries delivery only: pull requests, the merge queue, and the branch that claims a bead.

Repo-specific facts — the bead prefix, where CI files its alarms, any label conventions — belong in this file, below. Everything else is `bd`'s own behaviour: read it from `bd prime` and `bd <command> --help`, never from a copy kept here.

## Conventions

- **Create a bead**: `bd create "<title>" -d "<description>"`. Use `--body-file -` for a multi-line description from stdin, `-t bug|feature|task|epic|chore|decision` for the type, and `-p 0..4` for priority.
- **Read a bead**: `bd show <id>`. `bd comments <id>` for its conversation.
- **List work**: `bd list` for open beads, `bd ready` for open beads with no unclosed blocker — the only list an agent picks work from. `bd ready --parent=<epic-id>` narrows it to one epic's children.
- **Comment**: `bd comment <id> "..."`. Long-form design goes in the design field instead: `bd update <id> --design-file -`.
- **Dependencies**: `bd dep add <blocked> <blocker>` — the blocked bead first, the bead it waits on second. At creation time, `bd create ... --deps blocks:<id>` reads the other way round (the new bead blocks `<id>`), and `--deps discovered-from:<id>` records where a finding came from.
- **Close**: `bd close <id> --reason "..."`. The agent that watched the work land runs it, per "Closing a bead" below.

## Claiming a bead

The branch is the claim. `bd update --claim` is a write into the graph — two agents that read the same instant both succeed and both believe they won. Ref creation on the remote is the one operation performed atomically, so bead `<bead-id>` is claimed by exactly the agent that created its branch on origin:

```bash
git switch -c issue/<bead-id> origin/<default-branch>
git commit --allow-empty -m "claim: <bead-id>"
git push -u origin issue/<bead-id> --force-with-lease=refs/heads/issue/<bead-id>:
```

The empty commit earns its place: without it two agents branching from the same `origin/<default-branch>` push byte-identical refs and git answers the second one `Everything up-to-date` with exit 0, so both believe they won, whereas a unique SHA makes the loser's push a genuine rejection under `--force-with-lease` and the commit's committer date becomes the claim's age.

The empty expected value requires the ref not to exist, so exactly one creation wins. Rejected: another agent owns the bead — pick another, do not delete their branch, do not retry. Accepted: record the claim in the graph so a person reading it sees the same thing. The graph write is the human-visible signal, never the lock:

```bash
bd update <bead-id> --claim
```

The claim releases when the branch is deleted on merge.

A claim ref older than 24 hours with no open PR is stale: the session that took it is gone, and the bead is takeable. Take it over by deleting the stale ref first, then claiming fresh with the same create-only push, so the atomic creation still decides the owner:

```bash
git push origin --delete issue/<bead-id>
git switch -c issue/<bead-id> origin/<default-branch>
git commit --allow-empty -m "claim: <bead-id>"
git push -u origin issue/<bead-id> --force-with-lease=refs/heads/issue/<bead-id>:
bd update <bead-id> --claim
```

This is the claim for work that gets a branch. A decision ticket — a wayfinder child, planning rather than implementation — never gets one, so there `bd update <id> --claim` is the whole claim: within one database the write is atomic, and a double-claim across machines costs a wasted planning session, not a bad merge. That trade is fine for a decision ticket and never for implementation work, which has the ref.

Check the age and the PR before deleting anything (`git log -1 --format=%ci origin/issue/<bead-id>` and `gh pr list --head issue/<bead-id> --state open`). The claim commit is what makes that age measurable: it is the branch tip, so the date read out is the claim's own, where a claim carrying no commit of its own reports the base commit's date and measures the wrong thing. A ref that is younger than 24 hours, or that has an open PR, belongs to a live session: leave it alone and pick another bead. If the second push is rejected, another session took the bead over between your delete and your push — leave it to them.

## Closing a bead

The agent that watches a PR to its merge closes the bead. When the merge lands, it runs:

```bash
bd close <bead-id> --reason "PR #<n> merged"
```

A bottega run does this in its close step.

When a session ends with its PR still open, the bead stays open until the PR lands, and the session's report says so. The next run's opening step sweeps merged runs, and it closes a swept run's bead when it is still open.

The PR body names the bead for the person reading the PR, and closes nothing. No commit message and no git hook closes a bead.

## Sync

`bd init` installs bd's own git hooks and manages them from then on. Leave them exactly as bd manages them, and write no hook body of your own.

`bd init` sets `core.hooksPath` to `.beads/hooks` and installs `pre-commit`, `post-merge`, `pre-push`, `post-checkout`, and `prepare-commit-msg` there. `bd hooks list` reports the state of each one, and `bd hooks install` puts back any that are missing. Each installed file is a thin shim that runs `bd hooks run <name>`, so upgrading `bd` changes what the hooks do without rewriting them, and content outside bd's own markers survives an install. The four lifecycle hooks run bd's own housekeeping and any hook chained to them. `prepare-commit-msg` records the agent's identity on the commit for forensics. None of them closes a bead.

The graph lives in a local Dolt database. `bd dolt push` sends the local Dolt commits to the configured Dolt remote, and `bd dolt pull` brings that remote's commits into the local database. `bd dolt remote add <name> <url>` configures the remote. Without one the graph stays on the machine that wrote it, and `.beads/issues.jsonl` is an export rather than the source of truth.

`bd doctor` and `bd orphans` are bd's own health reports for a person who wants to check the graph.

## CI alarms

CI files GitHub issues when a scheduled or nightly job fails. Those issues are an alarm mailbox, not tracked work — the work graph does not contain them until a person or an agent takes one. Taking an alarm means: create the bead, put the GitHub issue URL on it (`bd create ... --external-ref <url>`), and work the bead. The delivering PR answers both, each on its own surface: `Closes #<n>` in the PR body closes the GitHub issue, and the run closes the bead when the merge lands.

_Which CI jobs file alarms, and where, is a fact of this repo: record it here._
