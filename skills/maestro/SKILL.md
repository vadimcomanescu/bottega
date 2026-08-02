---
name: maestro
description: Take a task, bug, or issue to a reviewed, evidence-backed PR ready to merge. Use bottega:maestro, or when the user asks bottega for work in their own words. Never use proactively. A run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro
Take the request all the way: decide it, build it, prove it, and hand me a PR that can merge.

## How we work

Ask me first whether to hold it or let it merge. Check you are running on fable-5, if not say and continue only on my OK. Talking and write docs per `bottega:bro` during this session. Four things happen in every run: the worktree and branch, the gates green, the whole diff reviewed for bugs and read against the spec, and the PR. Start the work with `bottega:open`. If codex is not available, replace them with Opus workers same reasoning level. Codex is used through `bottega:use-codex`. The run's state is the worktree, its commits, and the PR, so a later session picks it up from those. If I say stop, stop the workers, commit what they finished. 

# Discover

Run discovery with me, per `bottega:discover`. If there wasn't too much to discover, and it's a trivial task then just go and start building following the process to the end. If it's a considerable task then `bottega:spec` and lets make sure we have captured everything, we might not finish in one session. Tickets updated, throwaway branches with the prototypes, everything settled.

# Set up the direction

Use `bottega:codebase-design` and split the work in vertical slices. Try to make the slices cut a narrow but COMPLETE path through every layer (schema, API, UI, tests), in any case judgement is yours, adjust to the situation. Try to make slices fit smaller context windows. Needless to say, any prefactoring should be done first, making the change easy, then make the easy change. At this point, as you might have blind spots, ask Codex, gpt-5.6 sol xhigh, giving him the spec, artifacts created along the way and your design and plan and ask him: "Would a strong maintainer, after seeing both the current plan and your proposed change, clearly agree that your revision is necessary to satisfy the user or materially better for durable engineering reasons? If yes, revise. If no, the plan is ready." Don't take his feedback blindly, check yourself, apply the revisions you agree with. You own the run. 

# Build it
Ultracode the build through the Workflow tool: as many slices in flight as their files and dependencies allow, each in its own worktree, flowing through its builder, its reviewer, and its fixes. Builders pin to Opus 5 medium, following `bottega:implement`. Each one hands you its slice with the gates green, so each brief carries the repo's quality gates. The reviewer is a fresh Codex sol medium over what its builder built, architecture and code quality included, and the builder fixes the findings, verifying each finding is true and applying its own judgement, not blindly, and reports the gates green again. When there is only one slice, dispatch its builder directly and skip the reviewer: the review of the whole diff comes minutes later and looks at exactly the same code. You integrate the slices yourself.

A worker that hits a question only you can settle asks mid-run: its brief names an answer file, the worker sends the question to the main conversation, and you answer by writing that file.

# Final review
On the final diff, dispatch the closeout seat: one fresh Opus 5 high reviewer that runs `bottega:autoreview` whole over the integrated diff. Hand off the frozen base and all the other artifacts/info required by the review of course. Autoreview supports a single or 2 model panel - decide yourself when you dispatch the reviewer based on the scope and what this work touches - like auth, financials, permissions, destructive operations, you know what i mean. 

# QA
Ultracode through the Workflow tool Opus 5 medium sub agents using `bottega:qa` to go through every visible product surface the work touched the way a user would, judged against the work we had to do (if spec was written, info is there). They should have Codex 5.6 medium counterparts that fix their findings, and they rerun only the affected contract clauses plus any nearby regression probes, focused. They iterate max 2 rounds and if they keep failing they should come back to you for help as we might miss something important - and its your job to be pro-active and steer it in the right direction. 

# Close
Then close the work with `bottega:close`.