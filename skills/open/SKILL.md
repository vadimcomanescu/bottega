---
name: open
description: The opening method a run's Launch phase invokes whole. Settle ownership, isolate the run in a worktree and branch, write the owner file and the release answer, read the project's commands from the agent map, and confirm the codex CLI is logged in. Not user-invocable.
user-invocable: false
---

# Open

Prepare the run before any dispatch: owned, isolated, commands in hand, the codex CLI checked. Discovery and every later phase work inside what you open here.

## 1. Settle ownership

When the request names a tracker issue, read its assignee. If it is assigned to an account other than the one you operate as, stop and report that. Otherwise assign it to your own account. The PR that delivers the issue closes it. An issue-driven run embeds the issue number in its slug, so one issue maps to one branch, and an existing branch for the work means it is already claimed: stop and report. Name the slug for the work as the request states it, since discovery has not run yet. Continue an existing run only when I point you at its branch. You are through this step once the work is yours, or the run has stopped with the reason given.

## 2. Isolate

First sweep finished work. A `.bottega/run/` entry or worktree whose PR has merged is done, so delete its run directory, worktree, and branches, local and remote. Then work from inside a worktree on branch `bottega/<slug>`. Create it and enter it through the harness's worktree tool when it has one (create one, or enter by path one already made), otherwise change directory into it. Every command for the rest of the run runs from inside the worktree, so my checkout stays untouched and the run's changes reach main only through the PR. Continuing an existing run, recreate the worktree from its branch. Creating a new branch, push it upstream immediately as a create-only update:

```
git push -u origin bottega/<slug> --force-with-lease=refs/heads/bottega/<slug>:
```

The empty expected value means the remote ref must not exist, so exactly one creation wins. A rejected push means another session owns the branch: stop and report. You are through this step once your working directory is the worktree and its branch is upstream.

## 3. Write the owner file

Write your session id to `.bottega/run/<slug>/owner` before the run's first dispatch. The route guard polices the session named there. Write the release answer the launch settled, `land` or `hold`, to `.bottega/run/<slug>/release`, which close reads before the PR opens. Resuming in a later session, rewrite the owner file before dispatching anything, and write the release file when the run predates it, asking me when no answer was ever settled. Both files are set once the owner file names this session and the release file carries the run's answer.

## 4. Read the commands

Read the project's commands (format, lint, typecheck, test, build, run) from the repo's agent map, `AGENTS.md` or `CLAUDE.md`, where setup keeps one a symlink of the other so Claude Code and the codex CLI read the one copy. The map is the commands' one home: a brief quotes them from it, and never defines them elsewhere. A command missing or broken there is discovered once and written back to the map as part of the run's diff, and the same rule covers any operating fact a worker had to dig for: how the app boots from a worktree, seed data, migration steps. Read every command the run will brief from the map before you move on.

## 5. Confirm the codex CLI

Confirm the codex CLI is installed and logged in with `codex login status`, since the run's codex reads go through it. Missing, logged out, or over quota: tell me now and continue, with fresh Claude workers taking those reads and the run recording the gap. You are through this step once the CLI works, or I know what is wrong with it.
