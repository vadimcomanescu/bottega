---
name: open
description: The opening method a run's Open phase invokes whole. Settle ownership, isolate the run in a worktree and branch, write the owner file, read the project's commands from the agent map, and confirm worker reach. Not user-invocable.
user-invocable: false
---

# Open

Prepare the run before any spec work: owned, isolated, commands in hand, workers reachable.

## 1. Settle ownership

For a tracker issue, read its assignee. Assigned to an account other than the one this session operates as: stop and report. Otherwise assign it to this session's account; the PR that delivers the issue closes it. An issue-driven run embeds the issue number in its slug, so one issue maps to one branch, and an existing branch for the work means it is claimed: stop and report. Continue an existing run only when pointed at its branch. Complete when the work is yours or the run has stopped with the reason.

## 2. Isolate

Work from inside a worktree on branch `bottega/<slug>`: create it, then make it your working directory for the rest of the run, through the harness's worktree tool when it has one, otherwise by changing directory. The user's checkout stays untouched, and the run's changes reach main only through the PR. Continuing an existing run, recreate the worktree from its branch. Creating a new branch, push it upstream immediately as a create-only update: `git push -u origin bottega/<slug> --force-with-lease=refs/heads/bottega/<slug>:` (the empty expected value means the remote ref must not exist, and the remote serializes ref updates, so exactly one creation wins). A rejected push means another session owns the branch: stop and report. Complete when your working directory is the worktree and its branch is upstream.

## 3. Write the owner file

Write your session id to `.bottega/run/<slug>/owner`; the route guard polices the session named there. Resuming in a later session, rewrite it before dispatching anything. Complete when the owner file names this session.

## 4. Read the commands

Read the project's commands (format, lint, typecheck, test, build, run) from the repo's agent map (`AGENTS.md` or `CLAUDE.md`; setup keeps one a symlink of the other so both harnesses load the one copy). The map is the commands' one home: a brief quotes them from it, never defines them elsewhere. A command missing or broken there is discovered once and written back to the map as part of the run's diff, and the same rule covers any operating fact a worker had to dig for: how the app boots from a worktree, seed data, migration steps. Complete when every command the run will brief is read from the map.

## 5. Confirm worker reach

Confirm the worker families the run will need are reachable before the first dispatch (for codex workers, `codex login status`). Missing, logged out, or over quota: tell the user now. Complete when every family the run needs is reachable or the user knows which is not.
