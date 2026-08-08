---
name: play
description: Work an epic's beads as one worker session under a maestro, announcing itself, taking the assignment, claiming the bead, building, landing, and reporting back. Use play to join a maestro's lanes, in an interactive session or with -p. Never use proactively.
argument-hint: "<the maestro session name, when you know it>"
---

# Play

Join a maestro's lanes as one worker: take the bead it assigns, claim it, land it, and report back.

## Announce yourself

Take the maestro's session name from your invocation when it carries one, otherwise find it with ListAgents. Send it `READY <your session name> account <n>` with SendMessage, and wait. That line is how you ask for work, at the start and after every bead you finish.

Your account number is the last part of `CLAUDE_CONFIG_DIR` when the variable is set, so `~/.claude-accounts/3` makes you account 3, and an unset variable makes you account 1. Read it once at the start and carry it in every `READY` line, because the maestro maps you to a usage pool by that number.

## Take one assignment

An assignment arrives as `ASSIGN <bead-id>: <one-line context>`. Hold one at a time, so a second assignment waits until the one in your hands is reported.

## Claim before you work

The claim is the create-only push of `issue/<bead-id>` on origin, and it happens before you read a line of product code:

```
git commit --allow-empty -m "claim: <bead-id>"
git push -u origin issue/<bead-id> --force-with-lease=refs/heads/issue/<bead-id>:
```

Exactly one session wins that push. A rejected push means another session already owns the bead, so report `BLOCKED <bead-id> claimed by another session` and ask for the next one. After the push wins, record it in the graph, `bd update <bead-id> --claim`.

## Pick the weight

Weigh what the bead asks for, and take the lighter path whenever it honestly fits:

- A bead that needs discovery, several vertical slices, or QA on a product surface goes through `artigiano`. Hand it the bead id and the branch you already claimed, so it opens on that branch and claims nothing again.
- A small bead you implement yourself under `implement`, then review your own diff through `autoreview` and fix what you accept from it.

## Work in your own worktree

Work from a worktree on `issue/<bead-id>`, so the files you change move under no other lane. Stay inside the files your assignment names. Where the work needs a file another lane owns, file that part as its own bead and report it, and keep your diff inside your lane.

## Land it

Land under the project's landing procedure, read from its agent map, and route the close through `close`, which reads that procedure and delivers the PR under it.

## Report back

Send one line to the maestro the moment the bead leaves your hands:

- `LANDED <bead-id> <pr url or commit sha>` once the PR is open and delivered, or the commit is on the branch.
- `BLOCKED <bead-id> <reason>` when something outside your lane holds the work.
- `FILED <new-bead-id> <why>` for each bead you created and left for someone else, filed with `bd create` first so the id is real.

Then send `READY <your session name> account <n>` again and wait for the next assignment.
