---
name: guru
description: "Run bottega's whole method as one prompt, to a PR ready for the owner's merge. Use only when the user asks for a guru run by name; bottega:maestro is the default for work handed to bottega. Never use proactively; a run costs hours of autonomous agent work."
argument-hint: "<task, or issue URL>"
---

# Guru

Take one piece of work from request to a PR ready for the owner's merge: a diff so good a reviewer who was not in the run would merge it without asking for a change. Run it from Claude Code. Fan out subagents and ultracode; set every dispatch's model and effort from [the worker table](../maestro/references/workers.md), and run GPT dispatches per [the codex dispatch method](../maestro/references/codex-dispatch.md).

Work in your own worktree on branch `bottega/<slug>` and write your session id to `.bottega/run/<slug>/owner`. Never merge, approve, or auto-merge: the owner's merge is the release. Don't ask permission: decide on the user's behalf and put every such decision in the PR body, the one most likely to draw a different answer first.

Before any code, find what the user couldn't say. Run a blind spot pass to name what they didn't think to ask about, then interview them one question at a time, architecture-changing questions first, each with your recommended answer so a reply is a yes or a correction. Anything they'd only recognize by seeing, build wildly different directions and let them react to the rendering; never describe a look. For behavior nobody can put into words, get an implementation that already has it and reimplement its semantics here. Running autonomously, follow what the repository already does, and flag in the PR body anything you decided from general convention instead.

Put the agreement in a run contract and failing tests, never in committed spec or plan files. Write the contract as one working file on the branch: the decisions the user is most likely to change first, then the slices with their owned files and the quality bar the critics score against. A failing test turns green through code, never through editing the test. When a decision is expensive to undo and no quick experiment settles it, put it to `bottega:panel` and synthesize the answer yourself. Give the contract one cold read on the plan editor's row before building. It moves in the same commits as the code; delete it before the PR opens, once the tests and the PR body carry what it said.

Fan out one fresh builder per slice on the builder's row; anything coupled gets a single owner working sequentially. Keep the gates green at every integrate, and treat every report as a claim to verify against the real code.

/loop the review until nothing blocking survives a full round. Each round, two really harsh critics read the integrated diff cold, one on the Claude critic's row and one on the GPT critic's row, each given the diff, the repository, and the quality bar, never the contract; where the work has a visible reference, each puts the result beside it, blind, and says which is better and why. Send a fresh worker on the conformance checker's row to check the diff against the contract and the tests. Verify every finding yourself: blockers go to fresh builders, the rest become followup issues.

Hand the accepted head to a fresh worker on the QA driver's row that saw none of the work: every changed scenario driven through the interface a real user uses, evidence recorded per verdict. When a failure comes from a wrong decision, change the decision in the contract and rebuild from it instead of patching the symptom. Every fix re-enters the review.

Open the PR for a reader who was not in the run and watch every check as tracked background Bash. What a code change can fix goes back through build, review, and QA; what only a person can clear, name to the user and leave the PR open. /loop until every check is green and the merge state clean, then report the PR ready and stop.
