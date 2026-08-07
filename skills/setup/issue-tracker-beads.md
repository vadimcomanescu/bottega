# Issue tracker: beads (bd)

Work for this repo lives in beads. A **bead** is one tracked unit of work, and the bead graph is the record of what exists, what blocks what, and what is done. Use the `bd` CLI for every tracker operation. GitHub carries delivery only: pull requests, the merge queue, and the branch that claims a bead.

Repo-specific facts — the bead prefix, where CI files its alarms, any label conventions — belong in this file, below. Everything else is `bd`'s own behaviour: read it from `bd prime` and `bd <command> --help`, never from a copy kept here.

## Conventions

- **Create a bead**: `bd create "<title>" -d "<description>"`. Use `--body-file -` for a multi-line description from stdin, `-t bug|feature|task|epic|chore|decision` for the type, and `-p 0..4` for priority.
- **Read a bead**: `bd show <id>`. `bd comments <id>` for its conversation.
- **List work**: `bd list` for open beads, `bd ready` for open beads with no unclosed blocker — the only list an agent picks work from. `bd ready --parent=<epic-id>` narrows it to one epic's children.
- **Comment**: `bd comment <id> "..."`. Long-form design goes in the design field instead: `bd update <id> --design-file -`.
- **Dependencies**: `bd dep add <blocked> <blocker>` — the blocked bead first, the bead it waits on second. At creation time, `bd create ... --deps blocks:<id>` reads the other way round (the new bead blocks `<id>`), and `--deps discovered-from:<id>` records where a finding came from.
- **Close**: `bd close <id>`. In the normal flow nobody runs this by hand, since the merge closes the bead through the commit trailer below.

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

The branch's final commit message ends with the trailer `Closes: <bead-id>` on a line of its own.

This repo squash-merges with the branch's commit messages as the squash body, so the trailer lands in the commit on the default branch. The post-merge hook below reads it out of the merged range and runs `bd close`. The PR body never reaches the default branch, so it names the bead only for the person reading the PR — it closes nothing. Nobody closes a bead by hand.

A hand-written merge commit (a sync or an upstream merge) carries the same trailer when the work has a bead.

## Sync

Sync rides two git hooks, and nothing else syncs the graph, so there is no separate sync step to run. Neither hook ever blocks git: a missing `bd`, a missing `.beads`, or a failing `bd` warns and exits 0.

### Install the hooks

Find where this repo's hooks actually live before writing anything: `git config core.hooksPath` names the directory, and the directory is `.git/hooks` only when it names none. `bd init` sets `core.hooksPath` to `.beads/hooks` and installs its own hooks there — marked "managed by beads", dispatching `bd hooks run <name>` — so a repo initialised by `bd` already has a `post-merge` and a `pre-push` that do real work, and writing the bodies below over them silently destroys that dispatch.

So install by appending, never by overwriting. Where a hook of either name already exists — the bd-managed ones above, or any other — append the body's lines to the end of the existing file, dropping the duplicate `#!/bin/sh`, or leave the existing hook untouched and have it call a second script carrying the body. Only an absent hook is written whole. Make every hook executable. Where the hooks directory is not `.git/hooks` and this repo wants its hooks shared and version-controlled, point git at that directory once with `git config core.hooksPath <dir>`.

`post-merge` — refresh the graph, then close every bead the merged commits name. Setup fills this repo's bead prefix into the `prefix` line; copied by hand, replace `CHANGEME` before the hook runs:

```bash
#!/bin/sh
prefix="CHANGEME"   # this repo's bead prefix, e.g. "acme"
command -v bd >/dev/null 2>&1 || exit 0
[ -d .beads ] || exit 0
bd dolt pull || echo "post-merge: bd dolt pull failed" >&2
git rev-parse --verify --quiet ORIG_HEAD >/dev/null 2>&1 || exit 0
beads=$(git log ORIG_HEAD..HEAD --format=%B \
  | grep -oE "^Closes: $prefix-[a-z0-9]+([.][0-9]+)*$" \
  | awk '{print $2}' \
  | sort -u)
for id in $beads; do
  bd close "$id" --reason "merged" || echo "post-merge: bd close $id failed" >&2
done
exit 0
```

Without an `ORIG_HEAD` there is no merged range to scan, so the hook stops there and closes nothing. A `bd close` that fails warns and the loop carries on to the next bead.

`pre-push` — publish the graph:

```bash
#!/bin/sh
command -v bd >/dev/null 2>&1 || exit 0
[ -d .beads ] || exit 0
bd dolt push || echo "pre-push: bd dolt push failed" >&2
exit 0
```

## CI alarms

CI files GitHub issues when a scheduled or nightly job fails. Those issues are an alarm mailbox, not tracked work — the work graph does not contain them until a person or an agent takes one. Taking an alarm means: create the bead, put the GitHub issue URL on it (`bd create ... --external-ref <url>`), and work the bead. The delivering PR answers both, each on its own surface: `Closes #<n>` in the PR body for the GitHub issue, and the `Closes: <bead-id>` commit trailer for the bead.

_Which CI jobs file alarms, and where, is a fact of this repo: record it here._
