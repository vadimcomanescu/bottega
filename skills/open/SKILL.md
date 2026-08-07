---
name: open
description: The opening method a run's Launch phase invokes whole. Settle ownership, isolate the run in a worktree and branch, write the owner file and the release answer, read the project's commands and landing procedure from the agent map, and confirm the codex CLI is logged in. Not user-invocable.
user-invocable: false
---

# Open

Prepare the run before any dispatch: owned, isolated, commands in hand, the codex CLI checked. Discovery and every later phase work inside what you open here.

## 1. Settle ownership

Read the repo's issue-tracker doc from its agent map before you claim anything: it names the bead prefix, where CI files its alarms, and any repo-specific convention. Every run is owned by one bead. A run started from a bead uses that bead. A run started from my message creates it first, `bd create`, titled and described from the request's own words, so the claim has an id. A run started from a CI alarm issue creates the bead too, carrying the GitHub issue URL as its external reference, `bd create "<title>" --body-file - --external-ref <issue-url>`, so the bead points back at the alarm it answers.

The claim is the create-only push of `issue/<bead-id>` on origin, since ref creation is the one atomic operation and a graph write is not. Reserve it from the isolated worktree in the next step, and use `issue/<bead-id>` as the run branch. A rejected push means another session owns the bead: stop and report, pick nothing else on my behalf. Once the ref wins, record it in the graph with `bd update <bead-id> --claim` — the human-visible signal, never the lock.

An existing `issue/<bead-id>` branch means the bead is already claimed, unless it is stale: older than 24 hours with no open PR, read from the ref itself (`git log -1 --format=%ci origin/issue/<bead-id>` and `gh pr list --head issue/<bead-id> --state open`). A stale claim is dead and the bead is takeable, and taking it over means deleting the stale ref first, `git push origin --delete issue/<bead-id>`, then claiming fresh with the create-only push below, so the atomic creation still decides the owner. A rejected push after the delete means another session took the bead over in between: leave it to them. Never delete a ref that is younger than that or that has an open PR. Continue an existing run only when I point you at its branch. Name the slug from the bead id and the request's own words, since discovery has not run yet. You are through this step once the bead, its claim, and the run branch are settled, or you have stopped the run and reported why.

## 2. Isolate

First sweep finished work. A `.bottega/run/` entry or worktree whose PR has merged is done, so delete its run directory, worktree, and branches, local and remote. Then work from inside a worktree on the run's claimed branch, `issue/<bead-id>`. When the harness has a worktree tool, create the worktree and enter it through that tool (create one, or enter by path one already made), otherwise change directory into it. Every command for the rest of the run runs from inside the worktree, so my checkout stays untouched and the run's changes reach main only through the PR. Continuing an existing run, recreate the worktree from its branch, and claim nothing again. On a new run, push the branch upstream immediately as a create-only update — this push is the claim:

```
git commit --allow-empty -m "claim: <bead-id>"
git push -u origin issue/<bead-id> --force-with-lease=refs/heads/issue/<bead-id>:
```

The empty commit earns its place: without it two sessions branching from the same default-branch tip push byte-identical refs and git answers the second one `Everything up-to-date` with exit 0, so both believe they won, whereas a unique SHA makes the loser's push a genuine rejection under `--force-with-lease` and the commit's committer date becomes the claim's age.

The empty expected value means the remote ref must not exist, so exactly one creation wins. A rejected push means another session owns the bead: stop and report. After the push wins, run `bd update <bead-id> --claim` so the graph shows what the ref already decided. You are through this step once your working directory is the worktree, its branch is upstream, and the bead records the claim.

## 3. Write the owner file

Write your session id to `.bottega/run/<slug>/owner` before the run's first dispatch. The route guard polices the session named there. Write the release answer the launch settled, `land` or `hold`, to `.bottega/run/<slug>/release`. Close reads that file before the PR opens. Resuming in a later session, rewrite the owner file before dispatching anything. Write the release file too when the run predates it, and ask me when no answer was ever settled. Both files are set once the owner file names this session and the release file carries the run's answer.

## 4. Read the commands and the landing procedure

Read the project's commands (format, lint, typecheck, test, single-test run, build, run) from the project's agent map, `AGENTS.md` or `CLAUDE.md`. When both exist independently, use the one the repository declares canonical. When no map or command owner exists, discover the commands from the repository, verify them, and add the missing owner or route to the run's diff. The map is the commands' one home: a brief quotes them from it, and never defines them elsewhere. Discover a missing or broken command once, and write it back to the map as part of the run's diff. The same rule covers any operating fact a worker had to dig for: how the app boots from a worktree, seed data, migration steps.

The landing procedure is one of those facts and close delivers the run under it, so read it from the same map: the brake that holds a PR out of the merge and whether the repository's own machinery enforces it, what arms a PR to land (the opener arms it, a merge queue takes every non-draft PR, or nothing does), and which check decides the merge. Missing from the map, it is discovered once from the repository's own documented procedure and written back like any command. Where the repository documents none, tell me and leave close on its fallback. Continue once every command the run will brief is verified, the landing procedure is read or reported absent, and each has one proposed or existing home.

## 5. Confirm the codex CLI

Confirm the codex CLI is installed and logged in with `codex login status`, since the run's codex reads go through it. Missing, logged out, or over quota: tell me now and continue. You are through this step once the CLI works, or I know what is wrong with it.
