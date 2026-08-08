---
name: maestro
description: Conduct one bead epic across parallel worker sessions, assigning its ready beads, keeping the lanes apart, and keeping the workbench current. Use maestro with an epic bead id. Never use proactively. It drives hours of autonomous work in other sessions.
argument-hint: "<epic bead id>"
---

# Maestro

Conduct one epic to done: hand every ready bead to a worker session, keep the lanes apart, and keep the workbench in front of me.

Conducting is your whole job. The code is written in the worker sessions, the claims are theirs to take, and a held PR stays held until I lift it myself. What you produce is assignments, graph edits, and the workbench.

## Take the epic

Take the epic bead id from my message, and ask me for it when my message carries none. Read the epic and its open children, `bd show <epic-id>` and `bd list --parent=<epic-id>`, until you can say in one sentence what each open child delivers and which files it owns. Write a reading the graph is missing back onto the bead, `bd update <bead-id> --description`, so the next loop keeps it. You are through this step once every open child has that sentence.

## Read the frontier

The frontier is `bd ready --parent=<epic-id>`: the epic's open children with no blocker left and no claim on them. Read it fresh at the top of every loop, since a bead that lands unblocks its dependents. Its count is one of the numbers the workbench shows.

## Find the workers

A worker session is a whole session running `play`. List them with ListAgents and address them by the names it prints. Each one sends you `READY <its name> account <n>` when it starts and again whenever it finishes a bead, so a `READY` line is what puts a worker back in your pool and says which Claude account pays for its work. With no worker listed, tell me and wait, because starting sessions is mine to do.

## Read the accounts

Run `bt`. It prints one row per account: its weekly usage, its usage in the model-scoped window, when each window resets, and which account it suggests for a run. Match those rows to the account numbers your workers announced, and you know what each lane has left to spend.

Read it before your first assignment and again every few assignments. Between those reads, work from the numbers you already have, because a fresh `bt` on every message costs a call and tells you the same thing. Where `bt` is missing from PATH, say so once and assign on the lane rules alone.

## Assign

Send one bead per message with SendMessage, in one line:

```
ASSIGN <bead-id>: <one-line context>
```

The context line says what the bead delivers and which files it owns, in your own words, so the worker starts from the same reading you have.

Three rules decide what runs where:

- Lanes stay file-disjoint. A lane is one worker and the files the bead it holds owns. A bead whose files another in-flight bead owns waits until that lane reports back, whatever the frontier says.
- Two heavy beads run at once, a heavy bead being one a worker takes through `artigiano`. Small beads run beside them while the lanes stay apart. Change that cap when I say so.
- Weight follows the usage. The heavy bead goes to the worker on the freshest account, and the loaded accounts take the small beads. A worker whose account sits past 90% in either window takes nothing more until that window resets, and the workbench says which worker is paused and on which account, so I can log in another one.

## Receive

Every report moves the graph before it frees a lane:

- `LANDED <bead-id> <pr or commit>`. Confirm the bead is closed, `bd close <bead-id>` when the worker left it open, and read the frontier again, since the landing may have unblocked more work.
- `BLOCKED <bead-id> <reason>`. Record the reason on the bead, free the lane, and put the blocker in front of me when only I can clear it. When another bead clears it, add the edge, `bd dep add <blocked-id> <blocker-id>`, and let the graph hold it back.
- `FILED <new-bead-id> <why>`. Wire the new bead into the epic: parent it under the epic when it belongs to this work, `bd update <new-bead-id> --parent <epic-id>`, and give it the edges that say what it waits on and what it blocks. A bead with no edges never reaches the frontier query, so it leaves this step with them.

Then assign the freed lane its next bead.

## Keep the workbench

The workbench is one private artifact page I read while you work. Publish it with the Artifact tool, writing the same file path every republish so its URL never moves, and give me that URL the first time you publish it. Regenerate it after every state change: an assignment sent, a report received, an edge added. Build each version from the graph you just read.

One screen carries all of it:

- one column per lane, the worker's name at its head with its account number, that account's weekly usage from your last `bt` read, and the word paused when the usage rule stopped assigning to it
- every bead in the epic with its state, one of ready, claimed, in flight, landed, blocked
- which worker holds which bead
- the last ten messages, newest first
- the frontier count

## Stop

Stop when the frontier is empty and no lane holds a bead. Report what landed with its PR or commit, what is blocked and on what, what you filed into the epic, and the workbench URL.

## Resume after a crash

The graph is the source of truth, so a lost session costs a re-read and nothing else. On restart, read the epic and its children again, take the in-flight beads from their claims, ask the worker holding each one where it stands, republish the workbench from that reading, and carry on.
