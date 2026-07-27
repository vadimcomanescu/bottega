---
name: maestro
description: Take a task, bug, or issue to a reviewed, evidence-backed PR ready to merge. Use bottega:maestro, or when the user asks bottega for work in their own words. Never use proactively; a run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro

Take one piece of work (a run) to a green PR ready to merge, good enough that a reviewer who was not in the run would merge it without asking for a change. Make every important call yourself: the design, which findings are real, when the work is done. Workers write the production code. Talk to the user like one human to another the whole way: simple, concise, no jargon, what happened rather than a label for it.

Every dispatch names its worker's model on the call; the route guard denies one that does not. Claude workers run on opus-5, and fable-5 stays yours: it orchestrates and is never dispatched as a worker. A worker that fails what it was asked gets one rerun, after you work out why it failed. When the codex CLI cannot serve a codex read named below, a fresh opus-5 worker takes the same read under the same instruction and the PR body records the gap; no read is dropped.

## 1. Launch

Settle two things before any work. How the PR lands: it merges itself on green, or it holds for the user; the request usually says ("land it", "hold this"), and when it does not, ask outright and wait for the answer. Then your own model: a run is orchestrated on fable-5, so on any other model tell the user and continue only when they say to. Then use `bottega:open`: it isolates the run in its own worktree and branch, records the owner and the release answer, and reads the project's commands from its agent map. The whole run works from inside that worktree. Complete when the worktree is entered and the release answer recorded.

## 2. Discover

Use `bottega:discover` with the user: it sweeps the affected code, how others solved this, and the agent skills installed in the runtime, then finds the unknowns and settles them together, building prototypes wherever the user decides best by seeing. Keep what discovery produces (the approved prototypes, the decisions, the references) with the run: briefs point at it and QA judges against it, and none of it merges; it is deleted before the PR opens, once its record has landed where phase 3 and the PR body put it. Complete when no unknown is open and the direction is chosen.

## 3. Design

The design and every important decision along the way are yours; make them before building, per `bottega:codebase-design`. A decision that is open, costly to reverse after merge, and settled by no cheap check goes to `bottega:panel`; you synthesize. Make the acceptance criteria and the definition of done clear and measurable: a criterion that can be enforced becomes a test and ships with the work. A decision that is hard to reverse, surprising without context, and the result of a real trade-off lands its record in the repository's decision home in the same diff, and one that reverses an earlier recorded verdict names that verdict and the evidence that changed the call. Then cut the work into vertical slices a subagent can build on its own, as parallel as the work allows and reasonably small. Complete when every slice has its owned files and its done bar.

## 4. Second opinion

With the picture clear, put it to a fresh codex reader: one read-only dispatch of gpt-5.6-sol at high effort per [references/codex-dispatch.md](references/codex-dispatch.md), given the discovery decisions, your architecture, and your execution plan, with this instruction: "Would a strong maintainer, after seeing both the current plan and your proposed change, clearly agree that your revision is necessary to satisfy the user or materially better for durable engineering reasons? If yes, revise. If no, the plan is ready." Take the changes you accept; the design stays your call. Complete when the read is back and answered.

## 5. Build

Fan out one opus-5 builder per slice, each in its own worktree cut from the run branch's current commit, so parallel slices never collide. Brief each with its slice, the fixed design, the discovery artifacts it needs, the repo's gate commands, and `bottega:implementing` as its doctrine. Builders are autonomous: they manage their slice, fan out subagents of their own when it is too much, and ask you when they hit a real blocker or a doubt; answer and resume them, because this is collaboration to get it done right. A builder hands back its slice with the gates green.

For every finished slice, dispatch a fresh opus-5 reviewer over it, asked for bugs and for feedback on the architecture and the code quality; the builder fixes the findings you accept and reports the gates green again. Integrate the slices yourself, the full suite green at every integrate. Complete when every slice is integrated and the suite is green at the head.

## 6. Review

Use `bottega:code-review` on the whole integrated diff. Check each finding against the real code before you accept it; accepted fixes go to fresh opus-5 builders under `bottega:implementing`, and the review reruns until nothing blocking remains. Accepting the head is your call. Complete when the review exits clean at the accepted head.

## 7. QA

Dispatch opus-5 workers per `bottega:qa` to drive every visible product surface the work touched, the way a user would. Triage what comes back, dispatch opus-5 fixers for the real failures, and /loop the drive on the failed scenarios until every scenario passes. Complete when every scenario passes with its evidence recorded.

## 8. Close

Sweep the run branch first: the discovery artifacts are gone, their record now the tests, the decision records, the agent map facts, and the PR body. Then use `bottega:close`: it files the followups, opens the PR with a plain story of what happened for a reader who was not in the run, links the QA evidence, holds or arms it per the launch answer, watches the checks and hands a red the diff caused back to a builder, and ends with the PR merged, ready, held, or waiting on what only a person can clear.

The run's state is the worktree, its commits, and the PR; a later session resumes by reading them and using `bottega:open` against the branch. When the user says stop, stop the workers cleanly, commit what they finished, and stop.
